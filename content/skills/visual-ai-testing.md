# Visual AI Testing: що це і які інструменти є

## Що таке visual testing

Visual testing — автоматична перевірка що зовнішній вигляд сторінки або компонента не змінився після оновлень коду. Робиться скріншот, порівнюється з базлайном (еталонним знімком).

### Проблема класичного pixel-by-pixel підходу

Класичний pixel diff порівнює кожен піксель базлайну з поточним скріншотом. Будь-яка різниця — fail.

```
Причини хибних спрацювань (false positives):
- Антиаліасинг шрифтів відрізняється між ОС
- Рендеринг тіней і blur між браузерами
- Нова версія Chrome → тисячі failed тестів
- Анімації фіксуються в різний момент часу
- Субпіксельні відмінності в розташуванні елементів
```

### Що таке AI visual testing

AI visual testing використовує ML модель, що **розуміє семантику змін** — відрізняє значущу регресію від рендеринг артефактів.

| | Pixel-by-pixel | AI visual testing |
|---|---|---|
| **Хибні спрацювання** | Багато (антиаліасинг, шрифти) | Мінімум |
| **Cross-browser** | Ламається | Стійкий |
| **Нова версія ОС** | Тисячі fail | Ігнорує |
| **Реальний баг** | Знаходить | Знаходить |
| **Масштабованість** | Погана | Висока |

---

## Що перевіряється у visual testing

```
Типові сценарії:
- Зникла кнопка або елемент навігації
- Зміна кольору без дозволу дизайнера
- Зламаний layout на мобільному
- Перекриття елементів (overlap)
- Темна тема відображається некоректно
- Компонент виглядає по-різному в Chrome vs Firefox
- Адаптивний дизайн зламано на планшеті
```

---

## Інструмент 1: Applitools Eyes

Провідний AI-based visual testing platform з власною ML моделлю (Visual AI).

### Характеристики

| | |
|---|---|
| Підхід | Visual AI — власна ML модель |
| Ціна | Безкоштовно до 100 чекпоінтів/місяць |
| Інтеграція | Playwright, Cypress, Selenium, WebDriverIO |
| Особливість | Ultrafast Grid — паралельно в 50+ браузерах |

### Інтеграція з Playwright

```typescript
import { Eyes, Target } from '@applitools/eyes-playwright'
import { test } from '@playwright/test'

test('visual check dashboard', async ({ page }) => {
  const eyes = new Eyes()

  await eyes.open(page, 'My App', 'Dashboard Test')
  await page.goto('/dashboard')

  // Перевірити всю сторінку
  await eyes.check('Dashboard', Target.window().fully())

  // Перевірити конкретний елемент
  await eyes.check(
    'Header',
    Target.region(page.locator('header'))
  )

  await eyes.close()
})
```

### Ultrafast Grid — один тест, 50+ браузерів

```typescript
import { Configuration, BrowserType } from '@applitools/eyes-playwright'

const config = new Configuration()
config.addBrowser(1280, 800, BrowserType.CHROME)
config.addBrowser(1280, 800, BrowserType.FIREFOX)
config.addBrowser(1280, 800, BrowserType.SAFARI)
config.addBrowser(375, 812, BrowserType.CHROME)   // iPhone
config.addBrowser(768, 1024, BrowserType.CHROME)  // iPad

// Один тест → результат в усіх браузерах одразу
// Без запуску реальних браузерів локально
```

### Плюси та мінуси

**Плюси:** Visual AI ігнорує рендеринг артефакти. Ultrafast Grid — паралельний cross-browser. Детальний dashboard з diff.

**Мінуси:** Платна для великих команд. Vendor lock-in. Потрібен інтернет для аналізу.

---

## Інструмент 2: Percy (BrowserStack)

Visual review platform з DOM snapshot підходом.

### Характеристики

| | |
|---|---|
| Підхід | DOM snapshot + pixel diff з AI шумоподавленням |
| Ціна | Безкоштовно до 5000 знімків/місяць |
| Інтеграція | Playwright, Cypress, Storybook, GitHub |
| Особливість | DOM snapshot — стабільніший ніж screenshot |

### Інтеграція з Playwright

```typescript
import { percySnapshot } from '@percy/playwright'
import { test } from '@playwright/test'

test('visual check', async ({ page }) => {
  await page.goto('/products')

  // Зробити Percy snapshot
  await percySnapshot(page, 'Products Page')

  // З налаштуваннями для різних розмірів
  await percySnapshot(page, 'Products Responsive', {
    widths: [375, 768, 1280],
    minHeight: 1024,
  })
})
```

### Storybook інтеграція

