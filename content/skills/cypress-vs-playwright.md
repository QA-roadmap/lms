# Cypress vs Playwright: порівняння у 2026 році

## Коротко: вердикт 2026

| | Cypress | Playwright |
|---|---|---|
| **Новий проєкт** | ⚠️ Якщо команда вже знає | ✅ Рекомендовано |
| **Safari/WebKit** | ❌ Ні | ✅ Так |
| **Mobile** | ❌ Ні | ✅ Емуляція |
| **Паралелізм** | 💰 Платно (Cloud) | ✅ Безкоштовно |
| **API тести** | ⚠️ Обмежено | ✅ Повноцінно |
| **Новачок** | ✅ Легша крива | ⚠️ async/await |
| **Multi-tab, popup** | ❌ Ні | ✅ Так |

---

## Архітектурна різниця (ключове розуміння)

### Cypress — в браузері

Тест-код виконується **ВСЕРЕДИНІ браузера**:

- ✅ Прямий доступ до DOM без затримок
- ✅ Time-travel debugging
- ❌ Неможливі нові вкладки (`window.open`)
- ❌ Немає cross-origin iframe
- ❌ Немає Safari

### Playwright — поза браузером

Тест-код виконується **в Node.js** і керує браузером ззовні через CDP / WebSocket:

```
Node.js (тест-код)  →  CDP / WebSocket  →  Браузер
```

- ✅ Повний контроль над браузером
- ✅ Safari, Firefox, Chrome, Mobile
- ✅ Multi-tab, popups, cross-origin
- ❌ Крутіша крива навчання

> На співбесіді саме це пояснення демонструє глибоке розуміння, а не перелік фіч.

---

## Синтаксис: той самий тест

### Cypress
```javascript
describe('Auth', () => {
  it('logs in successfully', () => {
    cy.visit('/auth/login')

    cy.get('[data-cy=email]')
      .type('user@test.com')

    cy.get('[data-cy=password]')
      .type('pass123')

    cy.get('[data-cy=submit]')
      .click()

    cy.url()
      .should('include', '/dashboard')

    cy.contains('Welcome, User')
      .should('be.visible')
  })
})
```

### Playwright
```typescript
import { test, expect } from '@playwright/test'

test('logs in successfully', async ({ page }) => {
  await page.goto('/auth/login')

  await page.getByLabel('Email')
    .fill('user@test.com')

  await page.getByLabel('Password')
    .fill('pass123')

  await page.getByRole('button', { name: 'Login' })
    .click()

  await expect(page)
    .toHaveURL(/dashboard/)

  await expect(page.getByText('Welcome, User'))
    .toBeVisible()
})
```

**Різниця у підходах:**
- Cypress: синхронний стиль, `.then()` для роботи зі значеннями
- Playwright: стандартний `async/await`, явна асинхронність

---

## Локатори

### Cypress — CSS-орієнтований
```javascript
cy.get('#submit-btn')              // ID
cy.get('.product-card')            // клас
cy.get('[data-cy="email-input"]')  // data-атрибут (рекомендовано)
cy.contains('Submit')              // текст
cy.contains('h2', 'Dashboard')     // тег + текст

// В межах контейнера
cy.get('.cart').within(() => {
  cy.contains('Total')
  cy.get('.price').should('exist')
})
```

### Playwright — семантичний
```typescript
page.getByRole('button', { name: 'Submit' }) // роль
page.getByLabel('Email address')             // label
page.getByPlaceholder('Search...')           // placeholder
page.getByText('Total: $150')               // текст
page.getByTestId('email-input')             // data-testid

// Вкладені і фільтровані
page.locator('.cart')
  .getByRole('button', { name: 'Remove' })
page.getByRole('listitem')
  .filter({ hasText: 'In stock' })
```

**Перевага Playwright:** `getByRole` і `getByLabel` стабільніші при рефакторингу стилів, відображають accessibility.

---

## Підтримка браузерів

| Браузер | Cypress | Playwright |
|---|---|---|
| Chrome / Chromium | ✅ | ✅ |
| Firefox | ✅ (обмежено) | ✅ (повна підтримка) |
| **Safari / WebKit** | ❌ | ✅ |
| Edge | Chromium-based | ✅ нативно |
| **Mobile браузери** | ❌ | ✅ (емуляція) |
| Cross-browser одночасно | ❌ | ✅ (projects) |

```typescript
// Playwright — запуск в 4 браузерах одночасно
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  { name: 'mobile',   use: { ...devices['iPhone 14'] } },
]
```

---

## API тестування

### Cypress
```javascript
cy.request({
  method: 'POST',
  url: '/api/login',
  body: { email: 'user@test.com', password: 'pass123' }
}).then(resp => {
  expect(resp.status).to.eq(200)
  expect(resp.body).to.have.property('token')
})

// Обхід UI через API (популярна практика)
cy.request('POST', '/api/login', creds)
  .its('body.token')
  .then(token => cy.setCookie('auth_token', token))
```

