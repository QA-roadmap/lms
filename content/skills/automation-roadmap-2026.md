# Roadmap: автоматизація тестування з нуля у 2026

## Реалістичний таймлайн

> **1–1.5 години щодня → за 3–4 місяці** ти зможеш писати Playwright тести для UI і API, запускати їх у GitHub Actions і показувати це в резюме.

---

## Фаза 1 — JavaScript для QA

**Тривалість: ~4–6 тижнів**

Не потрібно вчити всю мову. Тільки те, що реально зустрічається в тестах.

### Змінні, типи, умови, цикли

```javascript
// Типи даних
const name = 'Anna'          // string
const age = 25               // number
const isActive = true        // boolean
const items = ['a', 'b']     // array
const user = { id: 1 }       // object

// Умови
if (age >= 18) {
  console.log('Дозволено')
} else {
  console.log('Заборонено')
}

// Цикл
for (const item of items) {
  console.log(item)
}
```

**Перший крок:** пройти перші 10 годин [javascript.info](https://javascript.info). Зупинитись на об'єктах і масивах — вистачить для старту.

---

### Async/Await — основа сучасного тестування

Playwright, API-запити — все асинхронне. Без цього будеш копіювати код не розуміючи.

```javascript
// Синхронний код — виконується послідовно
console.log('1')
console.log('2')
// → 1, 2

// Асинхронний — чекаємо на результат
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`)
  const user = await response.json()
  return user
}

// У тесті
test('user exists', async ({ request }) => {
  const response = await request.get('/api/users/42')  // чекаємо
  const body = await response.json()                   // чекаємо
  expect(body.name).toBe('Anna')
})
```

**Перший крок:** зрозуміти різницю між синхронним і асинхронним кодом, написати 3 приклади з `await`.

---

### Модулі та npm

```bash
# Ініціалізувати проєкт
npm init

# Встановити пакет
npm install @playwright/test

# Запустити скрипт
node script.js
```

```javascript
// Експорт з файлу
export class LoginPage { ... }

// Імпорт в тест
import { LoginPage } from '../pages/LoginPage'
```

**Перший крок:** створити проєкт командою `npm init`, встановити один пакет.

---

## Фаза 2 — UI автоматизація: Playwright

**Тривалість: ~6–8 тижнів**

### Чому Playwright, а не Selenium

| | Selenium | Playwright |
|---|---|---|
| Протокол | WebDriver | CDP (нативний) |
| Швидкість | Повільна | 3–5× швидше |
| Auto-wait | Ні (ручний waitFor) | Так (вбудований) |
| Safari | Ні | Так |
| API тести | Ні | Так |

**Перший крок:**
```bash
npx playwright install
npx playwright test  # запустити demo тест
npx playwright show-report
```

---

### Локатори — пріоритет

```typescript
// ✅ Рекомендовано — семантичні
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
page.getByPlaceholder('Search...')
page.getByText('Order confirmed')
page.getByTestId('submit-btn')   // data-testid="submit-btn"

// ⚠️ Останній варіант — CSS/XPath
page.locator('#submit')          // ламається при рефакторингу
page.locator('//button')
```

**Чому getByRole стабільніший:** відображає те що бачить користувач і скрін-рідер, не залежить від CSS класів.

---

### Assertions з auto-retry

```typescript
// Playwright автоматично чекає до 5 секунд
// Не потрібен waitFor() або sleep()!

await expect(page.getByText('Success')).toBeVisible()
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveTitle('My App')
await expect(page.getByLabel('Email')).toHaveValue('user@test.com')
await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled()
await expect(page.getByRole('listitem')).toHaveCount(5)
```

**Перший крок:** написати 5 тестів використовуючи тільки `getByRole` і `getByLabel`.

---

### Page Object Model (POM)

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(private page: Page) {
    this.emailInput    = page.getByLabel('Email address')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton  = page.getByRole('button', { name: 'Login' })
  }

  async goto() {
    await this.page.goto('/#/auth/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

```typescript
// tests/auth.spec.ts — чистий і читабельний тест
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('успішний логін', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@test.com', 'pass123')

  await expect(page).toHaveURL(/dashboard/)
})
```

**Перший крок:** перенести один існуючий тест у Page Object структуру.

---

### Fixtures — підготовка стану

```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