```bash
# Percy автоматично знімає всі Storybook stories
npx percy storybook http://localhost:6006

# Percy diff показує зміни по компонентах
# → UI Review в Percy dashboard
# → Approve або Request changes
```

### Плюси та мінуси

**Плюси:** Відмінна Storybook інтеграція. DOM snapshot точніший за screenshot. Зручний PR workflow у GitHub.

**Мінуси:** Менш потужний AI ніж Applitools. Тільки хмарний. Платна для великих команд.

---

## Інструмент 3: Playwright Screenshots (вбудований)

Базовий visual testing без зовнішніх сервісів — вбудований у Playwright.

### Характеристики

| | |
|---|---|
| Підхід | Pixel diff з налаштуванням порогу |
| Ціна | Повністю безкоштовно |
| Зберігання | Локально або в репозиторії |
| Обмеження | Немає AI — класичний pixel diff |

### Базовий visual тест

```typescript
import { test, expect } from '@playwright/test'

test('homepage looks correct', async ({ page }) => {
  await page.goto('/')

  // Перший запуск: створює базлайн
  // Наступні: порівнює з базлайном
  await expect(page).toHaveScreenshot('homepage.png')

  // З порогом допустимих відмінностей
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,        // макс. кількість різних пікселів
    threshold: 0.2,            // % різниці на піксель (0.0–1.0)
    animations: 'disabled',    // зупинити CSS анімації
    fullPage: true,            // знімок всієї сторінки
  })

  // Скріншот конкретного елемента
  await expect(page.locator('.header')).toHaveScreenshot(
    'header.png',
    { maxDiffPixelRatio: 0.01 }  // 1% різниці
  )
})
```

### Маскування динамічного контенту

```typescript
// Приховати елементи що завжди змінюються
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.timestamp'),          // дата і час
    page.locator('.user-avatar'),        // аватар
    page.locator('[data-testid="live-price"]'), // live дані
    page.locator('.ad-banner'),          // реклама
  ],
  maskColor: '#FF00FF',  // замінити на рожевий прямокутник
})
```

### Управління базлайном

```bash
# Оновити базлайн (після навмисних змін UI)
npx playwright test --update-snapshots

# Запустити тільки visual тести
npx playwright test --grep "@visual"

# Переглянути diff у HTML звіті
npx playwright show-report
```

### Плюси та мінуси

**Плюси:** Безкоштовно. Не потрібні зовнішні сервіси. Маскування динаміки. Достатньо для простих задач.

**Мінуси:** Багато false positives. Ламається від шрифтів і браузерів. Немає AI. Погано масштабується.

---

## Інструмент 4: BackstopJS

Open-source visual regression testing — повністю безкоштовний.

### Характеристики

| | |
|---|---|
| Підхід | Pixel diff з налаштовуваним порогом |
| Ціна | Повністю безкоштовно |
| Запуск | Локально або Docker |
| Особливість | HTML звіт з side-by-side diff |

### Конфігурація backstop.json

```json
{
  "id": "my-app",
  "viewports": [
    { "label": "desktop", "width": 1280, "height": 800 },
    { "label": "tablet",  "width": 768,  "height": 1024 },
    { "label": "mobile",  "width": 375,  "height": 812 }
  ],
  "scenarios": [
    {
      "label": "Homepage",
      "url": "http://localhost:3000",
      "delay": 500,
      "misMatchThreshold": 0.1,
      "requireSameDimensions": true,
      "hideSelectors": [".ads", ".timestamp"],
      "selectors": ["document"]
    },
    {
      "label": "Login form",
      "url": "http://localhost:3000/login",
      "selectors": ["#login-form"],
      "misMatchThreshold": 0.05
    },
    {
      "label": "Product card",
      "url": "http://localhost:3000/products",
      "selectors": [".product-card:first-child"],
      "clickSelector": ".product-card",
      "delay": 300,
      "misMatchThreshold": 0.1
    }
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "html_report": "backstop_data/html_report"
  }
}
```

### Команди

```bash
backstop reference   # створити базлайн (перший запуск)
backstop test        # запустити порівняння
backstop approve     # затвердити зміни як новий базлайн
backstop openReport  # відкрити HTML звіт у браузері
```

### Плюси та мінуси

**Плюси:** Повністю безкоштовно. Self-hosted. Хороший HTML звіт. Docker підтримка для CI.

**Мінуси:** Немає AI — класичний pixel diff. Потребує налаштування порогів вручну. Повільніший за хмарні рішення.

---

## Типові тест-кейси для visual testing

