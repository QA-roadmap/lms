"use client";

import dynamic from "next/dynamic";

const PresentationViewerInner = dynamic(
  () => import("./PresentationViewerInner").then((mod) => mod.PresentationViewer),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 flex aspect-video w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
        Завантаження презентації…
      </div>
    ),
  },
);

type Props = {
  url: string;
};

export function PresentationViewer({ url }: Props) {
  return <PresentationViewerInner url={url} />;
}
