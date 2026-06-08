# Тестування GraphQL API

## GraphQL vs REST: ключові відмінності

| | REST | GraphQL |
|---|---|---|
| **Ендпоінти** | Багато (`/users`, `/posts`) | Один (`POST /graphql`) |
| **HTTP методи** | GET, POST, PUT, DELETE | Завжди POST |
| **Помилка** | HTTP 4xx/5xx | HTTP 200, але `errors[]` у тілі |
| **Дані** | Сервер вирішує що повернути | Клієнт описує що хоче |
| **Over-fetching** | Часто є зайві поля | Ні — тільки запитані поля |

> ⚠️ **Головна пастка:** статус 200 не означає успіх. Завжди перевіряй наявність поля `errors` у відповіді!

---

## Три типи операцій

### 1. Query — читання даних

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      title
    }
  }
}
```

**Змінні (Variables):**
```json
{ "id": "42" }
```

**Успішна відповідь:**
```json
{
  "data": {
    "user": {
      "id": "42",
      "name": "Anna",
      "email": "a@test.com",
      "posts": [{"title": "Hello"}]
    }
  }
}
```

**Тест-кейси:**
- Запит існуючого ресурсу → `data` містить об'єкт, `errors` відсутній
- Неіснуючий ID → `data.user: null`, `errors[]` з повідомленням
- Запит частини полів → відповідь містить тільки ці поля
- Без авторизації → `errors[]` з UNAUTHORIZED
- Без обов'язкового аргументу → `errors[]` з validation error

---

### 2. Mutation — зміна даних

```graphql
mutation CreatePost($title: String!, $body: String!) {
  createPost(title: $title, body: $body) {
    id
    title
    createdAt
  }
}
```

**Відповідь з помилкою:**
```json
{
  "data": null,
  "errors": [
    {
      "message": "Title is required",
      "locations": [{"line": 2, "column": 3}],
      "path": ["createPost"],
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

**Тест-кейси:**
- Успішне створення → `data` містить новий об'єкт з ID
- Порожній обов'язковий рядок → `errors[]` з validation
- Дублікат унікального поля → `errors[]` з CONFLICT
- Без авторизації → `errors[]` з UNAUTHORIZED
- З правами read-only → `errors[]` з FORBIDDEN
- Перевірка в БД після mutation → дані реально збереглись

---

### 3. Subscription — real-time оновлення

```graphql
subscription OnMessageAdded($chatId: ID!) {
  messageAdded(chatId: $chatId) {
    id
    text
    author { name }
    sentAt
  }
}
```

Підписки працюють через **WebSocket**.

**Тест-кейси:**
- Підключення → WebSocket відкривається, отримуємо `connection_ack`
- Після trigger-mutation → клієнт отримує payload
- Підписка на чужий чат → не отримує повідомлення (авторизація!)
- Відключення і реконнект → поведінка при втраті з'єднання
- Кілька підписників → всі отримують подію

---

## Специфічні GraphQL баги

### 1. Introspection у продакшені (Security)
```graphql
{ __schema { types { name fields { name } } } }
```
Introspection повертає повну схему API. У продакшені має бути **вимкнено**.

**Тест:** відправити introspection query в prod → очікуємо помилку, не дані.

---

### 2. Field-level авторизація (Security)
```graphql
query {
  user(id: "42") {
    name
    salary        # звичайний юзер не повинен бачити
    internalNote  # адмінське поле
  }
}
```

**Тест:** залогінитись як звичайний юзер і запросити admin-only поля → очікуємо `null` або `errors[]`. Якщо дані повертаються — критичний баг.

---

### 3. N+1 проблема (Performance)
```graphql
query {
  posts {      # 1 запит до БД
    title
    author {   # N запитів — по одному на кожен post!
      name
    }
  }
}
```

**Тест:** запросити список з 100+ елементів з вкладеними об'єктами → виміряти час відповіді. Різниця в рази порівняно з запитом без вкладень — індикатор N+1.

---

### 4. Глибоко вкладені запити (DoS)
```graphql
query {
  user(id:"1") { friends { friends {
    friends { friends { friends {
      name
    }}
  }}}
}}
```

**Тест:** запит глибиною 10–20 рівнів → сервер повинен відхилити з `"Max depth exceeded"`, не зависнути.

---

### 5. Partial success — data + errors одночасно
```json
{
  "data": {
    "user": { "name": "Anna" },
    "posts": null
  },
  "errors": [{
    "message": "Posts service unavailable",
    "path": ["posts"]
  }]
}
```

GraphQL може повернути **і** `data` **і** `errors` одночасно. Якщо клієнт перевіряє тільки наявність `data` — він пропустить помилку.

**Правило:** у кожному тесті перевіряй і `data`, і відсутність `errors`.

---

### 6. Nullable vs Non-null поля
```graphql
type User {
  id: ID!      # non-null — ніколи не буде null
  name: String # nullable — може бути null
  email: String! # non-null
}
```

Якщо сервер повертає `null` для non-null поля — GraphQL анулює весь батьківський об'єкт.

**Тест:** перевірити крайові кейси де поле може бути відсутнім у БД.

---

## Тестування в Postman

```
1. New Request → GraphQL
2. URL: https://api.example.com/graphql
3. Вкладка "Query" — пишеш операцію
4. Вкладка "Variables" — JSON зі змінними
5. Headers: Authorization: Bearer <token>
```

**Обов'язкові перевірки в Tests:**
```javascript
// GraphQL-специфічна перевірка
pm.test("No errors in response", () => {
    const json = pm.response.json();
    pm.expect(json.errors).to.be.undefined;
});

pm.test("Data exists", () => {
    const json = pm.response.json();
    pm.expect(json.data).to.not.be.null;
});

pm.test("Status 200", () => {
    pm.response.to.have.status(200);
});
```

---

## Checklist тестування GraphQL

### Query
- [ ] Статус завжди 200
- [ ] `errors` відсутній при успіху
- [ ] Відповідь містить тільки запитані поля
- [ ] Типи даних відповідають схемі
- [ ] Вкладені об'єкти повертаються коректно
- [ ] Неіснуючий ресурс → `null`, не краш

### Mutation
- [ ] Статус 200 при успіху
- [ ] `data` містить створений/змінений об'єкт
- [ ] Дані реально змінились у БД
- [ ] Валідація обов'язкових полів
- [ ] Авторизація перевірена

### Security
- [ ] Introspection вимкнено в prod
- [ ] Field-level авторизація для чутливих полів
- [ ] Глибоко вкладені запити відхиляються
- [ ] Rate limiting на мутації

---

## Питання на співбесіді

### «Чим GraphQL відрізняється від REST?»
> В REST є багато ендпоінтів і HTTP методи несуть семантику. В GraphQL один ендпоінт, завжди POST, і клієнт сам описує які дані хоче отримати. Ключова різниця для тестування: помилки в GraphQL не означають поганий HTTP статус — помилки живуть у полі `errors` тіла при статусі 200.

### «Як перевіряти помилки в GraphQL?»
> Завжди перевіряти наявність поля `errors` у відповіді, навіть якщо HTTP статус 200. Статус 200 в GraphQL не означає що запит виконався успішно.

### «Що таке N+1 проблема?»
> Якщо запитуєш список об'єктів з вкладеними даними, і resolver не оптимізований — сервер робить 1 запит до БД для списку і ще N запитів для кожного вкладеного об'єкта. При 100 елементах це 101 запит замість 2.
