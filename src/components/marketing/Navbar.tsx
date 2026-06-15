import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/marketing/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/marketing/MobileMenu";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/courses", label: "Програми" },
  { href: "/skills", label: "Кар'єрний шлях" },
  { href: "/#faq", label: "Питання та відповіді" },
  { href: "/blog", label: "QA Journal" },
];

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="nav-logo flex items-center">
          <Logo className="h-9 w-auto" />
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <Link
                href="/academy"
                className="nav-link hidden text-sm text-zinc-400 hover:text-white transition-colors sm:inline-block"
              >
                Кабінет
              </Link>
              <div className="hidden sm:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Увійти
            </Link>
          )}
          <MobileMenu links={NAV_LINKS} isAuthenticated={!!session} />
        </div>
      </nav>
    </header>
  );
}
