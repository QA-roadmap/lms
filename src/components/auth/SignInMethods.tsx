"use client";

import { useState } from "react";
import { EmailPasswordSignInForm } from "@/components/auth/EmailPasswordSignInForm";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

type Props = {
  redirectTo: string;
};

export function SignInMethods({ redirectTo }: Props) {
  const [method, setMethod] = useState<"password" | "magic-link">("password");

  return (
    <div>
      <div className="mb-4 flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMethod("password")}
          className={
            method === "password"
              ? "rounded-full bg-zinc-800 px-3 py-1 text-white"
              : "rounded-full px-3 py-1 text-zinc-500 hover:text-zinc-300"
          }
        >
          Пароль
        </button>
        <button
          type="button"
          onClick={() => setMethod("magic-link")}
          className={
            method === "magic-link"
              ? "rounded-full bg-zinc-800 px-3 py-1 text-white"
              : "rounded-full px-3 py-1 text-zinc-500 hover:text-zinc-300"
          }
        >
          Посилання на email
        </button>
      </div>

      {method === "password" ? (
        <EmailPasswordSignInForm redirectTo={redirectTo} />
      ) : (
        <MagicLinkForm redirectTo={redirectTo} />
      )}
    </div>
  );
}