export const test = base.extend({
  // Автологін перед кожним тестом
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('user@test.com', 'pass123')
    await use()
  }
})

// tests/dashboard.spec.ts
test('dashboard loads', async ({ page, authenticatedPage }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading')).toBeVisible()
})
```

**Перший крок:** створити auth fixture який логінить один раз перед усіма тестами.

---

### Network мокінг

```typescript
// Замінити відповідь API
await page.route('**/api/products', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [{ name: 'Mock', price: 9.99 }] })
  })
)

// Симулювати помилку сервера
await page.route('**/api/checkout', route =>
  route.fulfill({ status: 500 })
)
await page.getByRole('button', { name: 'Pay' }).click()
await expect(page.getByText('Something went wrong')).toBeVisible()
```

**Перший крок:** написати тест де `page.route()` повертає 500 і перевірити поведінку UI.

---

## Фаза 3 — API автоматизація

**Тривалість: ~4–5 тижнів**

### Playwright request context

```typescript
import { test, expect } from '@playwright/test'

test('GET /products', async ({ request }) => {
  const response = await request.get('/api/products')

  expect(response.status()).toBe(200)

  const body = await response.json()
  expect(body.data).toBeInstanceOf(Array)
  expect(typeof body.data[0].price).toBe('number')
})

test('POST /users', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Anna', email: 'a@test.com' }
  })
  expect(response.status()).toBe(201)
})

// UI + API в одному тесті
test('order shows after creation', async ({ page, request }) => {
  const { id } = await (await request.post('/api/orders', {
    headers: { Authorization: 'Bearer TOKEN' },
    data: { productId: '01', quantity: 1 }
  })).json()

  await page.goto(`/orders/${id}`)
  await expect(page.getByRole('heading')).toContainText(id)
})
```

**Перший крок:** написати CRUD тести для публічного API [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com).

---

### Newman — Postman колекції в CI

```bash
# Встановити
npm install -g newman

# Запустити колекцію
newman run collection.json \
  --environment env.json \
  --reporters htmlextra
```

**Перший крок:** експортувати свою Postman колекцію і запустити через newman в терміналі.

---

### JSON Schema validation

```javascript
// Postman — перевірка структури відповіді
pm.test("Response matches schema", () => {
    const schema = {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
            id:    { type: "number" },
            name:  { type: "string" },
            email: { type: "string", format: "email" }
        },
        additionalProperties: false
    };
    pm.response.to.have.jsonSchema(schema);
});
```

---

## Фаза 4 — CI/CD інтеграція

**Тривалість: ~2–3 тижні**

### Git — основи

```bash
git clone https://github.com/user/repo
git checkout -b feature/add-login-tests
git add .
git commit -m "add: login test suite"
git push origin feature/add-login-tests
# → відкрити Pull Request
```

**Перший крок:** створити GitHub репозиторій, запушити свій Playwright проєкт.

---

### GitHub Actions

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

      - name: Run tests
        run: npx playwright test
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

При кожному PR — тести запускаються автоматично. Якщо падають — merge заблоковано.

**Перший крок:** додати `.github/workflows/tests.yml` який запускає `npx playwright test` при кожному push.

---

### Звіти і артефакти

```bash
# Локально
npx playwright show-report

# Trace Viewer — детальний аналіз впалого тесту
npx playwright show-trace trace.zip

