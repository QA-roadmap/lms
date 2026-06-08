import Link from "next/link";
import { BADGES, LEGEND, TIERS, type BadgeKind } from "@/lib/skills";

function SkillBadge({ kind }: { kind: BadgeKind }) {
  const badge = BADGES[kind];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function SkillsMap() {
  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-x-6 gap-y-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
        {LEGEND.map((item) => (
          <div key={item.badge} className="flex items-center gap-2 text-sm text-zinc-400">
            <SkillBadge kind={item.badge} />
            {item.hint}
          </div>
        ))}
      </div>

      {TIERS.map((tier) => (
        <section key={tier.title}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
            <span aria-hidden>{tier.emoji}</span>
            {tier.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tier.cards.map((card) => {
              const className =
                "rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors hover:border-zinc-700" +
                (card.slug ? " hover:bg-zinc-800/50" : "");

              const body = (
                <>
                  <SkillBadge kind={card.badge} />
                  <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{card.description}</p>
                  {card.tools && <p className="mt-3 text-xs text-zinc-600">{card.tools}</p>}
                  {card.slug && <p className="mt-3 text-xs font-medium text-blue-400">Читати гайд →</p>}
                </>
              );

              return card.slug ? (
                <Link key={card.title} href={`/skills/${card.slug}`} className={className}>
                  {body}
                </Link>
              ) : (
                <div key={card.title} className={className}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
