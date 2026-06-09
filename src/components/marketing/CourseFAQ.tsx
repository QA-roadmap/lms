"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

type FAQItem = { q: string; a: string };

const DEFAULT_FAQS: FAQItem[] = [
  {
    q: "Чи потрібен досвід у IT, щоб розпочати?",
    a: "Ні. Курс розроблений для тих, хто починає з нуля. Ми пояснюємо все з основ — від того, що таке тест-кейс, до роботи з API та SQL. Достатньо впевнено користуватись комп'ютером і мати бажання вчитись.",
  },
  {
    q: "Скільки часу потрібно щотижня?",
    a: "Мінімум 5–7 годин на тиждень. За такого темпу курс можна пройти за 6–8 тижнів. Якщо маєш більше часу — можна швидше. Немає жорстких дедлайнів — навчаєшся у своєму ритмі.",
  },
  {
    q: "Чи отримую я довічний доступ?",
    a: "Так — кожен курс купується один раз, і він твій назавжди. Усі майбутні оновлення матеріалів також включено без доплат. Жодних підписок чи повторних списань.",
  },
  {
    q: "Чи можна спробувати безкоштовно?",
    a: "Так. Перші уроки кожного модуля відкриті без реєстрації та оплати. Зайди, подивись на формат, оціни подачу матеріалу — і тоді вирішуй.",
  },
  {
    q: "Які інструменти та теми розглядаються?",
    a: "Тест-дизайн (EP, BVA, pairwise), тест-кейси та баг-репорти, REST API тестування в Postman, основи SQL для перевірки даних, Git, Browser DevTools, а також введення в AI-асистований QA. Фокус на інструментах, які реально використовують у продуктових командах.",
  },
  {
    q: "Чим цей курс відрізняється від YouTube?",
    a: "Усі теми прив'язані до реальних проєктів, які ти доводиш до кінця. Ми розбираємо складні речі — пріоритизацію тестування, роботу з вимогами, регресію, комунікацію з розробниками — те, що відео на YouTube зазвичай оминають. Плюс — структурований шлях, без хаосу.",
  },
  {
    q: "Чи видаєте ви сертифікат?",
    a: "Так. Після завершення всіх модулів ти отримуєш сертифікат з унікальним публічним посиланням. Ним можна поділитись у LinkedIn або додати до резюме.",
  },
  {
    q: "Чи є гарантія повернення коштів?",
    a: "Так — 30 днів без зайвих питань. Якщо курс із будь-якої причини не підійшов, напиши нам і отримаєш повне повернення коштів.",
  },
];

export function CourseFAQ({ faqs = DEFAULT_FAQS }: { faqs?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-900/40 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Часті запитання
          </h2>
        </div>

        <dl className="space-y-2.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200",
                    open === i && "rotate-180 text-blue-400"
                  )}
                />
              </button>
              {open === i && (
                <p className="border-t border-zinc-800 px-6 py-4 text-sm leading-7 text-zinc-400">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
