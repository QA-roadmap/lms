# Безпека для тестувальника: OWASP Top 10, SQL injection, XSS, IDOR, auth bypass

## Чому QA тестує безпеку

Security testing — не тільки задача пентестерів. QA інженер першим бачить API і UI, першим може виявити очевидні вразливості. Базові security перевірки входять до обов'язків Middle+ QA у 2026.

> Shift-left security: краще знайти IDOR на staging ніж дізнатись про злам у продакшені.

---

## OWASP Top 10 — що це і навіщо

OWASP (Open Web Application Security Project) — організація що публікує список 10 найпоширеніших вразливостей веб-додатків. Це стандартний чеклист для security тестування.

| # | Вразливість | Простий опис |
|---|---|---|
| A01 | Broken Access Control | Можна отримати доступ до чужих даних |
| A02 | Cryptographic Failures | Слабке шифрування, передача паролів у відкритому вигляді |
| A03 | Injection | SQL, команди ОС через поля введення |
| A04 | Insecure Design | Архітектурні помилки безпеки |
| A05 | Security Misconfiguration | Дефолтні паролі, зайві права, відкриті порти |
| A06 | Vulnerable Components | Застарілі бібліотеки з відомими CVE |
| A07 | Auth Failures | Слабкі паролі, брутфорс, незахищені токени |
| A08 | Integrity Failures | Підміна даних, незахищені CI/CD |
| A09 | Security Logging Failures | Немає логів атак, немає алертів |
| A10 | SSRF | Сервер робить запити від імені зловмисника |

---

## SQL Injection

### Що це

Зловмисник вставляє SQL код у поля введення. Якщо запит будується конкатенацією рядків — SQL виконується на сервері.

### Тест-кейси

```sql
-- Базові payload для тестування полів вводу
' OR '1'='1
' OR '1'='1'--
'; DROP TABLE users--
1 UNION SELECT * FROM users--
' OR 1=1--
admin'--
' OR 'x'='x

-- У числових полях
1 OR 1=1
1; SELECT * FROM users
```

### Де тестувати

```
Поля форм: логін, пошук, фільтри, коментарі
URL параметри: /products?id=1 → /products?id=1 OR 1=1
Headers: Cookie, User-Agent, Referer
JSON body: {"id": "1 OR 1=1"}
```

### Очікуваний результат

```
Безпечна система:
  → Помилка валідації або 400 Bad Request
  → Загальне повідомлення: "Invalid input"
  → Запит відхилено, дані не повертаються

Вразливість:
  → Повертаються зайві записи БД
  → SQL помилка у відповіді (витік структури)
  → 500 Internal Server Error (ознака injection)
  → Успішний вхід без пароля
```

### Тест у Postman / API

```javascript
// Postman Tests
pm.test("No SQL injection vulnerability", () => {
    const body = pm.response.text()

    // SQL помилки у відповіді — ознака вразливості
    const sqlErrors = [
        "SQL syntax",
        "mysql_fetch",
        "ORA-01756",
        "Microsoft OLE DB",
        "Unclosed quotation mark",
        "syntax error"
    ]

    sqlErrors.forEach(err => {
        pm.expect(body.toLowerCase())
          .to.not.include(err.toLowerCase())
    })

    // Статус не 500
    pm.expect(pm.response.code).to.not.equal(500)
})
```

---

## XSS — Cross-Site Scripting

### Що це

Зловмисник вставляє JavaScript код у поля що відображаються іншим користувачам. Код виконується у браузері жертви.

### Типи XSS

| Тип | Опис | Де шукати |
|---|---|---|
| **Reflected** | Payload у URL, одразу відображається | Параметри пошуку, повідомлення про помилки |
| **Stored** | Payload збережено в БД, виконується для всіх | Коментарі, профіль, назви, описи |
| **DOM-based** | Маніпуляція DOM без серверного round-trip | SPA додатки, client-side рендеринг |

### Тест payload

```html
<!-- Базові перевірки -->
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
javascript:alert(1)

<!-- Обхід фільтрів -->
<ScRiPt>alert('XSS')</ScRiPt>
<img src="x" ONERROR="alert(1)">
"><script>alert(1)</script>
'><img src=x onerror=alert(1)>

<!-- У JSON -->
{"name": "<script>alert(1)</script>"}

<!-- URL encoding -->
%3Cscript%3Ealert(1)%3C/script%3E
```

