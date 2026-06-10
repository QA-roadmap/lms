import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" className="text-lg font-bold text-white">
              QA<span className="text-blue-500">Roadmap</span>
            </Link>
            <p className="mt-1 text-xs text-zinc-600">
              © {new Date().getFullYear()} QA Roadmap. Усі права захищено.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <Link href="/courses" className="hover:text-white transition-colors">
              Програми
            </Link>
            <Link href="/skills" className="hover:text-white transition-colors">
              Кар&apos;єрний шлях
            </Link>
            <Link href="/#faq" className="hover:text-white transition-colors">
              Питання та відповіді
            </Link>
            <Link href="/academy" className="hover:text-white transition-colors">
              Кабінет
            </Link>
            <a href="mailto:support@qaroadmap.dev" className="hover:text-white transition-colors">
              Контакти
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
