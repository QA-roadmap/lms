# Як тестувальник використовує AI у роботі у 2026

## Головне правило

AI — це пара-програміст і помічник, не замінник мислення.

| Принцип | Деталь |
|---|---|
| **Перевіряй** | AI може запропонувати неправильний очікуваний результат або нестабільний локатор |
| **Давай контекст** | «Напиши тест» гірше ніж «Напиши Playwright тест для POST /orders, очікуємо 201» |
| **Ітеруй** | Перший результат — чернетка. Уточнюй і покращуй |

---

## 1. Генерація тест-кейсів

### За User Story

```
Промпт:
"Ось User Story:
'Як користувач, я хочу відновити пароль через email,
щоб отримати доступ до акаунту якщо забув пароль.'

Згенеруй тест-кейси покриваючи:
- Позитивні сценарії
- Негативні сценарії
- Edge cases
Формат: ID | Назва | Передумови | Кроки | Очікуваний результат"
```

**Результат AI:**

```
TC-01 | Успішне відновлення з валідним email
  Кроки: ввести email → натиснути Reset → перевірити inbox
  Очікуємо: лист прийшов протягом 60 сек

TC-02 | Email не зареєстрований
  Очікуємо: "If this email exists..." (не розкривати чи є акаунт)

TC-03 | Email з пробілами на початку/кінці
  Очікуємо: trim і обробка коректно

TC-04 | Посилання вже використане
  Очікуємо: "Це посилання застаріло"

TC-05 | Посилання після закінчення терміну (24 год)
  Очікуємо: повідомлення про закінчення терміну

TC-06 | Кілька запитів підряд
  Очікуємо: rate limiting після 3 запитів
```

> AI пропонує TC-02 з важливим нюансом безпеки — не розкривати чи існує email. Це типовий edge case який легко пропустити.

---

### Edge cases для числових полів

```
Промпт:
"Функція: поле введення суми платежу (0.01 - 99999.99 USD)
Запропонуй граничні значення та edge cases для тестування"
```

**Результат AI:**

```
- 0.00    → заборонено
- 0.01    → мінімум, дозволено
- 0.009   → менше мінімуму, 2+ знаки після крапки
- 99999.99 → максимум
- 100000.00 → вище максимуму
- -1.00   → від'ємне значення
- "abc"   → рядок замість числа
- ""      → порожнє поле
- 1,000.00 → кома як роздільник тисяч
- 1.000,00 → European формат
- 1e5     → наукова нотація
- null    → програмне значення
```

---

### Матриця покриття (RTM)

```
Промпт:
"Ось список вимог (REQ-001 до REQ-010) і список
тест-кейсів (TC-001 до TC-015).
Побудуй RTM і знайди вимоги без покриття."
```

**Результат AI:**

```
REQ-001 → TC-001, TC-002  ✅ Покрито
REQ-002 → TC-003           ✅ Покрито
REQ-003 → —                ❌ НЕ ПОКРИТО
REQ-004 → TC-004, TC-005   ✅ Покрито
REQ-005 → TC-007           ⚠️  Тільки happy path

Рекомендація:
- Додати тести для REQ-003
- REQ-005 потребує негативних сценаріїв
```

---

## 2. Дебаг і аналіз

### Флакі тести

```
Промпт:
"Цей Playwright тест падає в CI але проходить локально.
Падає ~30% запусків з помилкою:
'TimeoutError: Waiting for selector .submit-btn'

test('checkout', async ({ page }) => {
  await page.goto('/cart')
  await page.click('.checkout-btn')
  await page.fill('#card-number', '4242...')
  await page.click('.submit-btn')
  await expect(page.getByText('Success')).toBeVisible()
})"
```

**AI аналізує причини:**

```
1. .checkout-btn клікається до повного завантаження сторінки
2. .submit-btn з'являється після async валідації картки
3. CSS-локатори нестабільні при рефакторингу стилів
4. CI повільніший за локальну машину — таймаути недостатні
```

**AI пропонує виправлення:**

