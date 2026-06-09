import { Star } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  initials: string;
  accentColor?: string;
  stars?: number;
  outcome?: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Найкраща інвестиція в кар'єру. Вже на третьому тижні я писала перші тест-кейси, а через два місяці після курсу отримала офер на позицію QA Engineer.",
    name: "Олена Ткаченко",
    title: "QA Engineer @ Genesis",
    initials: "ОТ",
    accentColor: "bg-blue-600",
    stars: 5,
    outcome: "Офер через 2 місяці",
  },
  {
    quote:
      "Пройшов з десяток курсів з тестування. Це єдиний, де реально показують, як працює QA в продуктовій команді — баг-репорти, регресія, робота з розробниками.",
    name: "Андрій Мельник",
    title: "Senior QA Engineer @ EPAM",
    initials: "АМ",
    accentColor: "bg-violet-600",
    stars: 5,
    outcome: "Ріст до Senior за 8 міс.",
  },
  {
    quote:
      "Модуль з автоматизації повністю змінив мій підхід до тестування. Перейшла від ручних чек-листів до власних тестових фреймворків на Playwright.",
    name: "Юлія Коваленко",
    title: "QA Automation @ Grammarly",
    initials: "ЮК",
    accentColor: "bg-emerald-600",
    stars: 5,
    outcome: "Перейшла в автоматизацію",
  },
  {
    quote:
      "Дуже цінний практичний матеріал. Після кожного уроку відчуваєш реальний прогрес. Тест-дизайн та API-тестування розібрані чітко і по суті.",
    name: "Максим Іванченко",
    title: "QA Engineer @ Preply",
    initials: "МІ",
    accentColor: "bg-amber-600",
    stars: 5,
    outcome: "Перший офер через 3 місяці",
  },
  {
    quote:
      "Курс допоміг систематизувати знання після 2 років хаотичного навчання. Тепер розумію як тестувати API, пишу нормальні тест-кейси і не боюся SQL.",
    name: "Катерина Борисова",
    title: "Manual QA @ Readdle",
    initials: "КБ",
    accentColor: "bg-rose-600",
    stars: 5,
    outcome: "Систематизувала 2 роки знань",
  },
  {
    quote:
      "Зміна сфери з бухгалтерії в QA здавалась нереальною — але цей курс буквально взяв мене за руку і провів від «що таке API» до першого офера.",
    name: "Наталія Семенюк",
    title: "QA Engineer @ MacPaw",
    initials: "НС",
    accentColor: "bg-sky-600",
    stars: 5,
    outcome: "Зміна сфери з бухгалтерії",
  },
];

export function CourseTestimonials({
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: Testimonial[];
}) {
  return (
    <section className="bg-zinc-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Відгуки
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Студенти про курс
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Від зміни сфери до роботи в топових продуктових компаніях
          </p>

          {/* Aggregate rating */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">4.9</span>
            <span className="text-xs text-zinc-500">· 855+ студентів</span>
          </div>
        </div>

        {/* Masonry-style grid */}
        <div className="stagger-children columns-1 gap-5 sm:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-hover-glow animate-fade-up mb-5 break-inside-avoid rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.stars ?? 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm leading-7 text-zinc-300">&ldquo;{t.quote}&rdquo;</p>

              {t.outcome && (
                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                  <p className="text-xs font-medium text-emerald-400">✓ {t.outcome}</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${t.accentColor ?? "bg-blue-600"}`}
                >
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
