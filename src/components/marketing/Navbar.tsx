import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/marketing/SignOutButton";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          AI<span className="text-blue-500">Expert</span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          <Link
            href="/#curriculum"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Curriculum
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/blog"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/academy"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Academy
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
