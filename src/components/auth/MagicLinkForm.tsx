"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/lib/auth-actions";

type Props = {
  redirectTo: string;
};

export function MagicLinkForm({ redirectTo }: Props) {
  const [state, formAction, isPending] = useActionState(requestMagicLink, undefined);

  if (state && "info" in state) {
    return <p className="text-sm text-zinc-300">{state.info}</p>;
  }

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
      {state && "error" in state && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-white py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Надсилання..." : "Надіслати посилання для входу"}
      </button>
    </form>
  );
}
