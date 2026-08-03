import Link from "next/link";
import { TIERS, BADGES, type SkillCard } from "@/lib/skills";

type ResolvedSkill = SkillCard & { tier: string };

function resolveSkills(): ResolvedSkill[] {
  const result: ResolvedSkill[] = [];
  for (const tier of TIERS) {
    for (const card of tier.cards) {
      result.push({ ...card, tier: tier.title });
    }
  }
  return result;
}

export function CourseSkillsSection() {
  const skills = resolveSkills();

  return (
    <section className="bg-zinc-900/40 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Навички
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Скіли QA-тестувальника у 2026
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Карта навичок, які реально шукають роботодавці — від основ ручного тестування до
            AI-ери. Бейджі показують пріоритет: Must — база, без якої не візьмуть, Key —
            конкурентна перевага, +Бонус — для росту, AI-Era — новий стандарт 2025–26.
          </p>
        </div>

        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {skills.map((skill) => {
            const badge = BADGES[skill.badge];
            const inner = (
              <div
                className="card-hover-glow animate-fade-up flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white leading-snug">{skill.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{skill.description}</p>
                {skill.tools && (
                  <p className="text-xs text-zinc-600">{skill.tools}</p>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-[11px] font-medium text-zinc-600">{skill.tier}</p>
                  {skill.slug && (
                    <p className="text-xs font-medium text-blue-400">Читати гайд →</p>
                  )}
                </div>
              </div>
            );

            return skill.slug ? (
              <Link key={skill.slug + skill.title} href={`/skills/${skill.slug}`} className="block">
                {inner}
              </Link>
            ) : (
              <div key={skill.title}>{inner}</div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800"
          >
            Переглянути повну карту скілів QA
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
