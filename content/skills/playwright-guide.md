# Playwright: повний довідник з автоматизації тестування

## Чому Playwright у 2026

| | Selenium | Playwright |
|---|---|---|
| Протокол | WebDriver | CDP / WebSocket нативний |
| Швидкість | Повільна | 3–5× швидше |
| Auto-wait | Ні (ручний waitFor) | Так (вбудований) |
| Safari/WebKit | Ні | Так |
| API тести | Ні | Так (вбудовано) |
| Network mock | Складно | `page.route()` |
| Паралелізм | Складно | За замовчуванням |

---

## Встановлення та перший запуск

```bash
# Створити новий проєкт
npm init playwright@latest

# Встановити браузери
npx playwright install

# Запустити всі тести
npx playwright test

# З видимим браузером
npx playwright test --headed

# Конкретний файл
npx playwright test tests/auth.spec.ts

# По тегу
npx playwright test --grep @smoke

# Відкрити HTML звіт
npx playwright show-report
```

---

## playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,           // таймаут одного тесту
  expect: { timeout: 5000 }, // таймаут assertion
  fullyParallel: true,       // кожен тест в окремому worker
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['html'],
    ['line'],
  ],

  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    trace: 'on-first-retry',         // трейс при retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['iPhone 14'] } },
  ],
});
```

---

## Локатори

### Пріоритет (від кращого до гіршого)

| Локатор | Коли | Рекомендація |
|---|---|---|
| `getByRole()` | Кнопки, посилання, поля | ✅ Рекомендовано |
| `getByLabel()` | Поля форм з підписом | ✅ Рекомендовано |
| `getByPlaceholder()` | Поля без label | ✅ Добре |
| `getByText()` | Статичний текст | ✅ Добре |
| `getByTestId()` | data-testid атрибути | ✅ Добре |
| `locator('css')` | Коли вище не підходить | ⚠️ Останній варіант |
| `locator('xpath')` | Legacy або складний DOM | ❌ Уникати |

### Приклади

```typescript
// Кнопки і посилання
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /submit/i })  // регекс
page.getByRole('link', { name: 'Home' })

// Поля форм
page.getByLabel('Email address')
page.getByLabel('Password')
page.getByPlaceholder('Search products...')

// Заголовки і текст
page.getByRole('heading', { name: 'Dashboard' })
page.getByText('Order confirmed')
page.getByText('Error', { exact: false })  // contains

// data-testid
page.getByTestId('submit-btn')
// HTML: <button data-testid="submit-btn">Submit</button>

// Вкладені — знайти в контейнері
const card = page.locator('.product-card').first()
const price = card.getByText(/\$\d+/)

// filter — відфільтрувати зі списку
page.getByRole('listitem').filter({ hasText: 'In stock' })

// nth — N-ний елемент (з 0)
page.getByRole('listitem').nth(2)
```

---

## Assertions (Web-first, з auto-retry)

> Playwright автоматично чекає до 5 секунд поки умова стане true. Не потрібен `waitFor()` або `sleep()`.

```typescript
// Видимість
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()

// Текст
await expect(locator).toHaveText('Dashboard')
await expect(locator).toContainText('Dash')
await expect(locator).toHaveText(/pattern/)  // регекс

// URL і заголовок
await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveTitle('My App')

// Значення полів
await expect(page.getByLabel('Email')).toHaveValue('user@test.com')
await expect(page.getByLabel('Name')).toBeEmpty()

// Стан елементів
await expect(locator).toBeEnabled()
await expect(locator).toBeDisabled()
await expect(locator).toBeChecked()
await expect(locator).toBeFocused()

// Атрибути
await expect(locator).toHaveAttribute('aria-expanded', 'true')
await expect(locator).toHaveClass(/active/)

// Кількість
await expect(page.getByRole('listitem')).toHaveCount(5)

// Soft assertions — збирає всі помилки
await expect.soft(locator1).toHaveText('X')
await expect.soft(locator2).toBeVisible()
// Показує всі проблеми після завершення тесту
```

---

## Page Object Model (POM)

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput    = page.getByLabel('Email address')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton  = page.getByRole('button', { name: 'Login' })
    this.errorMessage  = page.getByTestId('login-error')
  }

  async goto() {
    await this.page.goto('/#/auth/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async loginAs(role: 'customer' | 'admin') {
    const creds = {
      customer: { email: 'customer@test.com', password: 'welcome01' },
      admin:    { email: 'admin@test.com',    password: 'AKQmnKx4' },
    }
    await this.login(creds[role].email, creds[role].password)
  }
}
```

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('успішний логін', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.loginAs('customer')

  await expect(page).toHaveURL(/dashboard/)
  await expect(page.getByText('Jane Doe')).toBeVisible()
})
```

---

## Fixtures

```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

type Fixtures = {
  loginPage: LoginPage
  authenticatedPage: void
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await use(loginPage)
  },

  // Автологін перед кожним тестом
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAs('customer')
    await use()
    // cleanup після тесту (якщо потрібен)
  },
})

