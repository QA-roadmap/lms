# Тестування WebSocket та gRPC

---

# WebSocket

## Що таке WebSocket

WebSocket — двостороннє **постійне** з'єднання між клієнтом і сервером. Обидві сторони можуть надсилати повідомлення в будь-який момент без нового запиту.

На відміну від HTTP (запит → відповідь → з'єднання закрито), WebSocket тримає з'єднання відкритим весь час.

**Де використовується:** чат, live-оновлення цін, сповіщення, онлайн-ігри, трейдингові платформи, колаборативні редактори.

---

## WebSocket lifecycle

### 1. Handshake (HTTP Upgrade)
```http
GET /ws HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

### 2. З'єднання відкрите — обмін повідомленнями
```json
// Client → Server
{"type": "subscribe", "channel": "prices", "symbol": "BTC"}

// Server → Client (пуш)
{"type": "update", "symbol": "BTC", "price": 67420.5}

// Client → Server (keepalive)
{"type": "ping"}

// Server → Client
{"type": "pong"}
```

### 3. Закриття
```
Client → Server: Close frame (code 1000 — normal closure)
Server → Client: Close frame (echo)
З'єднання закрито
```

### WebSocket Close Codes

| Код | Значення |
|---|---|
| 1000 | Normal closure |
| 1001 | Going away (сервер перезапускається) |
| 1006 | Аномальне закриття (без close frame) |
| 1009 | Message too big |
| 4000–4999 | Кастомні коди додатку |

---

## Тест-кейси для WebSocket

### З'єднання та lifecycle

| # | Тест | Очікуваний результат |
|---|---|---|
| WS-01 | Успішне підключення | 101, з'єднання відкрите |
| WS-02 | Підключення без токена | 401, відхилено |
| WS-03 | Невалідний токен | 401 або close(4001) |
| WS-04 | Прострочений токен під час сесії | Сервер закриває з'єднання |
| WS-05 | Reconnect після розриву | Переприєднання, missed-повідомлення |

### Повідомлення

| # | Тест | Очікуваний результат |
|---|---|---|
| WS-06 | Валідне JSON повідомлення | Сервер обробляє, відповідь/broadcast |
| WS-07 | Невалідний JSON | Error-повідомлення, з'єднання не закривається |
| WS-08 | Порожнє повідомлення | Ігнорується або error |
| WS-09 | Дуже велике повідомлення | Close(1009) або error |
| WS-10 | Порядок повідомлень | Клієнт отримує в правильному порядку |

### Security

| # | Тест | Очікуваний результат |
|---|---|---|
| WS-11 | ws:// замість wss:// | Відхилено в продакшені |
| WS-12 | Origin з чужого домену | Відхилено |
| WS-13 | Підписка на чужий channel | Не отримує чужі повідомлення |
| WS-14 | Flood повідомленнями (1000/сек) | Rate limiting, не падає |

### Edge Cases

| # | Тест | Очікуваний результат |
|---|---|---|
| WS-15 | Розрив мережі | Сервер детектує через heartbeat |
| WS-16 | Кілька з'єднань одного юзера | Немає дублювання повідомлень |
| WS-17 | Одночасні повідомлення від N клієнтів | Немає race conditions |

---

## Інструменти для WebSocket

### Postman
```
New Request → WebSocket Request
URL: wss://api.example.com/ws?token=abc
Connect → Send Messages
```

### wscat (CLI)
```bash
npm install -g wscat

# Підключитись
wscat -c wss://api.example.com/ws

# З авторизацією
wscat -c wss://api.example.com/ws \
  -H "Authorization: Bearer TOKEN"

# Надіслати повідомлення
> {"type": "subscribe", "channel": "prices"}
< {"type": "subscribed", "channel": "prices"}
```

### Browser DevTools
```
Network → WS → вибрати з'єднання → Messages
Видно всі фрейми в реальному часі з timestamp
```

---

# gRPC

## Що таке gRPC

gRPC — RPC-фреймворк від Google поверх **HTTP/2** з бінарним протоколом **Protocol Buffers**.

| | REST | gRPC |
|---|---|---|
| Протокол | HTTP/1.1 або 2 | HTTP/2 |
| Формат | JSON (текст) | Protocol Buffers (бінарний) |
| Контракт | OpenAPI/Swagger | `.proto` файл |
| Стрімінг | Ні (тільки SSE) | 4 типи |
| Швидкість | Середня | Дуже висока |

**Де використовується:** мікросервісна комунікація, real-time streaming, mobile backends, гейтвеї.

---

## .proto файл — основа gRPC

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
  rpc CreateUser (stream CreateUserRequest) returns (CreateSummary);
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}

message GetUserRequest {
  int64 user_id = 1;
}

message User {
  int64  id    = 1;
  string name  = 2;
  string email = 3;
}
```

---

## 4 типи gRPC комунікації

### 1. Unary RPC — один запит → одна відповідь

```
Client: GetUser(id: 42)  →
                          ← Server: User{id: 42, name: "Anna"}
```

**Тест-кейси:**
- Валідний запит → OK + об'єкт
- Неіснуючий ID → NOT_FOUND
- ID = 0 або від'ємний → INVALID_ARGUMENT
- Без metadata (токен) → UNAUTHENTICATED
- Чужий ресурс → PERMISSION_DENIED

### 2. Server Streaming — один запит → потік відповідей

```
Client: WatchPrices("BTC")  →
                             ← Server: {price: 67420}
                             ← Server: {price: 67430}
                             ← Server: {price: 67415}
                             ← Server: END_STREAM
```

**Тест-кейси:**
- Стрім запускається → перше повідомлення прийшло
- Формат кожного повідомлення → всі поля присутні
- Закриття стріму → клієнт отримує END_STREAM
- Скасування клієнтом → сервер зупиняє відправку
- Помилка посеред стріму → клієнт отримує status error

### 3. Client Streaming — потік запитів → одна відповідь

```
Client: Metric{name: "cpu", value: 80}  →
Client: Metric{name: "mem", value: 60}  →
Client: Metric{name: "disk", value: 45} →
Client: END_STREAM                      →
                                         ← Server: Summary{recorded: 3}
```

**Тест-кейси:**
- Відправити N повідомлень → `summary.recorded = N`
- Порожній стрім → обробляється gracefully
- Одне невалідне з N → `summary.failed = 1`
- Клієнт не закрив стрім → server timeout

### 4. Bidirectional Streaming — потік ↔ потік

```
Client: ChatMessage →
                     ← Server: ChatMessage
Client: ChatMessage →
                     ← Server: ChatMessage
```

**Тест-кейси:**
- Обидва стріми відкриті → повідомлення йдуть в обидві сторони
- Клієнт закрив вхідний стрім → сервер доопрацьовує і закривається
- Помилка в одному стрімі → другий також закривається

---

## gRPC статус коди (замість HTTP)

| gRPC код | Аналог HTTP | Коли виникає |
|---|---|---|
| `OK` | 200 | Успіх |
| `NOT_FOUND` | 404 | Ресурс не існує |
| `INVALID_ARGUMENT` | 400 | Невалідний вхід |
| `UNAUTHENTICATED` | 401 | Відсутній або невалідний токен |
| `PERMISSION_DENIED` | 403 | Немає прав |
| `ALREADY_EXISTS` | 409 | Дублікат |
| `RESOURCE_EXHAUSTED` | 429 | Rate limit |
| `UNAVAILABLE` | 503 | Сервіс недоступний |
| `DEADLINE_EXCEEDED` | 504 | Таймаут |
| `INTERNAL` | 500 | Внутрішня помилка |

---

## Інструменти для gRPC

### grpcurl (основний інструмент)
```bash
# Перелік сервісів
grpcurl -plaintext localhost:50051 list

# Перелік методів сервісу
grpcurl -plaintext localhost:50051 list UserService

# Виклик методу
grpcurl -plaintext \
  -d '{"user_id": 42}' \
  localhost:50051 \
  UserService/GetUser

# З авторизацією
grpcurl \
  -H "authorization: Bearer TOKEN" \
  -d '{"user_id": 42}' \
  api.example.com:443 \
  UserService/GetUser

# Server streaming
grpcurl -plaintext \
  -d '{"symbol": "BTC"}' \
  localhost:50051 \
  PriceService/WatchPrice
```

### Postman
```
New Request → gRPC
URL: grpc://localhost:50051
Import .proto файл → вибрати метод → заповнити поля
```

### Evans (інтерактивний REPL)
```bash
evans --host localhost --port 50051 --proto user.proto

# В REPL:
> package user
> service UserService
> call GetUser
user_id (TYPE_INT64) => 42
```

---

## WebSocket vs gRPC: ключова різниця

| | WebSocket | gRPC |
|---|---|---|
| **Схема** | Немає (домовляються неформально) | Строга (.proto файл) |
| **Формат** | Будь-який (JSON, binary) | Protocol Buffers |
| **Тип зв'язку** | Браузер ↔ Сервер | Сервіс ↔ Сервіс |
| **Типізація** | Ручна валідація | Компілятор гарантує |
| **Тестування** | Lifecycle + структура вручну | Бізнес-логіка + статус коди |

---

## Питання на співбесіді

### «Чим WebSocket відрізняється від HTTP?»
> HTTP — запит-відповідь, після відповіді з'єднання закривається. WebSocket — постійне двостороннє з'єднання, обидві сторони можуть надсилати повідомлення в будь-який момент без нового запиту.

### «Яка різниця між REST і gRPC?»
> REST — HTTP/1.1, JSON, один ресурс = один URL. gRPC — HTTP/2, Protocol Buffers (бінарний), контракт у .proto файлі, підтримує 4 типи стрімінгу. gRPC значно швидший для мікросервісної комунікації.

### «Що таке metadata в gRPC?»
> Metadata в gRPC — аналог HTTP headers. Використовується для передачі авторизаційних токенів, трейсинг ID, локалізації. Передається поза тілом повідомлення.

### «Як тестувати gRPC без UI?»
> За допомогою grpcurl (CLI), Evans (REPL), або Postman з підтримкою gRPC. grpcurl дозволяє викликати будь-який метод з командного рядка і передавати JSON-аргументи.
