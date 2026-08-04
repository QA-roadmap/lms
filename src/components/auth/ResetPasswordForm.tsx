"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-actions";

type Props = {
  email: string;
  token: string;
};

export function ResetPasswordForm({ email, token }: Props) {
  const [state, formAction, isPending] = useActionState(resetPassword, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <input
        type="password"
        name="password"
        required
        minLength={8}
        placeholder="Новий пароль (мінімум 8 символів)"
        autoComplete="new-password"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      {state && "error" in state && (
        <p className="text-sm text-red-400">
          {state.error}{" "}
          <Link href="/forgot-password" className="underline hover:text-red-300">
            Надіслати нове посилання
          </Link>
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-white py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Збереження..." : "Зберегти пароль"}
      </button>
    </form>
  );
}
