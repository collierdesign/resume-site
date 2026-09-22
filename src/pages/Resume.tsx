import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import * as pdfjs from "pdfjs-dist";
// @ts-ignore
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useConfig } from "../lib/useConfig";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function Resume() {
  const cfg = useConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cfg.pdf.url) {
      setError("No PDF configured. Set it in /admin.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const render = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjs.getDocument(cfg.pdf.url);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.className =
            "block mx-auto mb-6 border border-[color:var(--line)] bg-white shadow-[0_24px_50px_-28px_rgba(20,19,16,0.35)]";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          container.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport } as any).promise;
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load PDF. Check the URL in /admin.");
          setLoading(false);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.pdf.url]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  return (
    <main className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]">
      {/* 顶部工具栏 */}
      <div className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-[color:var(--bg)]/85 border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] hover:text-[color:var(--fg)]"
          >
            <Home size={14} /> Back to portfolio
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)]">
              {numPages > 0 && `${numPages} pages`}
            </span>

            <div className="flex items-center gap-1 border border-[color:var(--line)] rounded-full px-2">
              <button
                onClick={zoomOut}
                className="p-1.5 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] text-[color:var(--muted)] min-w-[40px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1.5 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {cfg.pdf.url && (
              <a
                href={cfg.pdf.url}
                download
                className="flex items-center gap-2 px-4 py-2 bg-[color:var(--accent)] text-[color:var(--bg)] text-xs uppercase tracking-[0.2em] hover:opacity-90 transition"
              >
                <Download size={14} /> Download
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PDF 容器 */}
      <div className="pt-24 pb-12 px-4">
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-[color:var(--muted)]">
            <div className="h-8 w-8 rounded-full border-2 border-[color:var(--accent)] border-t-transparent animate-spin mb-4" />
            <p className="text-xs uppercase tracking-[0.25em]">Loading PDF…</p>
          </div>
        )}
        {error && (
          <div className="text-center py-32">
            <p className="text-[color:var(--muted)] mb-4">{error}</p>
            <Link
              to="/admin"
              className="inline-block px-6 py-3 bg-[color:var(--accent)] text-[color:var(--bg)] text-xs uppercase tracking-[0.2em]"
            >
              Go to Admin
            </Link>
          </div>
        )}
        <div ref={containerRef} className="mx-auto max-w-5xl" />
      </div>
    </main>
  );
}