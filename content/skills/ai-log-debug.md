# AI для аналізу логів і дебагу тестів

## Три правила ефективного дебагу з AI

| Правило | Погано | Добре |
|---|---|---|
| **Контекст** | «TypeError: null» | «Playwright, CI Ubuntu, паралельний запуск, ось код і stack trace» |
| **Патерн умов** | «тест падає» | «падає тільки в CI, тільки в Firefox, тільки при workers=4» |
| **Ітерація** | Один запит і чекати | Спробував → повернув результат → уточнив |

> Дебаг з AI — це діалог, не одноразовий запит. Патерн умов найшвидше веде до root cause.

---

## 1. Аналіз Stack Trace

### TypeError / ReferenceError

```
Промпт:
"Поясни цей stack trace і як виправити.
Контекст: Playwright тест, CI середовище, Ubuntu, Chrome 124.

TypeError: Cannot read properties of null (reading 'click')
    at LoginPage.login (pages/LoginPage.ts:18:32)
    at Context.<anonymous> (tests/auth.spec.ts:12:5)"
```

**AI пояснює:**

```
Причина: рядок 18 у LoginPage.ts викликає .click() на null —
локатор не знайшов елемент до того як відбувся клік.

Варіанти причин:
1. Сторінка не завантажилась повністю
2. Локатор некоректний (елемент не існує)
3. Елемент в iframe або shadow DOM
4. Умовний рендеринг — елемент прихований

Виправлення — додати перед кліком:
await expect(this.submitButton).toBeVisible()

Або waitFor зі станом:
await this.submitButton.waitFor({ state: 'visible' })
```

---

### TimeoutError — елемент не знайдено

```
Промпт:
"TimeoutError: locator.fill: Timeout 30000ms exceeded.
 Call log: waiting for locator getByLabel('Email')

Playwright тест, падає в CI але не локально."
```

**AI пояснює:**

```
Причини TimeoutError в CI але не локально:

1. CI повільніший ніж локальна машина
   → Збільшити timeout в playwright.config:
     timeout: 60_000 (замість 30_000)

2. Сторінка не завантажилась до пошуку елемента
   → Додати після goto:
     await page.waitForLoadState('networkidle')

3. Lazy-loaded компонент
   → Чекати конкретний API запит:
     await page.waitForResponse('**/api/auth/me')

4. Елемент з'являється після анімації
   → Playwright чекає visible, але елемент
     може бути в DOM але opacity: 0
     → додати: { state: 'visible', timeout: 60000 }
```

---

### AssertionError — очікуване vs фактичне

```
Промпт:
"AssertionError: expect(received).toBe(expected)
Expected: 'Welcome, Anna'
Received: 'Welcome, '

Error: expect(page).toHaveURL expected '/dashboard'
Received: 'http://localhost:3000/login'"
```

**AI діагностує:**

```
Проблема 1: ім'я порожнє ('Welcome, ')
→ user.name не завантажилось до рендеру компонента
→ Race condition між auth і profile fetch
→ Діагностика:
  await page.waitForResponse('**/api/me')
  // Перевірити чи відповідь містить name

Проблема 2: редирект на /login замість /dashboard
→ Авторизація не пройшла АБО
→ Токен не збережено в cookies АБО
→ Сесія закінчилась між кроками тесту
→ Перевірити: чи fixture авторизації спрацювала
```

---

## 2. Флакі тести

### Тест падає ~30% — race condition

```
Промпт:
"Тест падає ~30% в CI. Локально проходить завжди.
Помилка: TimeoutError waiting for .submit-btn

test('checkout', async ({ page }) => {
  await page.goto('/cart')
  await page.click('.checkout-btn')
  await page.fill('#card-number', '4242...')
  await page.click('.submit-btn')
  await expect(page.getByText('Success')).toBeVisible()
})"
```

**AI знаходить причини:**

```
1. .checkout-btn клікається до повного завантаження
2. .submit-btn з'являється після async валідації картки
3. CSS локатори нестабільні при рефакторингу стилів
4. CI повільніший — таймаути недостатні
```

**Виправлений тест:**

```typescript
test('checkout', async ({ page }) => {
  await page.goto('/cart')

  // Семантичний локатор + чекання
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByLabel('Card number').fill('4242424242424242')

  // Чекати що кнопка активна після валідації картки
  const submitBtn = page.getByRole('button', { name: 'Pay now' })
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()

  await expect(page.getByText('Payment successful')).toBeVisible()
})
```

---

### Тест падає тільки в Firefox / Safari

```
Промпт:
"Тест проходить в Chrome, падає в Firefox і Safari.
Помилка: element not visible на кроці hover над меню."
```

**AI аналізує:**

```
Firefox/Safari специфіка:

1. CSS :hover по-різному спрацьовує в non-Chromium

2. waitForLoadState — Firefox завантажує ресурси довше

3. Font rendering відрізняється → інший розмір елемента
   → елемент може частково виходити за viewport

4. Scroll behavior різниця → елемент за межами viewport

Рішення:
await expect(menuItem).toBeVisible({ timeout: 10000 })
await menuItem.scrollIntoViewIfNeeded()
await menuItem.hover()
```

