import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/marketing/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="nav-logo text-lg font-bold tracking-tight text-white">
          QA<span className="text-blue-500">Roadmap</span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          <Link href="/courses" className="nav-link text-sm text-zinc-400 hover:text-white transition-colors">
            Курси
          </Link>
          <Link href="/skills" className="nav-link text-sm text-zinc-400 hover:text-white transition-colors">
            Скіли
          </Link>
          <Link href="/#faq" className="nav-link text-sm text-zinc-400 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/blog" className="nav-link text-sm text-zinc-400 hover:text-white transition-colors">
            Блог
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/academy" className="nav-link text-sm text-zinc-400 hover:text-white transition-colors">
                Кабінет
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Увійти
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
