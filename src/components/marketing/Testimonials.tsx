const TESTIMONIALS = [
  {
    quote:
      "Best educational investment in my AI/ML journey. The projects are immediately applicable to real-world scenarios — I shipped a RAG system to prod on week 3.",
    name: "Ana Clara Medeiros",
    title: "AI Developer @ Nubank",
    initials: "AC",
  },
  {
    quote:
      "I've taken a dozen ML courses. This is the only one that actually taught me what production looks like. The MLOps module alone was worth the price.",
    name: "David Park",
    title: "Senior Engineer @ Stripe",
    initials: "DP",
  },
  {
    quote:
      "The agent architecture section completely changed how I think about building with LLMs. Went from hacking scripts to designing real systems.",
    name: "Yuliya Kovalenko",
    title: "ML Engineer @ Grammarly",
    initials: "YK",
  },
];

export function Testimonials() {
  return (
    <section className="bg-zinc-900/50 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineers Love It
          </h2>
          <p className="mt-4 text-zinc-400">
            From solo devs to engineers at top-tier companies
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