---

### Тест падає тільки при паралельному запуску

```
Промпт:
"Тест падає тільки при workers=4.
Помилка: 409 Conflict на POST /api/orders.
Локально (workers=1) — завжди проходить."
```

**AI діагностує:**

```
409 Conflict + паралельний запуск = race condition:

Причина: два тести одночасно створюють ресурс
з однаковим унікальним полем (email, slug, код)

Рішення:
// Унікальні дані в кожному тесті
const email = `test-${Date.now()}-${Math.random()}@test.com`

// Або через test.info().workerIndex
const email = `worker-${test.info().workerIndex}@test.com`

// Cleanup перед тестом
test.beforeEach(async ({ request }) => {
  await request.delete('/api/test/cleanup')
})
```

---

## 3. Аналіз великих логів

### Server logs після деплою

```
Промпт:
"Ось 500 рядків server logs після деплою v2.15.
Знайди:
- Помилки і попередження
- Патерни (повторювані події)
- Кореляцію між подіями
- Можливу root cause

[вставити логи]"
```

**AI знаходить:**

```
Критичні помилки (3 випадки):
  14:23:01 ERROR DB connection timeout — pool exhausted
  14:23:45 ERROR DB connection timeout — pool exhausted
  14:25:12 ERROR DB connection timeout — pool exhausted

Патерн: кожні ~60 сек після 14:22
Кореляція: о 14:22 — деплой завершено

  14:22:58 INFO Deploy v2.15 completed
  14:23:01 ERROR Pool exhausted (0/10 connections)

Гіпотеза: деплой не закрив старі DB connections,
пул вичерпано новими запитами.

Рекомендація: перевірити connection pool cleanup
при graceful shutdown сервісу.
```

---

### Збір логів у Playwright тесті для аналізу AI

```typescript
test('debug with logs', async ({ page }) => {
  // Збирати console помилки
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error')
      consoleErrors.push(msg.text())
  })

  // Збирати failed network requests
  const failedRequests: string[] = []
  page.on('requestfailed', req => {
    failedRequests.push(
      `${req.url()}: ${req.failure()?.errorText}`
    )
  })

  // Збирати всі відповіді API
  const apiResponses: string[] = []
  page.on('response', resp => {
    if (resp.url().includes('/api/') && resp.status() >= 400)
      apiResponses.push(`${resp.status()} ${resp.url()}`)
  })

  await page.goto('/checkout')
  // ... тестові дії

  // Вивести для вставки в промпт до AI
  if (consoleErrors.length) {
    console.log('=== Console Errors ===')
    consoleErrors.forEach(e => console.log(e))
  }
  if (failedRequests.length) {
    console.log('=== Failed Requests ===')
    failedRequests.forEach(r => console.log(r))
  }
  if (apiResponses.length) {
    console.log('=== API Errors ===')
    apiResponses.forEach(r => console.log(r))
  }
})
```

**Результат для вставки в промпт:**

```
Console Errors:
- TypeError: Cannot read 'price' of undefined (checkout.js:142)
- Unhandled Promise Rejection: Network Error

Failed Requests:
- POST /api/payment: ERR_BLOCKED_BY_CLIENT
- GET /api/cart/summary: net::ERR_FAILED

API Errors:
- 401 /api/cart/summary
- 500 /api/payment
```

---

## 4. Root Cause аналіз

### Баг чи проблема середовища?

```
Промпт:
"Тест падає за умов:
- Тільки в CI, але не локально
- Тільки при паралельному запуску (workers=4)
- Тільки по понеділках вранці (9:00-10:00)
- Помилка: 409 Conflict на POST /api/orders

Що може бути причиною? Що перевірити?"
```

**AI розбирає патерн:**

```
CI тільки → проблема середовища:
  - Shared test database без ізоляції
  - Відсутні env змінні в CI

Паралельно тільки → race condition:
  - Два тести створюють однаковий унікальний ресурс
  - 409 = unique constraint violation

По понеділках вранці → накопичені дані:
  - Cleanup job не запускається на вихідних
  - Дані з минулого тижня конфліктують

Комбінація всіх трьох → найімовірніше:
  Тести використовують спільну БД,
  паралельно намагаються створити
  однакові записи, що накопичились
  через відсутній cleanup.

Що перевірити:
1. Чи є cleanup beforeEach/afterEach
2. Чи унікальні тестові дані (email, phone)
3. Чи є scheduled job для очищення test DB
```

---

### Діагностична матриця

Корисний підхід: описати AI умови коли падає і не падає.

```
Шаблон матриці для промпту:

Тест ПАДАЄ коли:
  - CI = так
  - Паралельно = так (workers > 1)
  - Після деплою = так
  - Firefox/Safari = так

Тест НЕ ПАДАЄ коли:
  - Локально = ні
  - Послідовно = ні (workers=1)
  - Chrome = ні
  - Вранці = ні (тільки вдень)

Помилка: [точний текст]

AI значно точніше визначає root cause
маючи обидва стовпці матриці.
```

---

## 5. Аналіз CI/CD failures

