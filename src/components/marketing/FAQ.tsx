"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const FAQS = [
  {
    q: "Who is this for?",
    a: "Software engineers and ML practitioners who want to move from prototypes to production AI systems. You should be comfortable with Python and basic programming — this is not for complete beginners.",
  },
  {
    q: "What's the difference between monthly and lifetime?",
    a: "Both plans give identical access to all content. Monthly is $39/month and you can cancel anytime. Lifetime is $197 once — pay once, access everything forever including all future updates.",
  },
  {
    q: "Is there a free trial?",
    a: "Two lessons are completely free without sign-up: Ollama Setup and LangChain Basics. You can start learning right now to see if the teaching style works for you.",
  },
  {
    q: "What tech stack is covered?",
    a: "Python, LangChain, LangGraph, Ollama, various vector DBs (Pinecone, Chroma, pgvector), FastAPI, Docker, and cloud deployment. We focus on the tools production teams actually use.",
  },
  {
    q: "How is this different from YouTube tutorials?",
    a: "Every concept is tied to a real project you deploy. We cover the hard parts: evaluation, monitoring, error handling, cost optimization — things YouTube skips. Plus you get a verifiable certificate and community access.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. After completing all modules you receive a certificate with a unique public URL that you can share on LinkedIn or your resume.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes — 30 days, no questions asked. If you're not satisfied for any reason, email us and you'll get a full refund.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-950 px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <dl className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <p className="border-t border-zinc-800 px-6 py-4 text-sm leading-7 text-zinc-400">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