# Запуск з трейсом
npx playwright test --trace on
```

---

## Фаза 5 — AI-era скіли

**Паралельно з фазами 2–4**

### Playwright Codegen

```bash
# Записати дії → отримати код
npx playwright codegen https://practicesoftwaretesting.com
```

Генерує чернетку тесту. Не ідеальний код, але дає старт. Workflow: **згенерував → відрефакторив → додав assertions**.

---

### AI як пара-програміст

Використовуй Claude/ChatGPT для:
- «Чому цей тест флакі?» → вставити код
- «Як виправити цю помилку?» → вставити stack trace
- «Напиши Page Object для цієї HTML структури»
- «Поясни чому цей локатор нестабільний»

> ⚠️ Головне — **розуміти** що генерується, не сліпо копіювати.

**Перший крок:** взяти свій нестабільний тест і попросити AI пояснити чому він може падати.

---

## Перший реальний тест — з нуля за 15 хвилин

```bash
npm init playwright@latest
npx playwright install
```

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('успішний логін', async ({ page }) => {
  await page.goto('https://practicesoftwaretesting.com/#/auth/login');

  await page.getByLabel('Email address')
    .fill('customer@practicesoftwaretesting.com');
  await page.getByLabel('Password')
    .fill('welcome01');
  await page.getByRole('button', { name: 'Login' })
    .click();

  await expect(page.getByText('Jane Doe')).toBeVisible();
  await expect(page).toHaveURL(/dashboard/);
});

test('логін з невірним паролем', async ({ page }) => {
  await page.goto('https://practicesoftwaretesting.com/#/auth/login');

  await page.getByLabel('Email address')
    .fill('customer@practicesoftwaretesting.com');
  await page.getByLabel('Password')
    .fill('wrongpassword');
  await page.getByRole('button', { name: 'Login' })
    .click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
```

> [practicesoftwaretesting.com](https://practicesoftwaretesting.com) — безкоштовний тренувальний сайт для QA автоматизації з логіном, кошиком і API.

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

## Три типові помилки початківців

### ❌ Вивчати Selenium у 2026
Selenium ще живий у legacy проєктах, але для старту в 2026 він тільки ускладнить шлях. Playwright простіший, швидший і має кращу документацію.

### ❌ Пропустити JavaScript і одразу брати інструмент
Без базового розуміння `async/await` і об'єктів ти будеш копіювати код не розуміючи що відбувається. **Два тижні на JS-основи окупляться у рази.**

### ❌ Вчитись тільки на синтетичних прикладах
Найкраще закріплення — взяти будь-який живий сайт і написати 10 реальних тестів. Тільки так з'являються справжні питання, на які шукаєш відповіді.

---

## Корисні ресурси

| Ресурс | Для чого |
|---|---|
| [javascript.info](https://javascript.info) | Вивчення JavaScript |
| [playwright.dev](https://playwright.dev) | Офіційна документація |
| [practicesoftwaretesting.com](https://practicesoftwaretesting.com) | Тренувальний сайт для QA |
| [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) | Публічний API для практики |
| [github.com/microsoft/playwright](https://github.com/microsoft/playwright) | Приклади і issues |

---

## Питання на співбесіді

### «Яка різниця між getByRole і CSS локатором?»
> `getByRole` — семантичний локатор, який відображає те що бачить користувач і скрін-рідер. Стабільний при рефакторингу стилів. CSS локатор типу `.btn-primary` ламається при зміні класів.

### «Що таке Page Object Model?»
> Паттерн де кожна сторінка — окремий клас з локаторами і методами. При зміні UI міняєш тільки Page Object, не всі тести.

### «Навіщо CI/CD для тестів?»
> Автоматичний запуск тестів при кожному PR гарантує що нові зміни не ламають існуючу функціональність. Якщо тести падають — merge заблоковано до виправлення.

### «Чому не можна використовувати `waitForTimeout`?»
> Hardcoded sleep — тест або чекає надто довго, або падає якщо система відповіла повільніше. Правильно: чекати конкретну умову через assertions або `waitForURL`, `waitForResponse`.