### GitHub Actions лог

```
Промпт:
"Ось GitHub Actions лог. Знайди:
1. Які тести впали і чому
2. Чи пов'язані між собою
3. Баг у коді чи конфігурація CI
4. Що виправити в першу чергу

[вставити CI лог]"
```

**AI розбирає:**

```
3 failures — одна спільна причина:

Всі три тести впали через:
Error: ENOENT: no such file .env.test not found

Причина: CI не містить файл .env.test
Тести потребують env змінних:
  DB_URL, API_KEY, BASE_URL

Це НЕ баг у коді — це конфігурація CI.

Рішення:
# GitHub Secrets → Settings → Secrets
# Додати: DB_URL, API_KEY, BASE_URL

# У workflow .yml:
env:
  DB_URL: ${{ secrets.DB_URL }}
  API_KEY: ${{ secrets.API_KEY }}
  BASE_URL: ${{ secrets.BASE_URL }}
```

---

### Аналіз тривалості тестів

```
Промпт:
"Наш CI pipeline займає 45 хвилин.
Ось список тестів з тривалістю:
[список]

Знайди bottleneck і що можна оптимізувати."
```

**AI відповідає:**

```
3 тести займають 60% часу:

e2e/checkout.spec.ts: 18 хв
→ Запускається послідовно, можна split на 3 файли
→ Або sharding: --shard=1/3, 2/3, 3/3

api/bulk-import.spec.ts: 8 хв
→ Великий реальний dataset — замінити mock даними
→ 1000 записів → 10 записів у тесті

auth/session.spec.ts: 7 хв
→ Кожен тест логінить заново через UI
→ Замінити на API login + збереження стану

Після оптимізації: ~12 хв замість 45
```

---

## Шаблони промптів для дебагу

### Stack trace → пояснення

```
Поясни цей stack trace і як виправити.
Контекст: [Playwright/Jest/pytest],
[CI/local], [браузер і ОС], [версія Node].

[вставити stack trace]
```

---

### Флакі тест → root cause

```
Цей тест падає [N]% запусків з помилкою:
[текст помилки]

Умови:
- [тільки CI / тільки локально]
- [тільки Firefox / тільки Safari]
- [при паралельному запуску]
- [після конкретної дії]

Ось код тесту:
[код]

Знайди причини і запропонуй виправлення.
```

---

### Великий лог → патерни

```
Ось [N] рядків server/test logs після [події].
Знайди:
- Помилки і попередження
- Патерни (повторювані події)
- Кореляцію між подіями
- Можливу root cause

[вставити логи — до 10 000 символів]
```

---

### Симптоми → root cause

```
Тест падає за умов:
- [умова 1: тільки CI]
- [умова 2: тільки паралельно]
- [умова 3: тільки після ...]

Тест НЕ падає:
- [умова: локально]
- [умова: послідовно]

Помилка: [текст помилки]

Які можливі причини? Що перевірити першим?
```

---

### CI лог → що зламалось

```
Ось GitHub Actions / GitLab CI лог.
Знайди:
1. Які тести впали і чому
2. Чи пов'язані між собою
3. Баг у коді чи конфігурація CI
4. Що виправити в першу чергу

[вставити CI лог]
```

---

## Повний приклад дебаг-сесії з AI

```
Крок 1 — тест впав в CI:
"TimeoutError: getByLabel('Email') timeout 30000ms"

Крок 2 — перший промпт:
"Playwright тест падає в CI (Ubuntu, Chrome 124).
 Локально завжди проходить. Stack trace: [...]
 Ось код тесту: [...]"

Крок 3 — AI відповідь:
"Схоже на race condition — сторінка не завантажилась.
 Спробуй: await page.waitForLoadState('networkidle')"

Крок 4 — додав, тест падає ще ~10%:
"Додав waitForLoadState('networkidle').
 Тест падає ще ~10% в CI. Нові логи: [...]"

Крок 5 — AI уточнює:
"10% при networkidle = lazy-loaded компонент.
 Перейди на waitForResponse('**/api/auth/me') —
 чекай конкретний API запит, не загальну мережу."

Крок 6 — виправлено, тест стабільний.
```

---

## Питання на співбесіді

### «Як ти дебажиш флакі тести?»
> Спочатку збираю патерн умов: коли падає і не падає (CI vs local, браузер, паралельність). Потім вставляю код і умови в AI — він пропонує гіпотези. Ключові причини флакі: race conditions (немає чекання готовності), нестабільні CSS локатори, залежність між тестами через спільний стан.

### «Як аналізуєш великі логи?»
> Вставляю в AI з чітким запитом: знайди помилки, патерни, кореляцію між подіями і можливу root cause. AI добре знаходить recurring patterns і часові кореляції — наприклад, помилки що з'являються через N секунд після деплою.

### «Як визначаєш чи це баг у коді чи проблема середовища?»
> Будую матрицю: умови коли падає і не падає. Якщо тільки CI — середовище. Якщо тільки паралельно — race condition. Якщо тільки Firefox — browser-specific. AI набагато точніше діагностує коли є обидва стовпці матриці.
