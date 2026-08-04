import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { SignInMethods } from "@/components/auth/SignInMethods";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Вхід",
  robots: { index: false, follow: false },
};

const STATUS_MESSAGES: Record<string, string> = {
  verified: "Email підтверджено! Тепер увійдіть.",
  reset: "Пароль оновлено. Увійдіть з новим паролем.",
};

const ERROR_MESSAGES: Record<string, string> = {
  "magic-link-invalid": "Посилання для входу недійсне або застаріле",
  "verify-invalid": "Посилання підтвердження недійсне або застаріле",
};

type Props = { searchParams: Promise<{ verified?: string; reset?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { verified, reset, error } = await searchParams;
  const status = verified ? STATUS_MESSAGES.verified : reset ? STATUS_MESSAGES.reset : undefined;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

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

        {status && (
          <p className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-400">
            {status}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="mt-8">
          <GoogleSignInButton redirectTo="/academy" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">або</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <SignInMethods redirectTo="/academy" />

        <p className="mt-6 text-center text-sm text-zinc-400">
          Немає акаунту?{" "}
          <Link href="/sign-up" className="text-white underline hover:text-zinc-300">
            Зареєструватися
          </Link>
        </p>

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
