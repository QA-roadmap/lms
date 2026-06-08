import Link from "next/link";
import { CheckCircle } from "lucide-react";

const BENEFITS = [
  "40+ практичних уроків",
  "Реальні чек-листи й тест-кейси",
  "Сертифікат для резюме й LinkedIn",
  "Доступ до спільноти в Discord",
  "Довічний доступ і всі оновлення",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-24 pt-20 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-blue-400">
            855+ людей вже навчаються QA
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-tight">
          Твій{" "}
          <span className="text-blue-500">роадмап у QA</span>
          <br />
          від першого тест-кейсу до автоматизації
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Покрокова програма для тих, хто хоче увійти в тестування або вийти на новий рівень —
          ручне тестування, тест-дизайн, автоматизація та реальні проєкти в портфоліо.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/courses"
            className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors sm:w-auto"
          >
            Переглянути курси
          </Link>
          <Link
            href="/#faq"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 text-base font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors sm:w-auto"
          >
            Поширені запитання
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-zinc-400">
              <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-16 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 font-mono text-sm">
        <div className="mb-3 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <span className="h-3 w-3 rounded-full bg-green-500/60" />
        </div>
        <pre className="overflow-x-auto text-zinc-300">
          <span className="text-zinc-500"># Автотест форми логіну на Playwright</span>{"\n"}
          <span className="text-blue-400">from</span>{" "}
          <span className="text-green-400">playwright.sync_api</span>{" "}
          <span className="text-blue-400">import</span> Page, expect{"\n\n"}
          <span className="text-blue-400">def</span>{" "}
          <span className="text-yellow-400">test_login_success</span>(page: Page):{"\n"}
          {"  "}page.goto(<span className="text-green-400">&quot;https://app.example.com/login&quot;</span>){"\n"}
          {"  "}page.fill(<span className="text-green-400">&quot;#email&quot;</span>, <span className="text-green-400">&quot;qa@example.com&quot;</span>){"\n"}
          {"  "}page.fill(<span className="text-green-400">&quot;#password&quot;</span>, <span className="text-green-400">&quot;Sup3rSecret!&quot;</span>){"\n"}
          {"  "}page.click(<span className="text-green-400">&quot;button[type=submit]&quot;</span>){"\n\n"}
          {"  "}<span className="text-zinc-500"># Перевіряємо, що дашборд відкрився</span>{"\n"}
          {"  "}expect(page.locator(<span className="text-green-400">&quot;.dashboard&quot;</span>)).to_be_visible(){"\n"}
          <span className="text-zinc-500"># → 1 passed — баг не знайдено</span>
        </pre>
      </div>
    </section>
  );
}
