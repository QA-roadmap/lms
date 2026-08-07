"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const SWIPE_THRESHOLD_PX = 50;

type Props = {
  url: string;
};

export function PresentationViewer({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function goToPage(page: number) {
    setPageNumber(Math.min(Math.max(page, 1), numPages || 1));
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goToPage(pageNumber + 1);
    else goToPage(pageNumber - 1);
  }

  if (error) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-sm text-zinc-400">Не вдалося показати презентацію.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Відкрити в новій вкладці
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div
        ref={containerRef}
        className="flex justify-center bg-zinc-950 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setError(true)}
          loading={
            <div className="flex aspect-video w-full items-center justify-center text-sm text-zinc-500">
              Завантаження презентації…
            </div>
          }
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
        <button
          type="button"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          aria-label="Попередній слайд"
          className="flex items-center justify-center rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm text-zinc-400">
          {numPages ? `${pageNumber} / ${numPages}` : "…"}
        </span>

        <button
          type="button"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
          aria-label="Наступний слайд"
          className="flex items-center justify-center rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
