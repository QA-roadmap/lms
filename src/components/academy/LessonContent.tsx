"use client";

import { PortableText, type PortableTextReactComponents } from "next-sanity";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";

import type { TypedObject } from "@portabletext/types";

type Props = {
  content: TypedObject[];
};

const components = {
  types: {
    code: ({ value }: { value: { code: string; language?: string; filename?: string } }) => (
      <div className="my-6 overflow-hidden rounded-xl border border-zinc-700">
        {value.filename && (
          <div className="border-b border-zinc-700 bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
            {value.filename}
          </div>
        )}
        <SyntaxHighlighter
          language={value.language || "javascript"}
          style={oneDark as Record<string, React.CSSProperties>}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "#18181b",
            fontSize: "0.875rem",
            lineHeight: "1.7",
            padding: "1.25rem",
          }}
          showLineNumbers
        >
          {value.code}
        </SyntaxHighlighter>
      </div>
    ),

    youtube: ({ value }: { value: { url: string } }) => {
      if (!value?.url) return null;
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-zinc-800">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={value.url}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              frameBorder="0"
            />
          </div>
        </div>
      );
    },

    image: ({ value }: { value: { asset?: { url?: string }; caption?: string; alt?: string } }) => {
      if (!value?.asset?.url) return null;
      return (
        <figure className="my-6">
          <div className="relative overflow-hidden rounded-xl border border-zinc-800">
            <Image
              src={value.asset.url}
              alt={value.caption || value.alt || ""}
              width={800}
              height={450}
              className="w-full"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-zinc-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },

  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-10 mb-4 text-2xl font-bold text-white">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold text-white">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="mt-6 mb-2 text-lg font-semibold text-zinc-100">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-500/5 py-3 pl-5 pr-4 text-zinc-300 rounded-r-lg">
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="my-4 leading-7 text-zinc-300">{children}</p>
    ),
  },

  marks: {
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-blue-300">
        {children}
      </code>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-zinc-300">{children}</em>
    ),
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
      >
        {children}
      </a>
    ),
  },

  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-4 space-y-2 pl-6 text-zinc-300 list-disc marker:text-blue-500">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-4 space-y-2 pl-6 text-zinc-300 list-decimal marker:text-blue-500">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-7">{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-7">{children}</li>
    ),
  },
};

export function LessonContent({ content }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <PortableText value={content} components={components as Partial<PortableTextReactComponents>} />
    </div>
  );
}
