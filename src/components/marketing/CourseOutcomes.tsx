import { CheckCircle } from "lucide-react";

type Props = {
  outcomes?: string[];
};

export function CourseOutcomes({ outcomes }: Props) {
  if (!outcomes || outcomes.length === 0) return null;

  return (
    <section className="bg-zinc-900/40 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Результат
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Після курсу ти зможеш
          </h2>
        </div>

        <div className="stagger-children grid gap-4 sm:grid-cols-2">
          {outcomes.map((outcome) => (
            <div
              key={outcome}
              className="card-hover-glow animate-fade-up flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-zinc-300 leading-relaxed">{outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
