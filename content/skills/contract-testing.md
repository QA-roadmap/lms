# Contract Testing: що це і навіщо потрібен

## Проблема без contract testing

В мікросервісній архітектурі команди деплоять сервіси незалежно. Ніхто не знає що змінив сусід.

```
Frontend очікує: {"orderId": 42, "status": "pending", "total": 150.00}
Orders API повернув: {"orderId": 42, "status": "pending", "amount": 150.00}
                                                            ^^^^^^
                               Розробник перейменував "total" на "amount"
                               Ніхто не попередив Frontend команду
                               → Frontend тихо ламається у продакшені
```

### Три найпоширеніші способи зламати контракт

**1. Перейменування поля**
```
Було:   {"userId": 42, "total": 150.00}
Стало:  {"userId": 42, "amount": 150.00}
```

**2. Зміна типу даних**
```
Було:   {"orderId": 42}       // number
Стало:  {"orderId": "ORD-42"} // string
```

**3. Видалення обов'язкового поля**
```
Було:   {"status": "pending", "estimatedDate": "2026-06-10"}
Стало:  {"status": "pending"}
        // estimatedDate видалено — "не використовувалось"
```

---

## Що таке Contract Testing

Contract testing — підхід де Consumer (хто споживає API) і Provider (хто надає API) незалежно верифікують що їхня взаємодія відповідає узгодженому контракту.

```
Consumer  →  [Контракт]  →  Provider
(Frontend)    (JSON файл)   (Orders API)

Consumer генерує контракт: «Очікую поля X, Y, Z»
Provider верифікує: «Чи виконую я цей контракт?»
```

### Contract Testing vs Integration Testing

| | Unit | Integration | Contract |
|---|---|---|---|
| Що перевіряє | Логіку всередині | Реальну взаємодію | Сумісність структури |
| Обидва сервіси | Ні | Так | Ні (окремо) |
| Швидкість | Миттєво | Повільно | Швидко |
| Breaking changes | Ні | Так, але пізно | Так, одразу |

---

## Pact — Consumer-Driven Contract Testing

### Принцип
Контракт пишеться з точки зору **Consumer** — що він очікує від Provider. Не навпаки.

### Pact workflow

```
1. Consumer пише тест → Pact генерує контракт-файл
2. Контракт публікується в Pact Broker
3. Provider завантажує контракт і верифікує
4. CI/CD перевіряє: can-i-deploy перед релізом
```

---

### Крок 1: Consumer пише Pact-тест

```javascript
// JavaScript / Pact-JS
const { Pact } = require('@pact-foundation/pact');

const provider = new Pact({
  consumer: 'Frontend',
  provider: 'OrdersAPI'
});

await provider.addInteraction({
  state: 'order 1 exists',
  uponReceiving: 'a request for order 1',
  withRequest: {
    method: 'GET',
    path: '/orders/1'
  },
  willRespondWith: {
    status: 200,
    body: {
      orderId: like(1),        // будь-яке число
      status: term({           // один з варіантів
        matcher: 'pending|confirmed|shipped',
        generate: 'pending'
      }),
      total: like(150.00)      // будь-який number
    }
  }
});
```

---

### Крок 2: Pact генерує контракт-файл

```json
{
  "consumer": { "name": "Frontend" },
  "provider": { "name": "OrdersAPI" },
  "interactions": [{
    "description": "a request for order 1",
    "providerState": "order 1 exists",
    "request": { "method": "GET", "path": "/orders/1" },
    "response": {
      "status": 200,
      "body": {
        "orderId": 1,
        "status": "pending",
        "total": 150.00
      },
      "matchingRules": {
        "$.body.orderId": { "match": "type" },
        "$.body.total":   { "match": "type" }
      }
    }
  }]
}
```

---

### Крок 3: Публікація в Pact Broker

```bash
# CI pipeline Consumer-а
pact-broker publish ./pacts \
  --broker-base-url https://broker.example.com \
  --consumer-app-version $GIT_SHA \
  --tag main
```

Broker зберігає всі версії контрактів і відстежує сумісність між версіями сервісів.

---

### Крок 4: Provider верифікація

```javascript
// provider verification (Node.js)
const { Verifier } = require('@pact-foundation/pact');

new Verifier({
  provider: 'OrdersAPI',
  providerBaseUrl: 'http://localhost:3000',
  pactBrokerUrl: 'https://broker.example.com',
  providerVersion: process.env.GIT_SHA,

  // Підготовка стану БД для кожного тесту
  stateHandlers: {
    'order 1 exists': async () => {
      await db.seed({ id: 1, status: 'pending', total: 150 });
    }
  }
}).verifyProvider();
```

Якщо Provider перейменував `total` на `amount` — верифікація падає **тут**, в CI Provider-а, ще до merge.

---

### Крок 5: Can I Deploy

```bash
# Перевірка перед деплоєм
pact-broker can-i-deploy \
  --pacticipant OrdersAPI \
  --version $GIT_SHA \
  --to production

# Результати:
# ✓ Computer says yes!  → деплой дозволено
# ✗ Computer says no!
#   Reason: Frontend v1.2.4 expects field "total"
#   but OrdersAPI v2.0.0 returns "amount"
```

---

## OpenAPI Contract Testing (простіший підхід)

Якщо вже є Swagger/OpenAPI специфікація — можна валідувати відповіді прямо в Postman:

```javascript
// Postman — перевірка JSON Schema
pm.test("Response matches schema", () => {
    const schema = {
        type: "object",
        required: ["orderId", "status", "total"],
        properties: {
            orderId: { type: "number" },
            status: {
                type: "string",
                enum: ["pending", "confirmed", "shipped"]
            },
            total: { type: "number", minimum: 0 }
        },
        additionalProperties: false // заборонити зайві поля
    };
    pm.response.to.have.jsonSchema(schema);
});
```

Це простіше ніж Pact, але перевіряє тільки одну сторону (Provider).

---

## Коли впроваджувати Contract Testing

### Варто якщо:
- Мікросервісна архітектура з незалежними командами
- Сервіси деплояться незалежно
- Були випадки «у мене працює, у тебе ні» після деплою
- Немає зручного способу запустити всю систему локально

### Не потрібен якщо:
- Моноліт де все в одному репозиторії
- Маленька команда де всі знають про всі зміни
- Публічне API з суворим версіонуванням (v1/, v2/)

---

## Питання на співбесіді

### «Що таке contract testing?»
> Підхід де Consumer і Provider незалежно верифікують сумісність структури даних. Consumer генерує контракт (що він очікує), Provider верифікує (чи виконує він цей контракт). Якщо Provider ламає контракт — CI/CD блокує деплой ще до продакшену.

### «Чим відрізняється від integration testing?»
> Integration testing запускає обидва сервіси реально і перевіряє взаємодію — повільно і потребує повного оточення. Contract testing перевіряє кожен сервіс незалежно через контракт-файл — швидко і без залежностей.

### «Що таке Consumer-Driven Contract?»
> Контракт пишеться з точки зору Consumer — того хто споживає API. Він описує мінімум що йому потрібно: які поля, які типи. Provider зобов'язується виконувати цей контракт незалежно від власних змін.