```typescript
// 1. Повна сторінка
await eyes.check('Homepage', Target.window().fully())

// 2. Конкретний компонент
await eyes.check('Navigation', Target.region(page.locator('nav')))

// 3. Responsive — різні viewport
for (const width of [375, 768, 1024, 1280]) {
  await page.setViewportSize({ width, height: 900 })
  await eyes.check(`Homepage ${width}px`, Target.window())
}

// 4. Стани компонентів (hover, active, focus)
const button = page.getByRole('button', { name: 'Submit' })

await button.hover()
await eyes.check('Button — hover state', Target.region(button))

await button.focus()
await eyes.check('Button — focus state', Target.region(button))

// 5. Темна тема
await page.emulateMedia({ colorScheme: 'dark' })
await eyes.check('Homepage — dark mode', Target.window())

// 6. Після взаємодії
await page.locator('#menu-toggle').click()
await eyes.check('Mobile menu — open', Target.window())

// 7. Форма з помилками
await page.getByRole('button', { name: 'Submit' }).click()
await eyes.check('Form — validation errors', Target.region(page.locator('form')))

// 8. Empty state
await eyes.check('Products — empty state', Target.window())
```

---

## Workflow: visual testing у CI/CD

```
PR відкрито
    ↓
Playwright тести запускають visual checks
    ↓
Скріншоти надсилаються до Applitools/Percy
    ↓
AI аналізує відмінності від базлайну
    ↓
┌─────────────────────┬──────────────────────────┐
│ Немає змін          │ Є зміни                  │
│ → Auto-approve      │ → Команда ревʼює         │
│ → PR checks зелені  │ → Approve або reject     │
└─────────────────────┴──────────────────────────┘
```

### GitHub Actions інтеграція

```yaml
# .github/workflows/visual.yml
name: Visual Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run visual tests
        run: npx playwright test --grep @visual
        env:
          APPLITOOLS_API_KEY: ${{ secrets.APPLITOOLS_API_KEY }}
          # або для Percy:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff-report
          path: playwright-report/
```

---

## Як оновлювати базлайн

Visual тест не просто Pass/Fail — зміна зовнішнього вигляду може бути **навмисною** (дизайнер оновив кнопку) або **ненавмисною** (CSS регресія). Тому потрібен людський ревʼю.

```
Workflow оновлення базлайну:

1. Дизайнер вніс зміни в компоненти
2. Visual тести показують diff
3. QA ревʼює: чи це заплановані зміни?
4. Якщо так → Approve в Applitools/Percy dashboard
   або: npx playwright test --update-snapshots
5. Новий базлайн зафіксовано
6. Наступний PR: порівняння з новим базлайном
```

---

## Вибір інструменту

| | Applitools | Percy | Playwright built-in | BackstopJS |
|---|---|---|---|---|
| AI diff | Так (найкращий) | Частково | Ні | Ні |
| Безкоштовно | Обмежено | Обмежено | Повністю | Повністю |
| Cross-browser | Ultrafast Grid | Так | Ні | Обмежено |
| Self-hosted | Ні | Ні | Так | Так |
| Storybook | Так | Відмінно | Ні | Ні |
| Складність | Середня | Низька | Найнижча | Низька |

**Рекомендація:**
- Старт / невеликий проєкт → **Playwright built-in** (безкоштовно, без налаштувань)
- Серйозне cross-browser тестування → **Applitools** (найкращий AI)
- Компонентна бібліотека + Storybook → **Percy** (найкраща інтеграція)
- Self-hosted, budget = 0 → **BackstopJS**

---

## Питання на співбесіді

### «Що таке visual regression testing?»
> Автоматична перевірка що зовнішній вигляд сторінки не змінився після оновлень. Робиться скріншот, порівнюється з базлайном. AI-підхід ігнорує незначні рендеринг відмінності і виявляє семантичні зміни.

### «Чому класичний pixel diff не підходить?»
> Антиаліасинг, зміна шрифту або рендеринг між браузерами дає тисячі хибних спрацювань. AI розуміє що змінилось значуще, а що — шум.

### «Коли visual тести потрібні?»
> Для компонентних бібліотек (зміна кнопки не повинна зламати 50 місць), для landing pages де важливий точний вигляд, для cross-browser тестування, для перевірки темної теми та responsive дизайну.

### «Що таке базлайн і як його оновлювати?»
> Базлайн — еталонний скріншот з яким порівнюються наступні запуски. Оновлюється коли зміни UI навмисні: після ревʼю QA в dashboard Applitools/Percy або командою `--update-snapshots` в Playwright.

### «Як боротись з false positives у visual тестах?»
> Використовувати AI-інструменти (Applitools, Percy). При Playwright built-in: маскувати динамічний контент (`mask`), встановлювати розумний поріг (`threshold`), вимикати анімації (`animations: disabled`).
