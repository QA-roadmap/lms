import { CheckCircle } from "lucide-react";

type Persona = {
  emoji: string;
  title: string;
  description: string;
  checks: string[];
};

const DEFAULT_PERSONAS: Persona[] = [
  {
    emoji: "🚀",
    title: "Новачок без IT-досвіду",
    description: "Хочеш увійти в IT, але не знаєш з чого почати",
    checks: [
      "Немає технічного бекграунду — не страшно",
      "Зрозумієш, як влаштовані продуктові команди",
      "Отримаєш перший реальний проєкт у портфоліо",
    ],
  },
  {
    emoji: "🔍",
    title: "Ручний тестувальник",
    description: "Вже тестуєш вручну, але хочеш систематизувати знання",
    checks: [
      "Закриєш прогалини в теорії та тест-дизайні",
      "Навчишся писати якісні баг-репорти та тест-кейси",
      "Зробиш крок до автоматизації",
    ],
  },
  {
    emoji: "💼",
    title: "Фахівець іншої сфери",
    description: "Хочеш перейти в IT з іншої галузі",
    checks: [
      "Отримаєш структурований план входу в QA",
      "Дізнаєшся, які навички вже маєш і як їх застосувати",
      "Підготуєшся до перших технічних співбесід",
    ],
  },
  {
    emoji: "🎓",
    title: "Студент або випускник",
    description: "Шукаєш перше стажування або роботу в IT",
    checks: [
      "Отримаєш сертифікат для резюме",
      "Зрозумієш реальні процеси в продуктових командах",
      "Долучишся до спільноти QA-спеціалістів",
    ],
  },
];

export function CourseForWhom({
  personas = DEFAULT_PERSONAS,
}: {
  personas?: Persona[];
}) {
  return (
    <section className="bg-zinc-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Для кого
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Цей курс підійде вам, якщо...
          </h2>
        </div>

        <div className="stagger-children grid gap-5 sm:grid-cols-2">
          {personas.map((p) => (
            <div
              key={p.title}
              className="card-hover-glow animate-fade-up rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl">
                  {p.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{p.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {p.checks.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
