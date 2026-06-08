# REST API тестування: методи, статус коди, авторизація

## Основи REST API

**REST** (Representational State Transfer) — архітектурний стиль для побудови API.

Ключові принципи:
- Один URL = один ресурс (`/users/42`)
- HTTP метод визначає дію (`GET`, `POST`, `DELETE`...)
- Відповідь у JSON (або XML)
- Stateless — кожен запит незалежний

---

## HTTP Методи

### Таблиця методів

| Метод | Призначення | Idempotent | Safe |
|---|---|---|---|
| **GET** | Отримати ресурс | Так | Так |
| **POST** | Створити ресурс | Ні | Ні |
| **PUT** | Повністю замінити ресурс | Так | Ні |
| **PATCH** | Частково оновити ресурс | Ні* | Ні |
| **DELETE** | Видалити ресурс | Так | Ні |
| **HEAD** | Як GET, але без тіла | Так | Так |

> **Idempotent** — повторний виклик дає той самий результат  
> **Safe** — не змінює стан сервера

### GET
```http
GET /api/users/42
Authorization: Bearer eyJhbGc...

200 OK
{"id": 42, "name": "Anna", "email": "a@test.com"}
```

**Тест-кейси:**
- Отримати існуючий ресурс → 200 з даними
- Неіснуючий ID → 404
- Без авторизації → 401
- Фільтрація, пагінація, сортування

### POST
```http
POST /api/users
Content-Type: application/json

{"name": "Anna", "email": "a@test.com"}

201 Created
Location: /api/users/43
{"id": 43, "name": "Anna", "email": "a@test.com"}
```

**Тест-кейси:**
- Успішне створення → 201 з Location header
- Дублікат → 409 Conflict
- Невалідне тіло → 400
- Без обов'язкового поля → 422

### PUT vs PATCH

```http
# PUT — замінює ВСІ поля
PUT /api/users/42
{"name": "Anna K.", "email": "a@test.com", "role": "admin"}
# Поля яких немає в запиті — можуть обнулитись!

# PATCH — змінює ТІЛЬКИ вказані поля
PATCH /api/users/42
{"name": "Anna K."}
# email і role залишаються без змін
```

### DELETE
```http
DELETE /api/users/42

204 No Content  (успіх без тіла)

# Повторний DELETE:
DELETE /api/users/42
404 Not Found  (або 204 — обидва варіанти прийнятні)
```

---

## HTTP Статус Коди

### 2xx — Успіх

| Код | Назва | Коли використовується |
|---|---|---|
| **200** | OK | GET, PUT, PATCH — повертають дані |
| **201** | Created | POST — ресурс створено |
| **204** | No Content | DELETE або PATCH без тіла відповіді |
| **206** | Partial Content | Завантаження файлів по частинах |

### 3xx — Перенаправлення

| Код | Назва | Коли |
|---|---|---|
| **301** | Moved Permanently | Ресурс переміщено назавжди |
| **304** | Not Modified | Кешована версія актуальна |

### 4xx — Помилка клієнта (найважливіша група для QA)

| Код | Назва | Коли |
|---|---|---|
| **400** | Bad Request | Некоректний синтаксис, невалідний JSON |
| **401** | Unauthorized | Токен відсутній, прострочений, невалідний |
| **403** | Forbidden | Авторизований, але немає прав |
| **404** | Not Found | Ресурс не існує |
| **405** | Method Not Allowed | DELETE на read-only ресурсі |
| **409** | Conflict | Дублікат унікального поля |
| **422** | Unprocessable Entity | Синтаксис правильний, але семантика невалідна |
| **429** | Too Many Requests | Rate limiting |

### 5xx — Помилка сервера

| Код | Назва | Коли |
|---|---|---|
| **500** | Internal Server Error | Баг у коді сервера |
| **502** | Bad Gateway | Проксі отримав невалідну відповідь |
| **503** | Service Unavailable | Сервіс перевантажений або на обслуговуванні |
| **504** | Gateway Timeout | Таймаут upstream сервісу |

### Найчастіші питання на співбесіді

#### 401 vs 403
| | 401 | 403 |
|---|---|---|
| **Суть** | «Я не знаю хто ти» | «Я знаю хто ти, але ти не маєш прав» |
| **Причина** | Відсутній або невалідний токен | Токен валідний, але недостатньо прав |
| **Рішення** | Авторизуватись | Запросити доступ |

#### 400 vs 422
| | 400 | 422 |
|---|---|---|
| **Суть** | Помилка синтаксису | Синтаксис правильний, семантика ні |
| **Приклад** | Зламаний JSON, неправильний тип | Вік -5, email без домену |