```typescript
test('checkout', async ({ page }) => {
  await page.goto('/cart')

  // Чекати кнопку перед кліком
  await page.getByRole('button', { name: 'Checkout' }).click()

  // Стабільний локатор
  await page.getByLabel('Card number').fill('4242424242424242')

  // Чекати що кнопка активна після валідації
  const submitBtn = page.getByRole('button', { name: 'Pay now' })
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()

  await expect(page.getByText('Payment successful')).toBeVisible()
})
```

---

### Аналіз stack trace

```
Промпт:
"Поясни цей stack trace і як виправити:
TypeError: Cannot read properties of null (reading 'click')
    at LoginPage.login (pages/LoginPage.ts:18:32)
    at Context.<anonymous> (tests/auth.spec.ts:12:5)"
```

**AI пояснює:**

```
Помилка: намагаємось викликати .click() на null елементі.

Причина: локатор не знайшов елемент до того як відбувся клік.

Варіанти причин:
1. Сторінка не завантажилась повністю
2. Локатор некоректний (елемент не існує)
3. Елемент в iframe або shadow DOM
4. Умовний рендеринг — елемент прихований

Рішення: додати await expect(locator).toBeVisible()
перед кліком, або використати waitFor()
```

---

### Root cause аналіз

```
Промпт:
"Тест падає тільки в CI, але не локально.
Тільки в Firefox, не в Chrome.
Тільки при паралельному запуску.
Що може бути причиною?"
```

**AI аналізує:**

```
Симптоми вказують на:

1. Race condition (паралельний запуск)
   → Тести змінюють спільний стан (БД, cookies)
   → Рішення: ізоляція тестів через fixtures

2. Firefox-специфічна поведінка
   → waitForLoadState — Firefox завантажує в іншому порядку
   → CSS анімації можуть бути повільнішими

3. CI середовище
   → Менше CPU → повільніші таймаути
   → Рішення: збільшити timeout в playwright.config
```

---

### Аналіз великих логів

```
Промпт:
"Ось 500 рядків server logs після деплою.
Знайди: помилки, попередження, патерни,
кореляцію між подіями."
```

**AI знаходить:**

```
Критичні помилки (3 випадки):
  14:23:01 ERROR DB connection timeout — pool exhausted
  14:23:45 ERROR DB connection timeout — pool exhausted
  14:25:12 ERROR DB connection timeout — pool exhausted

Патерн: помилки виникають кожні ~60 сек після 14:22
Кореляція: о 14:22 — новий деплой

Гіпотеза: деплой не закрив старі DB connections,
пул вичерпано. Перевірити connection pooling після деплою.
```

---

## 3. Аналіз вимог (Shift-Left)

### Знайти прогалини у вимогах

```
Промпт:
"Вимога: 'Користувач може завантажити аватар у профіль'

Ти QA-інженер. Знайди прогалини і неоднозначності.
Сформулюй питання до розробника/BA."
```

**AI знаходить 10 неоднозначностей:**

```
1.  Формати: які саме? JPG тільки? PNG, GIF, WebP?
2.  Розмір: максимальний розмір файлу?
3.  Розміри: мінімальні/максимальні px? Обрізка?
4.  Зберігання: CDN? S3? Local?
5.  Старий аватар: видаляється чи зберігається?
6.  За замовчуванням: що показується до завантаження?
7.  Права: адмін може видалити аватар юзера?
8.  Модерація: перевірка контенту зображення?
9.  Помилки: що якщо завантаження перервано?
10. Кешування: як оновлюється скрізь де відображається?
```

> 10 питань замість 0. Кожне — потенційний баг якого не буде в специфікації.

---

### Аналіз ризиків

```
Промпт:
"Нова фіча: міграція платіжного провайдера
з PayPal на Stripe. Оціни ризики з точки зору QA,
пріоритизуй що тестувати в першу чергу."
```

**AI розставляє пріоритети:**

