"use client";

import { useActionState } from "react";
import Link from "next/link";
import { credentialsSignIn } from "@/lib/auth-actions";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";

type Props = {
  redirectTo: string;
};

export function EmailPasswordSignInForm({ redirectTo }: Props) {
  const [state, formAction, isPending] = useActionState(credentialsSignIn, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      <input
        type="password"
        name="password"
        required
        placeholder="Пароль"
        autoComplete="current-password"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      <div className="text-right">
        <Link href="/forgot-password" className="text-xs text-zinc-400 underline hover:text-zinc-300">
          Забули пароль?
        </Link>
      </div>
      {state && "error" in state && (
        <div className="space-y-2">
          <p className="text-sm text-red-400">{state.error}</p>
          {state.unverifiedEmail && (
            <ResendVerificationButton email={state.unverifiedEmail} redirectTo={redirectTo} />
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-white py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Вхід..." : "Увійти"}
      </button>
    </form>
  );
}