---

## Авторизація та Автентифікація

> **Автентифікація** — «Хто ти?» (підтвердження особи)  
> **Авторизація** — «Що тобі можна?» (перевірка прав)

### API Key

```http
# В header (рекомендовано)
X-API-Key: abc123xyz

# В URL (не рекомендовано — потрапляє в логи)
GET /api/data?api_key=abc123xyz
```

**Тест-кейси:**
- Валідний ключ → 200
- Відсутній ключ → 401
- Невалідний ключ → 401
- Прострочений ключ → 401

### Basic Auth

```http
Authorization: Basic dXNlcjpwYXNz
# dXNlcjpwYXNz = base64("user:pass")
```

> ⚠️ Base64 — не шифрування! Безпечний **тільки через HTTPS**.

**Тест-кейси:**
- Валідні credentials → 200
- Неправильний пароль → 401
- Порожній пароль → 401

### Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Тест-кейси:**
- Валідний токен → 200
- Прострочений токен → 401 (не 403!)
- Зламаний токен (змінені символи) → 401
- Токен іншого користувача → 403 (IDOR!)
- `Bearer` без пробілу → 400 або 401

### JWT (JSON Web Token)

Структура: `Header.Payload.Signature`

```
eyJhbGciOiJIUzI1NiJ9          ← Header (base64)
.eyJ1c2VySWQiOjQyLCJyb2xlIjoiYWRtaW4ifQ  ← Payload (base64)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
```

**Payload після декодування:**
```json
{
  "userId": 42,
  "role": "admin",
  "exp": 1720000000
}
```

**Тест-кейси:**
- Валідний JWT → 200
- Змінений payload (підвищення прав) → 401
- `exp` в минулому → 401
- Алгоритм `none` → має відхилятись
- Payload читається без ключа — не зберігай паролі у JWT!

### OAuth 2.0

```
1. Client → Authorization Server: запит дозволу
2. Користувач підтверджує доступ
3. AS → Client: authorization_code
4. Client → AS: code → access_token + refresh_token
5. Client → API: Bearer access_token
```

**Тест-кейси:**
- access_token валідний → 200
- access_token прострочений → 401, refresh → новий токен
- refresh_token прострочений → повторний логін
- Scope перевищення → 403
- Відкликаний токен → 401

---

## Що перевіряти в кожному API тесті

### 1. Статус код
```javascript
// Postman
pm.test("Status 200", () => pm.response.to.have.status(200));
```

### 2. Структура відповіді
```javascript
pm.test("Has required fields", () => {
    const body = pm.response.json();
    pm.expect(body).to.have.property('id');
    pm.expect(body).to.have.property('name');
    pm.expect(typeof body.id).to.equal('number');
});
```

### 3. Headers
```javascript
pm.test("Content-Type is JSON", () => {
    pm.expect(pm.response.headers.get('Content-Type'))
      .to.include('application/json');
});
```

### 4. Response time
```javascript
pm.test("Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### 5. IDOR (Insecure Direct Object Reference)
```
Залогінитись як user_A (id: 1)
GET /api/users/2  ← підставити ID user_B
→ Очікуємо: 403 Forbidden
→ Якщо 200 з даними user_B — КРИТИЧНИЙ БАГ
```

---

## Checklist API тесту

- [ ] Статус код відповідає очікуваному
- [ ] Тіло відповіді містить всі обов'язкові поля
- [ ] Типи даних правильні (`"id": 42`, не `"id": "42"`)
- [ ] Content-Type: application/json
- [ ] Response time в межах норми
- [ ] Без авторизації → 401
- [ ] З неправильними правами → 403
- [ ] Невалідні дані → 400 або 422 з описом помилки
- [ ] Немає стек-трейсів у відповіді на помилки
- [ ] IDOR: недоступні чужі ресурси

---

## Питання на співбесіді

### «Чим PUT відрізняється від PATCH?»
> PUT повністю замінює ресурс — всі поля потрібно передавати. PATCH оновлює тільки вказані поля, решта залишається без змін.

### «Що таке idempotent метод?»
> Метод, повторний виклик якого дає той самий результат. GET, PUT, DELETE — idempotent. POST — ні (кожен виклик створює новий ресурс).

### «Яка різниця між 401 і 403?»
> 401 — сервер не знає хто робить запит (немає або невалідний токен). 403 — сервер знає хто робить запит, але у цього користувача немає прав на дану дію.
