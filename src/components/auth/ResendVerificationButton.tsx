"use client";

import { useActionState } from "react";
import { resendVerificationEmail } from "@/lib/auth-actions";

type Props = {
  email: string;
  redirectTo: string;
};

export function ResendVerificationButton({ email, redirectTo }: Props) {
  const [state, formAction, isPending] = useActionState(resendVerificationEmail, undefined);

  if (state && "info" in state) {
    return <p className="text-xs text-zinc-400">{state.info}</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-white underline hover:text-zinc-300 disabled:opacity-60"
      >
        {isPending ? "Надсилання..." : "Надіслати лист підтвердження ще раз"}
      </button>
    </form>
  );
}
