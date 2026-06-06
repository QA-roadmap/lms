import Link from "next/link";
import { CheckCircle } from "lucide-react";

const BENEFITS = [
  "40+ hands-on tutorials",
  "Source code for every project",
  "Verifiable certificate",
  "Discord community access",
  "Lifetime updates included",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-24 pt-20 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-blue-400">
            855+ engineers enrolled
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-tight">
          Learn to Build{" "}
          <span className="text-blue-500">AI Systems</span>
          <br />
          that Survive Production
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          A hands-on program for engineers who want to ship real AI systems —
          not toy demos. From local LLMs to RAG, agents, and MLOps.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/#pricing"
            className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors sm:w-auto"
          >
            Get Instant Access · from $39/mo
          </Link>
          <Link
            href="/#curriculum"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 text-base font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors sm:w-auto"
          >
            View Curriculum
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-zinc-400">
              <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-16 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 font-mono text-sm">
        <div className="mb-3 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <span className="h-3 w-3 rounded-full bg-green-500/60" />
        </div>
        <pre className="overflow-x-auto text-zinc-300">
          <span className="text-zinc-500"># Build a RAG pipeline in minutes</span>{"\n"}
          <span className="text-blue-400">from</span>{" "}
          <span className="text-green-400">langchain</span>{" "}
          <span className="text-blue-400">import</span> vectorstore, embeddings{"\n"}
          <span className="text-blue-400">from</span>{" "}
          <span className="text-green-400">app.rag</span>{" "}
          <span className="text-blue-400">import</span> Pipeline{"\n\n"}
          <span className="text-zinc-500"># Connect your vector store</span>{"\n"}
          pipeline = Pipeline({"\n"}
          {"  "}embeddings=<span className="text-yellow-400">OpenAIEmbeddings</span>(),{"\n"}
          {"  "}retriever=<span className="text-yellow-400">vectorstore</span>.as_retriever(k=<span className="text-amber-400">5</span>),{"\n"}
          {"  "}reranker=<span className="text-yellow-400">CohereReranker</span>(){"\n"}
          ){"\n\n"}
          result = pipeline.<span className="text-yellow-400">run</span>(<span className="text-green-400">&quot;How does attention work?&quot;</span>){"\n"}
          <span className="text-zinc-500"># → Production-ready answer with sources</span>
        </pre>
      </div>
    </section>
  );
}
