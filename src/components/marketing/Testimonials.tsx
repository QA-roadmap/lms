const TESTIMONIALS = [
  {
    quote:
      "Найкраща інвестиція в кар'єру. Вже на третьому тижні я писала перші тест-кейси, а через два місяці після курсу отримала офер на позицію QA Engineer.",
    name: "Олена Ткаченко",
    title: "QA Engineer @ Genesis",
    initials: "ОТ",
  },
  {
    quote:
      "Пройшов з десяток курсів з тестування. Це єдиний, де реально показують, як працює QA в продуктовій команді — баг-репорти, регресія, робота з розробниками.",
    name: "Андрій Мельник",
    title: "Senior QA Engineer @ EPAM",
    initials: "АМ",
  },
  {
    quote:
      "Модуль з автоматизації повністю змінив мій підхід до тестування. Перейшла від ручних чек-листів до власних тестових фреймворків на Playwright.",
    name: "Юлія Коваленко",
    title: "QA Automation Engineer @ Grammarly",
    initials: "ЮК",
  },
];

export function Testimonials() {
  return (
    <section className="bg-zinc-900/50 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            QA-спеціалісти обирають нас
          </h2>
          <p className="mt-4 text-zinc-400">
            Від новачків без досвіду до тестувальників у топових продуктових командах
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <p className="text-sm leading-7 text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
