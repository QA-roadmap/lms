# Інструменти та оточення QA: Git, Docker, SQL, DevTools

## Git для тестувальника

### Навіщо QA знати Git

Тести живуть у репозиторії поряд з кодом. QA пише код тестів, робить PR, бере участь у code review. Без Git — неможливо повноцінно працювати в команді.

### Базові команди

```bash
# Клонувати репозиторій
git clone https://github.com/org/repo.git
cd repo

# Перевірити поточний стан
git status
git log --oneline -10  # останні 10 комітів

# Створити гілку для нових тестів
git checkout -b tests/add-auth-tests

# Зберегти зміни
git add tests/auth.spec.ts
git add .                    # всі зміни
git commit -m "test: add login and logout tests"

# Завантажити на GitHub
git push origin tests/add-auth-tests

# Отримати останні зміни
git pull origin main

# Переключитись на іншу гілку
git checkout main
git checkout develop

# Переглянути різницю
git diff                     # незбережені зміни
git diff main..HEAD          # різниця з main
```

### Workflow QA в команді

```bash
# 1. Почати роботу — завжди з актуальної main
git checkout main
git pull origin main

# 2. Створити гілку
git checkout -b tests/JIRA-123-checkout-tests

# 3. Написати тести, зберегти
git add .
git commit -m "test(checkout): add payment flow tests

- add positive flow with valid card
- add declined card scenario
- add empty cart edge case"

# 4. Завантажити і відкрити PR
git push origin tests/JIRA-123-checkout-tests
# → GitHub → New Pull Request

# 5. Після мерджу — прибрати гілку
git checkout main
git pull origin main
git branch -d tests/JIRA-123-checkout-tests
```

### Конвенція комітів

```bash
# Формат: type(scope): description
test(auth): add login with invalid credentials
test(cart): add IDOR check for order access
fix(utils): correct timeout in base page object
chore(deps): update playwright to 1.45.0
docs(readme): add test environment setup guide
```

### .gitignore для тестового проєкту

```gitignore
# Playwright
playwright-report/
test-results/
.auth/

# Середовище
.env
.env.local
.env.*.local
node_modules/

# ОС
.DS_Store
Thumbs.db
```

### Корисні команди для дебагу

```bash
# Хто і коли змінив рядок (blame)
git blame tests/auth.spec.ts

# Знайти коміт де зламалось (bisect)
git bisect start
git bisect bad HEAD          # зараз погано
git bisect good v1.0.0       # тут було добре
# Git автоматично перемикається між комітами
# Ти запускаєш тест і кажеш good/bad

# Скасувати незбережені зміни
git restore tests/auth.spec.ts
git restore .                # всі файли

# Подивитись що в PR
git fetch origin
git diff origin/main..origin/feature/branch
```

---

## Docker для тестувальника

### Навіщо QA знати Docker

Docker дозволяє запустити тестове середовище (БД, сервіси, додаток) без ручного встановлення. Один командою — повне ізольоване оточення.

### Базові команди

```bash
# Запустити контейнер
docker run postgres:16           # запустити PostgreSQL
docker run -d nginx              # у фоновому режимі (-d)
docker run -p 5432:5432 postgres # з прокиданням порту

# Переглянути запущені контейнери
docker ps
docker ps -a  # включно з зупиненими

# Зупинити / видалити
docker stop container_id
docker rm container_id
docker rm -f container_id  # зупинити і видалити

# Логи контейнера
docker logs container_id
docker logs -f container_id  # live (follow)

# Зайти всередину контейнера
docker exec -it container_id bash
docker exec -it postgres_container psql -U postgres
```

### docker-compose для тестового середовища

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp:latest
    ports:
      - "3000:3000"
    environment:
      - DB_URL=postgresql://postgres:pass@db:5432/testdb
      - NODE_ENV=test
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

```bash
# Запустити все середовище
docker compose up -d

# Зупинити і прибрати
docker compose down

# Зупинити і видалити volumes (очистити БД)
docker compose down -v

# Перезапустити один сервіс
docker compose restart app

# Логи всього середовища
docker compose logs -f

# Логи конкретного сервісу
docker compose logs -f app
```

### Playwright у Docker (CI)

