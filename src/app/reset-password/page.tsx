import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Новий пароль",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ email?: string; token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { email, token } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="mb-12">
        <Logo className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold text-white">Новий пароль</h1>

        {email && token ? (
          <>
            <p className="mt-2 text-sm text-zinc-400">Встановіть новий пароль для {email}</p>
            <div className="mt-8">
              <ResetPasswordForm email={email} token={token} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-red-400">
            Посилання недійсне.{" "}
            <Link href="/forgot-password" className="underline hover:text-red-300">
              Запросити нове
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
