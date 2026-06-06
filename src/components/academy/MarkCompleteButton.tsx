"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";

type Props = {
  lessonSlug: string;
  userId: string;
  isCompleted: boolean;
};

export function MarkCompleteButton({ lessonSlug, isCompleted }: Props) {
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug, completed: !completed }),
      });
      setCompleted(!completed);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
    >
      {completed ? (
        <CheckCircle className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {completed ? "Completed" : "Mark complete"}
    </button>
  );
}
