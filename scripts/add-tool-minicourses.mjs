/**
 * Creates two mini-courses in Sanity: Postman and Bruno tool breakdowns.
 * Run: node scripts/add-tool-minicourses.mjs
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "vprlxx2h",
  dataset: "production",
  apiVersion: "2021-06-07",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function createLesson({ title, slug, duration, isFree = false, order }) {
  return client.create({
    _id: uid("lesson"),
    _type: "lesson",
    title,
    slug: { _type: "slug", current: slug },
    duration,
    isFree,
    order,
  });
}

async function createModule({ title, code, description, order, lessonIds }) {
  return client.create({
    _id: uid("module"),
    _type: "module",
    title,
    code,
    description,
    order,
    lessons: lessonIds.map((id) => ({ _type: "reference", _ref: id, _key: uid("ref") })),
  });
}

async function createCourse({ title, slug, tagline, description, priceUSD, courseType, order, moduleIds }) {
  return client.create({
    _id: uid("course"),
    _type: "course",
    title,
    slug: { _type: "slug", current: slug },
    tagline,
    description,
    status: "available",
    courseType,
    priceUSD,
    order,
    modules: moduleIds.map((id) => ({ _type: "reference", _ref: id, _key: uid("ref") })),
  });
}

// ── POSTMAN ──────────────────────────────────────────────────────────────
async function addPostmanCourse() {
  console.log("Creating Postman course...");

  const lessons1 = await Promise.all([
    createLesson({ title: "Знайомство з Postman: інтерфейс та можливості", slug: "postman-intro", duration: "18 хв", isFree: true, order: 1 }),
    createLesson({ title: "Перший API-запит: GET, POST, PUT, DELETE", slug: "postman-first-request", duration: "22 хв", order: 2 }),
    createLesson({ title: "Змінні та середовища (Environments)", slug: "postman-environments", duration: "20 хв", order: 3 }),
    createLesson({ title: "Колекції та папки: структура тест-сьюту", slug: "postman-collections", duration: "16 хв", order: 4 }),
  ]);

  const lessons2 = await Promise.all([
    createLesson({ title: "Написання тест-скриптів на JavaScript", slug: "postman-test-scripts", duration: "25 хв", order: 1 }),
    createLesson({ title: "Pre-request scripts: підготовка даних", slug: "postman-prerequest", duration: "18 хв", order: 2 }),
    createLesson({ title: "Newman: запуск колекцій у CI/CD", slug: "postman-newman", duration: "20 хв", order: 3 }),
    createLesson({ title: "Mock Server та документація API", slug: "postman-mock-docs", duration: "15 хв", isFree: false, isCapstone: true, order: 4 }),
  ]);

  const [mod1, mod2] = await Promise.all([
    createModule({
      title: "Основи Postman",
      code: "PM1",
      description: "Інтерфейс, запити, колекції та середовища",
      order: 1,
      lessonIds: lessons1.map((l) => l._id),
    }),
    createModule({
      title: "Автоматизація та CI",
      code: "PM2",
      description: "Тест-скрипти, Newman, Mock Server",
      order: 2,
      lessonIds: lessons2.map((l) => l._id),
    }),
  ]);

  const course = await createCourse({
    title: "Postman для тестувальників",
    slug: "postman-for-testers",
    tagline: "Від першого запиту до автоматизованих тестів у CI/CD",
    description:
      "Практичний розбір Postman: як організувати API-тести, писати assertions, керувати середовищами та інтегрувати Newman у pipeline.",
    priceUSD: 56,
    courseType: "mini",
    order: 20,
    moduleIds: [mod1._id, mod2._id],
  });

  console.log("✅ Postman course created:", course._id);
  return course;
}

// ── BRUNO ────────────────────────────────────────────────────────────────
async function addBrunoCourse() {
  console.log("Creating Bruno course...");

  const lessons1 = await Promise.all([
    createLesson({ title: "Bruno: навіщо ще один API-клієнт?", slug: "bruno-intro", duration: "14 хв", isFree: true, order: 1 }),
    createLesson({ title: "Встановлення, інтерфейс та перший запит", slug: "bruno-first-request", duration: "18 хв", order: 2 }),
    createLesson({ title: "Колекції як файли: .bru формат і Git", slug: "bruno-collections-git", duration: "20 хв", order: 3 }),
    createLesson({ title: "Середовища та змінні в Bruno", slug: "bruno-environments", duration: "16 хв", order: 4 }),
  ]);

  const lessons2 = await Promise.all([
    createLesson({ title: "Assertions та написання тестів", slug: "bruno-assertions", duration: "22 хв", order: 1 }),
    createLesson({ title: "Bruno CLI: запуск у CI/CD без GUI", slug: "bruno-cli", duration: "18 хв", order: 2 }),
    createLesson({ title: "Порівняння Bruno vs Postman: що коли обирати", slug: "bruno-vs-postman", duration: "12 хв", isFree: false, isCapstone: true, order: 3 }),
  ]);

  const [mod1, mod2] = await Promise.all([
    createModule({
      title: "Основи Bruno",
      code: "BR1",
      description: "Інтерфейс, формат .bru, колекції та Git-інтеграція",
      order: 1,
      lessonIds: lessons1.map((l) => l._id),
    }),
    createModule({
      title: "Тести та автоматизація",
      code: "BR2",
      description: "Assertions, Bruno CLI та порівняння з Postman",
      order: 2,
      lessonIds: lessons2.map((l) => l._id),
    }),
  ]);

  const course = await createCourse({
    title: "Bruno для тестувальників",
    slug: "bruno-for-testers",
    tagline: "Відкритий API-клієнт: колекції у Git, без хмари, без підписки",
    description:
      "Bruno — легка open-source альтернатива Postman. Вивчи як зберігати API-колекції у .bru файлах поруч з кодом, писати тести та запускати через CLI.",
    priceUSD: 56,
    courseType: "mini",
    order: 21,
    moduleIds: [mod1._id, mod2._id],
  });

  console.log("✅ Bruno course created:", course._id);
  return course;
}

// ── RUN ──────────────────────────────────────────────────────────────────
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

try {
  await addPostmanCourse();
  await addBrunoCourse();
  console.log("\n🎉 Both mini-courses created successfully!");
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