```
КРИТИЧНІ (тестувати першими):
  - Дані існуючих карток перенесені коректно
  - Рекурентні платежі працюють
  - Webhooks отримують події від Stripe
  - Refund workflow не зламаний

ВИСОКІ:
  - Currency conversion відповідає очікуваному
  - Error messages відповідають UX
  - 3DS auth flow відрізняється між провайдерами

СЕРЕДНІ:
  - Receipts мають правильний брендинг
  - Analytics events надсилаються коректно
```

---

## 4. Генерація тестових даних

### Реалістичні дані

```
Промпт:
"Згенеруй тестові дані для форми реєстрації.
5 валідних і 10 невалідних варіантів email.
Edge cases для поля 'ім'я': Unicode, XSS, SQL injection."
```

**AI генерує:**

```
Валідні email:
  user@example.com
  user+tag@domain.co.uk
  user.name123@sub.domain.org
  "user name"@example.com      ← валідний за RFC, часто ламає системи
  user@xn--nxasmq6b.com        ← IDN домен

Невалідні email:
  user@           ← немає домену
  @example.com    ← немає local part
  user @ex.com    ← пробіл
  user@@ex.com    ← подвійний @
  .user@ex.com    ← крапка на початку

Edge cases для поля "Ім'я":
  <script>alert(1)</script>    ← XSS
  '; DROP TABLE users--         ← SQL injection
  Ｊａｖａ                     ← full-width unicode
  José María Aznar             ← акценти
  王小明                        ← Chinese characters
  𝕳𝖊𝖑𝖑𝖔                     ← mathematical bold
  A                            ← 1 символ (мінімум)
  [255 символів]               ← максимум
  [256 символів]               ← за межею
```

---

### Security payload

```
Промпт:
"Згенеруй payload для тестування поля пошуку:
XSS, SQL injection, path traversal, SSRF."
```

**AI генерує:**

```
XSS:
  <script>alert('xss')</script>
  <img src=x onerror=alert(1)>
  javascript:alert(1)
  "><svg onload=alert(1)>

SQL injection:
  ' OR '1'='1
  '; DROP TABLE products--
  1 UNION SELECT * FROM users

Path traversal:
  ../../../etc/passwd
  ..%2F..%2Fetc%2Fpasswd

SSRF:
  http://localhost:6379         ← Redis
  http://169.254.169.254        ← AWS metadata endpoint

Очікуваний результат для всіх:
  Запит відхилено або екранується — не виконується.
```

---

## 5. Код і автоматизація

### Написання тестів за описом

```
Промпт:
"Напиши Playwright тест для API:
POST /api/users
- Успішне створення (201)
- Дублікат email (409)
- Без обов'язкового поля name (422)"
```

**AI генерує:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('POST /api/users', () => {
  test('201 — успішне створення', async ({ request }) => {
    const resp = await request.post('/api/users', {
      data: { name: 'Anna', email: 'anna@test.com' }
    })
    expect(resp.status()).toBe(201)
    const body = await resp.json()
    expect(body).toHaveProperty('id')
    expect(body.email).toBe('anna@test.com')
  })

  test('409 — дублікат email', async ({ request }) => {
    await request.post('/api/users', {
      data: { name: 'A', email: 'dup@test.com' }
    })
    const resp = await request.post('/api/users', {
      data: { name: 'B', email: 'dup@test.com' }
    })
    expect(resp.status()).toBe(409)
  })

  test('422 — відсутнє поле name', async ({ request }) => {
    const resp = await request.post('/api/users', {
      data: { email: 'no-name@test.com' }
    })
    expect(resp.status()).toBe(422)
    const body = await resp.json()
    expect(body.errors).toContain('name is required')
  })
})
```

---

### Page Object з HTML структури

```
Промпт:
"Ось HTML форми логіну. Напиши Playwright Page Object TypeScript.

<form id='login-form'>
  <label for='email'>Email</label>
  <input id='email' type='email' placeholder='Enter email'>
  <label for='password'>Password</label>
  <input id='password' type='password'>
  <button type='submit' data-testid='login-btn'>Sign In</button>
  <span class='error-msg' id='login-error'></span>