```dockerfile
# Dockerfile для тестів
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /tests
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

```bash
# Запустити тести в Docker
docker build -t playwright-tests .
docker run --network host playwright-tests

# Або через docker-compose з додатком
docker compose -f docker-compose.test.yml up --exit-code-from tests
```

### Типові задачі QA в Docker

```bash
# Переглянути БД під час тестів
docker exec -it db_container psql -U postgres -d testdb

# Скинути БД до чистого стану
docker compose down -v
docker compose up -d db
# Почекати старт (~5 сек)
docker compose up -d app

# Переглянути network між контейнерами
docker network ls
docker inspect network_name

# Скопіювати файл з контейнера (наприклад лог)
docker cp container_id:/app/logs/error.log ./error.log
```

---

## SQL для тестувальника

### Навіщо QA знати SQL

Після дій у UI або API — перевірити чи дані реально збереглись у БД. Знайти тестові дані. Прибрати після тесту.

### Базові запити

```sql
-- Переглянути дані
SELECT * FROM users;
SELECT id, email, role FROM users WHERE id = 42;
SELECT * FROM orders WHERE status = 'pending';

-- Пошук з фільтром
SELECT * FROM users WHERE email LIKE '%test%';
SELECT * FROM orders WHERE created_at > '2026-01-01';
SELECT * FROM products WHERE price BETWEEN 10 AND 100;

-- Порахувати
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders WHERE user_id = 42;

-- Сортування і обмеження
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- JOIN — дані з кількох таблиць
SELECT u.email, o.id, o.total, o.status
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.id = 42;

-- Перевірити чи існує запис
SELECT EXISTS(SELECT 1 FROM users WHERE email = 'test@test.com');
```

### SQL для верифікації після дій UI/API

```sql
-- Перевірити що юзер зареєстрований
SELECT id, email, created_at, is_active
FROM users
WHERE email = 'newuser@test.com';

-- Перевірити що замовлення створено
SELECT o.id, o.total, o.status, o.created_at,
       oi.product_id, oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 42
ORDER BY o.created_at DESC
LIMIT 1;

-- Перевірити що пароль змінено (хеш оновився)
SELECT id, password_hash, password_changed_at
FROM users
WHERE id = 42;
-- Перевіряємо password_changed_at, не сам хеш

-- Перевірити soft delete
SELECT id, email, deleted_at
FROM users
WHERE id = 42;
-- deleted_at повинен бути заповнений, не NULL
```

### SQL для cleanup тестових даних

```sql
-- Видалити тестових користувачів
DELETE FROM users WHERE email LIKE '%@test.com';

-- Видалити тестові замовлення каскадно
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com'
  )
);
DELETE FROM orders
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);

-- Скинути sequence (PostgreSQL)
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Очистити і скинути (TRUNCATE)
TRUNCATE TABLE test_logs RESTART IDENTITY CASCADE;
```

### SQL у Playwright тесті

```typescript
import { Client } from 'pg'

// fixtures/db.ts
export async function getDbClient() {
  const client = new Client({
    connectionString: process.env.DB_URL
  })
  await client.connect()
  return client
}

// tests/auth.spec.ts
test('user created in DB after registration', async ({ page, request }) => {
  const email = `test-${Date.now()}@test.com`

  // Дія через UI/API
  await request.post('/api/auth/register', {
    data: { email, password: 'Pass123!' }
  })

  // Верифікація в БД
  const db = await getDbClient()
  const result = await db.query(
    'SELECT id, email, is_active FROM users WHERE email = $1',
    [email]
  )

  expect(result.rows).toHaveLength(1)
  expect(result.rows[0].email).toBe(email)
  expect(result.rows[0].is_active).toBe(true)

  await db.end()
})
```

---

## Browser DevTools для тестувальника

### Network tab

Найважливіша вкладка для QA. Показує всі HTTP запити.

```
Що перевіряти:
□ Статус коди відповідей (200, 401, 500...)
□ Payload запиту (що надсилається на сервер)
□ Response body (що повертається)
□ Request headers (Authorization, Content-Type)
□ Response headers (Set-Cookie, Cache-Control)
□ Timing (скільки займає запит)

Корисні фільтри:
- XHR / Fetch — тільки API запити
- WS — WebSocket
- Ввести текст у фільтр — знайти конкретний endpoint

