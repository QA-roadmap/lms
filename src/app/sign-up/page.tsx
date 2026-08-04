import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GitHubSignInButton } from "@/components/auth/GitHubSignInButton";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Реєстрація",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="mb-12">
        <Logo className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold text-white">Реєстрація</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Створіть акаунт, щоб отримати доступ до курсів
        </p>

        <div className="mt-8 space-y-3">
          <GoogleSignInButton redirectTo="/academy" label="Зареєструватися через Google" />
          <GitHubSignInButton redirectTo="/academy" label="Зареєструватися через GitHub" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">або</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <SignUpForm redirectTo="/academy" />

        <p className="mt-6 text-center text-sm text-zinc-400">
          Вже маєте акаунт?{" "}
          <Link href="/sign-in" className="text-white underline hover:text-zinc-300">
            Увійти
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Реєструючись, ви погоджуєтесь з{" "}
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