export { expect } from '@playwright/test'
```

---

## API тести

```typescript
import { test, expect } from '@playwright/test'

// Окремий API тест
test('GET /products', async ({ request }) => {
  const response = await request.get('/api/products')

  expect(response.status()).toBe(200)

  const body = await response.json()
  expect(body.data).toBeInstanceOf(Array)
  expect(body.data[0]).toHaveProperty('id')
  expect(typeof body.data[0].price).toBe('number')
})

// POST з авторизацією
test('POST /orders', async ({ request }) => {
  const response = await request.post('/api/orders', {
    headers: { Authorization: 'Bearer TOKEN' },
    data: { productId: '01', quantity: 2 }
  })

  expect(response.status()).toBe(201)
})

// UI + API комбінація
test('order shows after creation', async ({ page, request }) => {
  // 1. Через API отримати токен
  const { access_token } = await (await request.post('/api/login', {
    data: { email: 'user@test.com', password: 'pass' }
  })).json()

  // 2. Через API створити замовлення
  const { id } = await (await request.post('/api/orders', {
    headers: { Authorization: `Bearer ${access_token}` },
    data: { productId: '01', quantity: 1 }
  })).json()

  // 3. Через UI перевірити відображення
  await page.goto(`/orders/${id}`)
  await expect(page.getByRole('heading')).toContainText(id)
})
```

---

## Network Mocking

```typescript
// Замінити відповідь API
await page.route('**/api/products', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [{ id: '1', name: 'Mock', price: 9.99 }] })
  })
)

// Симулювати помилку сервера
await page.route('**/api/checkout', route =>
  route.fulfill({ status: 500, body: 'Internal Server Error' })
)
await page.getByRole('button', { name: 'Pay' }).click()
await expect(page.getByText('Something went wrong')).toBeVisible()

// Модифікувати реальну відповідь
await page.route('**/api/cart', async route => {
  const response = await route.fetch()
  const body = await response.json()
  body.total = 0
  await route.fulfill({ response, body: JSON.stringify(body) })
})

// Чекати на конкретний запит
const apiCall = page.waitForResponse('**/api/products')
await page.goto('/products')
const response = await apiCall
expect(response.status()).toBe(200)
```

---

## CI/CD — GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - run: npx playwright install --with-deps chromium

      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Дебаг

```typescript
// Зупинитись в конкретному місці
await page.pause()

// Скріншот в довільний момент
await page.screenshot({ path: 'debug.png', fullPage: true })
```

```bash
# Запустити з Inspector
npx playwright test --debug tests/auth.spec.ts

# Переглянути трейс
npx playwright show-trace trace.zip

# Codegen — записати дії як код
npx playwright codegen https://example.com
```

---

## Флакі тести — причини і рішення

```typescript
// ❌ ПОГАНО — hardcoded sleep
await page.waitForTimeout(3000)

// ❌ ПОГАНО — очікування без умови
await page.click('#submit')
await page.waitForTimeout(1000)
expect(await page.locator('.result').textContent()).toBe('OK')

// ✅ ДОБРЕ — чекати конкретну подію
await page.getByRole('button', { name: 'Submit' }).click()
await expect(page).toHaveURL('/success')  // auto-retry

// ✅ ДОБРЕ — чекати мережевий запит
await Promise.all([
  page.waitForResponse('**/api/orders'),
  page.getByRole('button', { name: 'Submit' }).click()
])

// ✅ ДОБРЕ — waitForURL
await page.click('#submit')
await page.waitForURL('/dashboard')
```

---

## Структура проєкту

```
my-tests/
├── playwright.config.ts     ← конфігурація
├── pages/                   ← Page Objects
│   ├── LoginPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/
│   └── index.ts             ← кастомні fixtures
├── tests/
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   └── api/
│       └── products.spec.ts
└── .github/workflows/
    └── playwright.yml
```

---

## Питання на співбесіді

### «Чим Playwright кращий за Selenium?»
> Playwright використовує CDP (Chrome DevTools Protocol) для прямої комунікації з браузером — це в 3–5 разів швидше ніж WebDriver. Вбудований auto-wait, підтримка Safari, API тести і network mocking з коробки.

### «Що таке Page Object Model?»
> Патерн де кожна сторінка — окремий клас з локаторами і методами. Тести стають читабельними і підтримуваними: при зміні UI міняєш тільки Page Object, не всі тести.

### «Що таке fixtures в Playwright?»
> Механізм підготовки стану перед тестом (setup) і очищення після (teardown). Дозволяє реюзати спільну логіку (наприклад, авторизацію) між тестами без дублювання коду.

### «Чому не можна використовувати waitForTimeout?»
> `waitForTimeout` — hardcoded sleep. Тест або чекає надто довго (повільний), або падає якщо система відповіла ще повільніше. Правильно: чекати конкретну умову через assertions або `waitForURL`, `waitForResponse`.