Tricks:
- Правий клік → Copy as cURL → вставити в Postman
- Правий клік → Copy as fetch → для automation
- Зберегти як HAR → для аналізу і debugging
```

```javascript
// Перехопити запит у Playwright (як DevTools Network)
const [request] = await Promise.all([
  page.waitForRequest('**/api/orders'),
  page.getByRole('button', { name: 'Submit' }).click()
])

console.log('URL:', request.url())
console.log('Method:', request.method())
console.log('Body:', request.postData())

const response = await request.response()
console.log('Status:', response?.status())
console.log('Body:', await response?.json())
```

### Console tab

```
Що шукати:
□ JavaScript помилки (червоний X)
□ Незаброньовані Promise rejections
□ 404 для ресурсів (css, js, images)
□ CORS помилки
□ console.log з debug інформацією

Корисні команди в Console:
// Знайти елемент
document.querySelector('#login-form')
document.querySelectorAll('.product-card').length

// Переглянути cookies
document.cookie
// Або: Application → Cookies

// Переглянути localStorage
localStorage.getItem('token')
Object.keys(localStorage)

// Симулювати подію
document.querySelector('#btn').click()
```

### Application tab

```
Що перевіряти:
Storage:
  □ Cookies — токени, session ID, CSRF token
  □ localStorage — дані що зберігаються між сесіями
  □ sessionStorage — дані тільки для поточної вкладки

Service Workers:
  □ Чи є SW? Чи може він кешувати старі відповіді?
  □ Оновити SW: Application → Service Workers → Update

Cache:
  □ Чи кешуються API відповіді коректно?
  □ Clear cache для чистого тестування
```

### Performance tab

```
Що вимірювати:
□ First Contentful Paint (FCP) — перший контент
□ Largest Contentful Paint (LCP) — основний контент
□ Time to Interactive (TTI) — коли можна взаємодіяти
□ Total Blocking Time (TBT) — скільки блокує JS

Хороші показники (Core Web Vitals):
LCP < 2.5 сек
FID / TBT < 100 мс
CLS < 0.1 (layout shift)
```

---

## Чеклист інструментів QA

### Git
```
□ Можу створити гілку і зробити PR
□ Знаю git add, commit, push, pull
□ Можу вирішити merge conflict
□ Розумію різницю між fetch і pull
□ Знаю git log, git blame, git diff
```

### Docker
```
□ Можу запустити docker compose up
□ Розумію що таке volume і network
□ Можу переглянути логи контейнера
□ Можу зайти всередину контейнера
□ Знаю як скинути стан БД
```

### SQL
```
□ SELECT з WHERE, JOIN, ORDER BY, LIMIT
□ COUNT, EXISTS для верифікації
□ DELETE для cleanup тестових даних
□ Знаю різницю між NULL і порожнім рядком
□ Можу написати простий subquery
```

### DevTools
```
□ Network: бачу запити, headers, статус коди
□ Console: бачу JS помилки і CORS
□ Application: перевіряю cookies і localStorage
□ Можу зберегти HAR файл
□ Копіюю запити як cURL
```

---

## Питання на співбесіді

### «Навіщо QA знати Git?»
> Тести живуть у репозиторії поряд з кодом. QA пише тести, робить PR, бере участь у code review. Без Git неможливо повноцінно працювати: не можна відстежувати зміни, колаборувати з командою і запускати тести в CI/CD.

### «Для чого Docker в тестуванні?»
> Щоб мати ізольоване відтворюване тестове середовище. Один `docker compose up` піднімає додаток, БД і всі сервіси — без ручного встановлення. Це гарантує що тести не залежать від локальної конфігурації машини.

### «Які SQL запити використовуєш найчастіше?»
> SELECT для верифікації даних після дій (чи зберіглось у БД), COUNT і EXISTS для перевірки кількості, DELETE для cleanup тестових даних після тестів. JOIN для перевірки зв'язаних записів.

### «Яка вкладка DevTools найважливіша для тестувальника?»
> Network — показує всі HTTP запити, статус коди, payload і відповіді API. З неї можна скопіювати запит як cURL і відтворити в Postman. Console — для JS помилок і CORS проблем.
