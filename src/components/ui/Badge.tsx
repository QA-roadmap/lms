import { clsx } from "clsx";

type BadgeVariant = "free" | "premium" | "capstone" | "default";

const variants: Record<BadgeVariant, string> = {
  free: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  premium: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  capstone: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  default: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
