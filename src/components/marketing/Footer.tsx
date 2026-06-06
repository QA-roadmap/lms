import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" className="text-lg font-bold text-white">
              AI<span className="text-blue-500">Expert</span>
            </Link>
            <p className="mt-1 text-xs text-zinc-600">
              © {new Date().getFullYear()} AIExpert Academy. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <Link href="/#curriculum" className="hover:text-white transition-colors">
              Curriculum
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/academy" className="hover:text-white transition-colors">
              Academy
            </Link>
            <a href="mailto:support@aiexpert.dev" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
