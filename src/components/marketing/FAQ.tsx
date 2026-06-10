"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { faqSchema } from "@/lib/seo";

const FAQS = [
  {
    q: "Кому підійдуть ці курси?",
    a: "Тим, хто хоче увійти в IT через тестування з нуля, а також ручним тестувальникам, які хочуть прокачатись до автоматизації. Спеціальний досвід не потрібен — досить впевненого користування комп'ютером.",
  },
  {
    q: "Чи отримую я довічний доступ?",
    a: "Так — кожен курс купується один раз. Заплатив один раз — і курс назавжди твій, разом з усіма майбутніми оновленнями контенту. Жодних підписок чи повторних списань.",
  },
  {
    q: "Чи можна спробувати безкоштовно?",
    a: "Так — перші уроки кожного курсу відкриті без реєстрації та оплати. Можна одразу зануритись і зрозуміти, чи підходить тобі формат подачі.",
  },
  {
    q: "Які інструменти й теми ви розглядаєте?",
    a: "Тест-дизайн і тест-кейси, баг-репортинг, тестування API (Postman), основи SQL і Git, а також автоматизацію на Selenium і Playwright. Фокус на тому, чим реально користуються QA-команди в продуктах.",
  },
  {
    q: "Чим це відрізняється від безкоштовних відео на YouTube?",
    a: "Кожна тема прив'язана до реального проєкту, який ти доводиш до кінця. Ми розбираємо складні речі — пріоритизацію тестування, роботу з вимогами, регресію, комунікацію з розробниками — те, що відео на YouTube зазвичай оминають. Плюс — сертифікат і доступ до спільноти.",
  },
  {
    q: "Чи видаєте ви сертифікат?",
    a: "Так. Після завершення всіх модулів курсу ти отримуєш сертифікат з унікальним публічним посиланням, яким можна поділитись у LinkedIn чи резюме.",
  },
  {
    q: "Чи є гарантія повернення коштів?",
    a: "Так — 30 днів без зайвих питань. Якщо курс із якоїсь причини не підійшов, напиши нам і отримаєш повне повернення коштів.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-950 px-4 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Поширені запитання
          </h2>
        </div>

        <dl className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
                    open === i && "rotate-180"
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
