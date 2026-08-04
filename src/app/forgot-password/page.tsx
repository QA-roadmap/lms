import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Відновлення паролю",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="mb-12">
        <Logo className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold text-white">Відновлення паролю</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Введіть email — ми надішлемо посилання для встановлення нового паролю
        </p>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          <Link href="/sign-in" className="text-white underline hover:text-zinc-300">
            Повернутись до входу
          </Link>
        </p>
      </div>
    </div>
  );
}
