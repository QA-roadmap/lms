import fs from "fs";
import path from "path";

export type BadgeKind = "must" | "key" | "bonus" | "ai";

export const BADGES: Record<BadgeKind, { label: string; className: string }> = {
  must: { label: "Must", className: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
  key: { label: "Key", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  bonus: { label: "+Бонус", className: "bg-sky-500/10 text-sky-400 border border-sky-500/20" },
  ai: { label: "AI-Era", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
};

export const LEGEND: { badge: BadgeKind; hint: string }[] = [
  { badge: "must", hint: "без цього не знайдеш роботу в QA" },
  { badge: "key", hint: "дає конкурентну перевагу" },
  { badge: "bonus", hint: "для росту" },
  { badge: "ai", hint: "новий стандарт 2025–26" },
];

export type SkillCard = {
  badge: BadgeKind;
  title: string;
  description: string;
  tools?: string;
  /** Slug of a markdown guide in content/skills/{slug}.md — renders the card as a link to /skills/{slug} */
  slug?: string;
};

export type SkillTier = {
  emoji: string;
  title: string;
  cards: SkillCard[];
};

export const TIERS: SkillTier[] = [
  {
    emoji: "🧠",
    title: "Основи тестування",
    cards: [
      {
        badge: "must",
        title: "STLC / SDLC",
        description: "Цикли розробки та тестування, місце QA в проєкті",
        slug: "stlc-sdlc",
      },
      {
        badge: "must",
        title: "Тест-дизайн",
        description: "EP, BVA, pairwise, state transition, decision table",
        slug: "test-design-techniques",
      },
      {
        badge: "must",
        title: "Тест-кейси та баг-репорти",
        description: "Структура, severity/priority, відтворюваність",
        slug: "test-cases-bug-reports",
      },
      {
        badge: "must",
        title: "Види тестування",
        description: "Smoke, regression, sanity, exploratory, UAT",
        slug: "testing-types",
      },
    ],
  },
  {
    emoji: "🌐",
    title: "API-тестування",
    cards: [
      {
        badge: "must",
        title: "REST API",
        description: "HTTP-методи, статус-коди, headers, auth (JWT, OAuth2)",
        tools: "Postman · Swagger",
        slug: "rest-api-testing",
      },
      {
        badge: "key",
        title: "GraphQL",
        description: "Queries, mutations, subscriptions, schema validation",
        tools: "Postman · Insomnia",
        slug: "graphql-testing",
      },
      {
        badge: "bonus",
        title: "Contract testing",
        description: "Pact, OpenAPI contract validation",
        slug: "contract-testing",
      },
      {
        badge: "bonus",
        title: "WebSocket / gRPC",
        description: "Real-time протоколи, стрімінг даних",
        slug: "websocket-grpc-testing",
      },
    ],
  },
  {
    emoji: "⚙️",
    title: "Автоматизація",
    cards: [
      {
        badge: "must",
        title: "Хоча б одна мова",
        description: "JavaScript або Python — базовий рівень обов'язковий",
        slug: "automation-roadmap-2026",
      },
      {
        badge: "key",
        title: "Playwright",
        description: "UI + API тести, cross-browser, лідер ринку у 2026",
        tools: "JS / TS / Python",
        slug: "playwright-guide",
      },
      {
        badge: "key",
        title: "Cypress",
        description: "E2E тестування, популярний у продуктових командах",
        tools: "JavaScript",
        slug: "cypress-vs-playwright",
      },
      {
        badge: "key",
        title: "CI/CD інтеграція",
        description: "Запуск тестів у pipeline, звіти, флакі тести",
        tools: "GitHub Actions · GitLab CI",
      },
    ],
  },
  {
    emoji: "🤖",
    title: "AI-Era скіли (новий стандарт)",
    cards: [
      {
        badge: "ai",
        title: "AI-асистований QA",
        description: "Генерація тест-кейсів, аналіз вимог через Claude / ChatGPT",
        slug: "ai-for-qa-2026",
      },
      {
        badge: "ai",
        title: "Тестування AI-продуктів",
        description: "Hallucination testing, prompt injection, non-determinism",
        slug: "llm-ai-testing",
      },
      {
        badge: "ai",
        title: "AI-дебаг та аналіз",
        description: "AI-аналіз логів, root cause, автоматичний triage",
        slug: "ai-log-debug",
      },
      {
        badge: "ai",
        title: "Visual AI testing",
        description: "Applitools, Percy — pixel-diff з ML",
        slug: "visual-ai-testing",
      },
    ],
  },
  {
    emoji: "🔒",
    title: "Безпека та перформанс",
    cards: [
      {
        badge: "key",
        title: "Security basics",
        description: "OWASP Top 10, SQL injection, XSS, IDOR, auth bypass",
        tools: "OWASP ZAP · Burp Suite",
        slug: "security-testing",
      },
      {
        badge: "key",
        title: "Performance testing",
        description: "Load, stress, spike тести, пошук bottleneck",
        tools: "k6 · Gatling · JMeter",
        slug: "security-testing",
      },
      {
        badge: "bonus",
        title: "Accessibility (a11y)",
        description: "WCAG-стандарти, screen readers, axe-core",
        slug: "security-testing",
      },
    ],
  },
  {
    emoji: "🛠",
    title: "Інструменти та оточення",
    cards: [
      {
        badge: "must",
        title: "Git",
        description: "Базові команди, PR flow, культура code review",
        slug: "tools-environment",
      },
      {
        badge: "key",
        title: "Docker",
        description: "Запуск тестового середовища, docker-compose",
        slug: "tools-environment",
      },
      {
        badge: "must",
        title: "SQL",
        description: "SELECT, JOIN, перевірка даних у БД після дій",
        slug: "tools-environment",
      },
      {
        badge: "must",
        title: "Browser DevTools",
        description: "Network tab, console, storage, performance profiler",
        slug: "tools-environment",
      },
    ],
  },
  {
    emoji: "💬",
    title: "Soft skills",
    cards: [
      {
        badge: "must",
        title: "Комунікація",
        description: "Чіткі баг-репорти, фідбек без конфліктів",
        slug: "soft-skills",
      },
      {
        badge: "must",
        title: "Аналітичне мислення",
        description: "Ставити правильні питання, мислити як користувач і як зловмисник",
        slug: "soft-skills",
      },
      {
        badge: "key",
        title: "Quality advocacy",
        description: "QA як партнер команди, shift-left підхід",
        slug: "soft-skills",
      },
    ],
  },
];

const SKILLS_DIR = path.join(process.cwd(), "content/skills");

export function getSkillCardBySlug(slug: string): SkillCard | null {
  for (const tier of TIERS) {
    const card = tier.cards.find((c) => c.slug === slug);
    if (card) return card;
  }
  return null;
}

export function getAllSkillSlugs(): string[] {
  return TIERS.flatMap((tier) => tier.cards.flatMap((card) => (card.slug ? [card.slug] : [])));
}

export function getSkillGuide(slug: string): string | null {
  const filePath = path.join(SKILLS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}
