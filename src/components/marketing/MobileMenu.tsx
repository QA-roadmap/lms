"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/marketing/SignOutButton";

type Props = {
  links: { href: string; label: string }[];
  isAuthenticated: boolean;
};

export function MobileMenu({ links, isAuthenticated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-zinc-800 bg-zinc-950 px-4 py-3 shadow-lg">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-zinc-800" />
                <Link
                  href="/academy"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  Кабінет
                </Link>
                <div className="px-3 py-2.5">
                  <SignOutButton />
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
