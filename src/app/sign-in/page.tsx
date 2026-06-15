import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Вхід",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="mb-12">
        <Logo className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold text-white">Вхід</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Увійдіть, щоб перейти до свого кабінету
        </p>

        <div className="mt-8">
          <GoogleSignInButton redirectTo="/academy" />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Входячи, ви погоджуєтесь з{" "}
          <Link href="/terms" className="underline hover:text-zinc-400">
            умовами використання
          </Link>{" "}
          та{" "}
          <Link href="/privacy" className="underline hover:text-zinc-400">
            політикою конфіденційності
          </Link>
        </p>
      </div>
    </div>
  );
}