### Де тестувати

```
Форми: ім'я, коментар, опис, тег, пошук
URL параметри: ?search=<script>alert(1)</script>
HTTP Headers: User-Agent, Referer (якщо логуються і відображаються)
File upload: назва файлу з XSS payload
```

### Очікуваний результат

```
Безпечна система:
  → Payload екранується: &lt;script&gt;alert(1)&lt;/script&gt;
  → Відображається як текст, не виконується
  → Або відхиляється з помилкою валідації

Вразливість:
  → Alert спливає у браузері
  → Payload у HTML без екранування
  → Виконання JavaScript коду
```

---

## IDOR — Insecure Direct Object Reference

### Що це

Один з найпоширеніших багів. Клієнт може підставити чужий ID у запит і отримати/змінити чужі дані. Сервер не перевіряє чи ресурс належить поточному користувачу.

### Тест-кейси

```
1. Реєструємо двох користувачів:
   userA: id=1, email=a@test.com
   userB: id=2, email=b@test.com

2. Логінимось як userA (отримуємо токен A)

3. Підставляємо ID userB у запити:
   GET  /api/users/2          → 403 очікується
   GET  /api/orders/2         → 403 очікується
   PUT  /api/users/2          → 403 очікується
   DELETE /api/users/2        → 403 очікується

4. Якщо отримуємо дані userB — IDOR баг
```

### Автоматизація в Playwright

```typescript
test('IDOR: cannot access other user data', async ({ request }) => {
    // Логін userA
    const loginA = await request.post('/api/auth/login', {
        data: { email: 'userA@test.com', password: 'passA' }
    })
    const { token: tokenA } = await loginA.json()

    // Отримати ID userB через окремий акаунт
    const loginB = await request.post('/api/auth/login', {
        data: { email: 'userB@test.com', password: 'passB' }
    })
    const { userId: userBId } = await loginB.json()

    // Спроба userA отримати дані userB
    const response = await request.get(`/api/users/${userBId}`, {
        headers: { Authorization: `Bearer ${tokenA}` }
    })

    // Повинно бути 403 або 404
    expect([403, 404]).toContain(response.status())
})
```

### Варіації IDOR

```
Горизонтальна IDOR: той самий рівень прав, чужі дані
  GET /api/invoices/123  (чужий інвойс)

Вертикальна IDOR: підвищення привілеїв
  GET /api/admin/users   (без адмін прав)
  PUT /api/users/1/role  {"role": "admin"}

IDOR через масові параметри:
  POST /api/orders {"userId": 999}
  // Чи приймає userId від клієнта?
```

---

## Auth Bypass — обхід авторизації

### Тест-кейси

```
1. Прямий доступ без токена:
   GET /api/admin/users → 401 очікується

2. Прострочений токен:
   Authorization: Bearer [expired_token]
   → 401 очікується (не 200!)

3. Підроблений токен:
   Authorization: Bearer invalid.token.here
   → 401 очікується

4. JWT алгоритм none:
   Header: {"alg": "none", "typ": "JWT"}
   → Сервер повинен відхилити

5. JWT з підвищенням ролі:
   Декодуємо payload, міняємо role на admin,
   підписуємо з іншим ключем
   → 401 або 403 очікується

6. Credential stuffing тест:
   POST /api/auth/login з неправильним паролем
   100 разів → чи є rate limiting?
   → Очікуємо 429 після N спроб
```

### Перевірка JWT

```javascript
// Декодувати JWT без бібліотеки (base64)
const [header, payload, signature] = token.split('.')
const decoded = JSON.parse(atob(payload))
console.log(decoded)
// { userId: 42, role: "user", exp: 1720000000 }

// Перевірити що:
// 1. exp не прострочений
// 2. role відповідає очікуваній
// 3. userId відповідає поточному юзеру
```

---

## Security Headers

QA перевіряє не тільки функціональність, а й наявність захисних HTTP headers.