</form>"
```

**AI генерує:**

```typescript
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(private page: Page) {
    this.emailInput    = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton  = page.getByTestId('login-btn')
    this.errorMessage  = page.locator('#login-error')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async getErrorText(): Promise<string | null> {
    return this.errorMessage.textContent()
  }
}
```

---

### Рефакторинг тестів

```
Промпт:
"Відрефактори цей тест. Він працює але важко читається:"

test('test1', async ({ page }) => {
  await page.goto('https://site.com/login')
  await page.locator('#email').fill('user@test.com')
  await page.locator('#pass').fill('pass123')
  await page.locator('.btn-login').click()
  await page.waitForTimeout(2000)
  expect(await page.locator('.welcome').textContent()).toBe('Welcome!')
})
```

**AI пропонує:**

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('успішний логін показує вітальне повідомлення',
  async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('user@test.com', 'pass123')

    // auto-retry — не потрібен waitForTimeout
    await expect(page.getByText('Welcome!')).toBeVisible()
  }
)

// Зміни:
// - Page Object замість прямих CSS локаторів
// - getByText замість .welcome класу
// - Видалено waitForTimeout(2000) — антипатерн
```

---

### Code review тестів

```
Промпт:
"Зроби code review цього тест-файлу.
Знайди: антипатерни, нестабільні локатори, пропущені перевірки."
```

**AI знаходить:**

```
❌ Рядок 12: waitForTimeout(3000) — ненадійно
   Замінити на: await expect(locator).toBeVisible()

❌ Рядок 18: .nth(0) — крихкий локатор
   Замінити на: .filter({ hasText: 'Product Name' })

❌ Рядок 24: немає перевірки URL після редиректу
   Додати: await expect(page).toHaveURL(/dashboard/)

⚠️ Рядок 31: тест залежить від порядку виконання
   Кожен тест повинен бути незалежним

⚠️ Рядок 8: hardcoded URL 'http://localhost:3000'
   Замінити на: baseURL з playwright.config.ts
```

---

## 6. Звітність

### Test Summary Report

```
Промпт:
"Ось результати тестового циклу v2.15:
- Виконано: 342 тест-кейси
- Passed: 298, Failed: 31, Blocked: 13
- Нових багів: 18 (3 Critical, 7 Major, 8 Minor)
- Regression: всі P1 пройшли, 4 P2 впали
- Термін: 3 дні

Напиши Test Summary Report для менеджера проєкту."
```

**AI генерує:**

```
Test Summary — Release v2.15
Тестовий цикл: 3 дні | Охоплення: 342 тест-кейси

Загальні результати:
  Passed:  298 (87%) ✅
  Failed:   31 (9%)  ❌
  Blocked:  13 (4%)  ⏸

Знайдено дефектів: 18
  Critical: 3 — потребують виправлення до релізу
  Major:    7 — рекомендовано виправити
  Minor:    8 — можна відкласти

Регресія:
  ✅ Всі P1 пройшли
  ⚠️ 4 P2 впали (BUG-201, 202, 205, 208)

Рекомендація: НЕ РЕКОМЕНДОВАНО до релізу
Мінімум для релізу: закрити 3 Critical + 4 P2 regression

Наступні кроки:
  1. Виправити Critical баги (оцінка: 2 дні)
  2. Повторний тестовий цикл P1+P2 (1 день)
  3. Sign-off після підтвердження
```

---

### Покращення баг-репорту

```
Промпт:
"Покращ цей баг-репорт.
Чернетка: 'кнопка не працює на сторінці оплати, натиснув оплатити і нічого'
Контекст: Chrome Win11, staging v2.15, авторизований акаунт."
```

**AI покращує:**

```
BUG-XXX: Кнопка «Оплатити» не реагує при сумі > $1000

Severity: Critical | Priority: High | Status: Open

Середовище: Staging v2.15 | Chrome 124 | Windows 11

Передумови:
  - Авторизований акаунт з роллю customer
  - В кошику товари на суму > $1000

Кроки відтворення:
  1. Додати товари на суму $1001+
  2. Перейти до оформлення замовлення
  3. Заповнити дані доставки → натиснути «Далі»
  4. Натиснути кнопку «Оплатити»

Фактичний результат:
  Кнопка візуально натискається але нічого не відбувається.
  Console: Uncaught TypeError: amount.toFixed is not a function

Очікуваний результат:
  Перехід до форми введення платіжних даних.
```