**Обмеження Cypress:** немає gRPC, WebSocket нативно; API тести — окремо від UI тестів ментально.

### Playwright
```typescript
// API і UI в одному проєкті
test('combined test', async ({ page, request }) => {
  const { token } = await (await request.post('/api/login', {
    data: { email: 'user@test.com', password: 'pass123' }
  })).json()

  await page.goto('/dashboard')
  await page.evaluate(t =>
    localStorage.setItem('token', t), token)
})
```

**Перевага:** один інструмент для UI і API, спільні fixtures, єдиний звіт.

---

## Паралелізм

### Cypress
```bash
# Між файлами — безкоштовно
cypress run --parallel

# Всередині файлу — завжди послідовно
# Sharding між CI машинами — потрібен Cypress Cloud ($75+/міс)
```

### Playwright
```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,  // кожен тест в окремому worker
  workers: process.env.CI ? 2 : 4,
})

// Sharding вбудований — без платних сервісів
// npx playwright test --shard=1/3
// npx playwright test --shard=2/3
// npx playwright test --shard=3/3
```

| | Cypress | Playwright |
|---|---|---|
| Між файлами | Так (безкоштовно) | Так (за замовч.) |
| Між тестами | Ні | Так |
| Sharding | Cypress Cloud 💰 | Вбудований ✅ |
| 100 тестів | ~8–12 хв | ~2–4 хв |

---

## DX і дебаг

### Cypress — Time Travel Debugger
```
npx cypress open

→ GUI в браузері
→ Список тестів
→ Наведи на будь-який крок → бачиш DOM в той момент
→ Автоматичні скріншоти кожного кроку
→ Відео запис за замовчуванням
```

**Плюс:** найкращий DX для новачків — інтуїтивно, наочно.

### Playwright — Trace Viewer + VS Code
```
# Trace Viewer — post-mortem аналіз
npx playwright show-trace trace.zip
→ Скріншот кожного кроку
→ Деталі мережевих запитів
→ Console logs

# VS Code Extension
→ Run/Debug тести з редактора
→ Breakpoints в тест-коді
→ Highlight локатора прямо на сторінці
```

---

## Обмеження Cypress (архітектурні)

```javascript
// ❌ Нові вкладки — неможливо нативно
// window.open() блокується

// ❌ Cross-origin iframe
// cy.get('#payment-iframe')  // не можна перейти всередину

// ❌ Кілька вкладок
// Неможливо тестувати "відкрити в новій вкладці"

// ✅ Workaround для iframe (тільки same-origin)
cy.get('#iframe').then($iframe => {
  cy.wrap($iframe.contents().find('body'))
    .find('#card-number').type('4242...')
})
```

### Playwright вирішує всі ці обмеження
```typescript
// ✅ Нові вкладки
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.getByText('Open in new tab').click()
])

// ✅ Cross-origin iframe
const frame = page.frameLocator('#payment-iframe')
await frame.getByLabel('Card number').fill('4242...')

// ✅ Popup windows
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByText('Open popup').click()
])
await popup.waitForLoadState()
```

---

## Коли що вибирати

### Вибирай Playwright якщо:
- ✅ Стартуєш новий проєкт у 2026
- ✅ Продукт з iOS/macOS користувачами (потрібен WebKit)
- ✅ Потрібен один інструмент для UI і API тестів
- ✅ Важливий паралелізм без платних сервісів
- ✅ Є multi-tab, popups або cross-origin iframe сценарії
- ✅ Команда знає JavaScript/TypeScript async/await

### Вибирай Cypress якщо:
- ✅ Команда вже знає Cypress і є велика тест-suite
- ✅ Новачки без JS досвіду — Time Travel легший для старту
- ✅ Продукт тільки для Chrome/Firefox
- ✅ Компонентне тестування React/Vue — Cypress Component Testing дуже зрілий
- ✅ Важлива наочна демонстрація тестів замовнику

### Не мігруй заради міграції
Якщо команда щаслива з Cypress і проєкт не потребує Safari чи мобільних — не мігруй заради міграції. Витрати на переписування тестів рідко виправдані.

---

## Питання на співбесіді

### «Чим архітектурно відрізняється Cypress від Playwright?»
> Cypress виконує тест-код всередині браузера — це дає чудовий Time Travel debugger, але накладає обмеження: неможливі нові вкладки, cross-origin iframe, Safari. Playwright виконується в Node.js і спілкується з браузером через CDP — звідси повна підтримка всіх браузерів і сценаріїв.

### «Який інструмент краще у 2026?»
> Для нового проєкту — Playwright: швидший, підтримує Safari і mobile, безкоштовний паралелізм, один інструмент для UI і API. Cypress доцільний якщо команда вже його знає або потрібен Component Testing.

### «Чому Playwright швидший?»
> Playwright паралельний за замовчуванням — кожен тест у окремому worker. Cypress запускає тести послідовно в межах файлу. При 100 тестах різниця — 2–4 хвилини проти 8–12.