```javascript
// Postman тест на security headers
pm.test("Security headers present", () => {
    const headers = pm.response.headers

    // Захист від XSS
    pm.expect(headers.get('X-Content-Type-Options'))
      .to.equal('nosniff')

    // Захист від clickjacking
    pm.expect(headers.get('X-Frame-Options'))
      .to.be.oneOf(['DENY', 'SAMEORIGIN'])

    // HTTPS тільки
    pm.expect(headers.get('Strict-Transport-Security'))
      .to.exist

    // Content Security Policy
    pm.expect(headers.get('Content-Security-Policy'))
      .to.exist
})

pm.test("No sensitive data in headers", () => {
    const server = pm.response.headers.get('Server')
    // Не розкривати версію: "Apache/2.4.1" = погано
    if (server) {
        pm.expect(server).to.not.match(/\d+\.\d+/)
    }
})
```

---

## Інструменти для security тестування

### OWASP ZAP (безкоштовний)

```bash
# Встановлення через Docker
docker pull owasp/zap2docker-stable

# Базове сканування
docker run owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r report.html

# API сканування з OpenAPI специфікацією
docker run owasp/zap2docker-stable zap-api-scan.py \
  -t http://localhost:3000/api/swagger.json \
  -f openapi \
  -r api-report.html
```

### Burp Suite (Community Edition — безкоштовний)

```
Основні можливості:
- Intercepting proxy — перехоплення і зміна запитів
- Repeater — повторне відправлення запитів
- Intruder — автоматизований brute force / fuzzing
- Scanner (Pro) — автоматичне сканування вразливостей

Типовий flow:
1. Налаштувати browser proxy → Burp Suite
2. Виконати дію у UI (логін, пошук, оплата)
3. Побачити запит в Burp
4. Відправити в Repeater
5. Змінити параметри (ID, токен, payload)
6. Подивитись відповідь
```

---

## Security тест-чеклист

### API рівень

```
Авторизація:
  □ Всі захищені ендпоінти повертають 401 без токена
  □ Прострочений токен → 401
  □ Невалідний токен → 401
  □ Токен іншого користувача → 403

IDOR:
  □ GET /resource/{id} — чужий ID → 403/404
  □ PUT /resource/{id} — чужий ID → 403/404
  □ DELETE /resource/{id} — чужий ID → 403/404
  □ Масові параметри не приймають userId від клієнта

Injection:
  □ SQL payload у всіх текстових полях → не виконується
  □ SQL помилки не витікають у відповіді
  □ XSS payload у полях → екранується

Rate limiting:
  □ Логін: N невдалих спроб → 429
  □ Запит на відновлення пароля → rate limited
  □ API endpoints → rate limited
```

### Заголовки і конфігурація

```
Headers:
  □ X-Content-Type-Options: nosniff
  □ X-Frame-Options: DENY або SAMEORIGIN
  □ Strict-Transport-Security (HTTPS)
  □ Content-Security-Policy
  □ Server header не розкриває версію

Дані:
  □ Паролі не в логах і не у відповідях API
  □ Токени не в URL (тільки в headers)
  □ PII не в error messages
  □ Stack trace не у відповідях продакшену
```

---

## Питання на співбесіді

### «Що таке IDOR і як його перевіряти?»
> IDOR — Insecure Direct Object Reference. Вразливість де користувач може підставити чужий ID і отримати або змінити чужі дані. Перевіряю: реєструю двох користувачів, логінюся як A, підставляю ID ресурсу B у всі CRUD запити, очікую 403/404.

### «Чим відрізняється XSS від SQL injection?»
> SQL injection — код виконується на сервері в БД. XSS — JavaScript виконується в браузері клієнта. SQL injection загрожує даним, XSS — сесіям і виконанню дій від імені жертви.

### «Що перевіряти в security headers?»
> X-Content-Type-Options (захист від MIME sniffing), X-Frame-Options (захист від clickjacking), Strict-Transport-Security (HTTPS), Content-Security-Policy (обмеження ресурсів). Також перевіряю що Server header не розкриває версію сервера.

### «Як тестувати авторизацію?»
> Прямий доступ без токена → 401. Прострочений токен → 401. Невалідний токен → 401. Токен іншого користувача → 403. JWT з role=admin підробленим → 401/403. Перевіряю rate limiting на логін.