---

### Аналіз метрик якості

```
Промпт:
"Ось метрики за 4 спринти:
  Sprint 1: 85% passed, 12 bugs, 2 critical
  Sprint 2: 88% passed, 9 bugs, 1 critical
  Sprint 3: 79% passed, 18 bugs, 4 critical
  Sprint 4: 82% passed, 14 bugs, 2 critical

Що означає ця динаміка? Що рекомендуєш?"
```

**AI аналізує:**

```
Тренди:
  Pass rate: нестабільний, просадка у Sprint 3
  Bugs: зросли у Sprint 3, не повернулись до норми Sprint 2
  Critical: пік у Sprint 3 — сигнал про великі зміни в коді

Гіпотези:
  Sprint 3 — великий реліз або рефакторинг архітектури?
  Технічний борг накопичується (bugs не падають до 9)

Рекомендації:
  1. З'ясувати що було в Sprint 3
  2. Збільшити regression coverage для модулів Sprint 3
  3. Threshold: якщо critical > 2 → стоп-реліз
  4. Ввести code review з QA участю для великих змін
```

---

## Де AI економить найбільше часу

| Задача | Без AI | З AI | Виграш |
|---|---|---|---|
| Генерація тест-кейсів | 2–3 год | 20–30 хв | ~5× |
| Edge cases | Пропускаєш 30–40% | Повне покриття | Якість |
| Аналіз флакі тесту | 1–3 год | 5–10 хв | ~15× |
| Написання Page Object | 30 хв | 5 хв | ~6× |
| Test Summary Report | 1 год | 10 хв | ~6× |
| Аналіз вимог | 1–2 год | 20 хв | ~5× |

---

## Шаблони промптів для QA

### Генерація тест-кейсів
```
"Ось [User Story / вимога / функціональність].
Згенеруй тест-кейси:
- Позитивні сценарії
- Негативні сценарії
- Edge cases
- Security scenarios
Формат: ID | Назва | Передумови | Кроки | Очікуваний результат"
```

### Аналіз флакі тесту
```
"Цей тест падає [N]% запусків з помилкою: [помилка].
Ось код тесту: [код]
Середовище: [CI/local], браузер: [X]
Знайди причини і запропонуй виправлення."
```

### Знайти прогалини у вимогах
```
"Ти досвідчений QA-інженер.
Проаналізуй цю вимогу: [вимога]
Знайди неоднозначності, прогалини і граничні випадки.
Сформулюй конкретні питання до BA/розробника."
```

### Code review тестів
```
"Зроби code review цього Playwright тест-файлу.
Знайди: антипатерни, нестабільні локатори,
пропущені assertions, проблеми з підтримуваністю.
[код]"
```

### Генерація тестових даних
```
"Згенеруй тестові дані для [поля/форми]:
- [N] валідних значень
- [N] невалідних значень
- Edge cases: Unicode, XSS, SQL injection, граничні значення"
```

---

## Питання на співбесіді

### «Як ти використовуєш AI у тестуванні?»
> Для генерації тест-кейсів і edge cases за вимогами, аналізу флакі тестів і stack trace, написання Page Objects з HTML структури, і покращення баг-репортів. Головне — перевіряю все що генерується, не копіюю сліпо.

### «Чи замінить AI тестувальників?»
> AI прискорює рутину — генерацію, рефакторинг, аналіз. Але не замінює: розуміння бізнес-контексту, оцінку ризиків, exploratory тестування і критичне мислення. QA з AI продуктивніший, ніж QA без AI — але AI без QA не тестує продукт.

### «Які обмеження AI в тестуванні?»
> Може генерувати неправильні очікувані результати, не знає специфіки вашого домену без контексту, не розуміє бізнес-пріоритети. Потребує чітких промптів і перевірки результатів.
