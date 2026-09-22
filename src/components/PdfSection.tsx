import { useState } from "react";
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function PdfSection() {
  const cfg = useConfig();
  const [hover, setHover] = useState(false);

  if (!cfg.pdf.enabled || !cfg.pdf.url) return null;

  return (
    <section id="resume-pdf" className="py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 05 — Full Résumé
            </p>
          </div>

          <div className="md:col-span-9">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-[color:var(--fg)] mb-6">
              {cfg.pdf.headline}
            </h2>
            <p className="text-base text-[color:var(--fg)]/80 max-w-2xl mb-12">
              {cfg.pdf.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <a
                href="/resume"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="group flex items-center justify-between border border-[color:var(--line)] px-6 py-6 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <FileText size={20} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="font-display text-lg text-[color:var(--fg)]">Read in browser</p>
                    <p className="text-xs text-[color:var(--muted)] mt-1">
                      Full screen viewer · best on desktop
                    </p>
                  </div>
                </div>
                <ExternalLink
                  size={18}
                  className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors"
                />
              </a>

              <a
                href={cfg.pdf.url}
                download
                className="group flex items-center justify-between border border-[color:var(--line)] px-6 py-6 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Download size={20} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="font-display text-lg text-[color:var(--fg)]">Download PDF</p>
                    <p className="text-xs text-[color:var(--muted)] mt-1">
                      Save for offline / send to recruiters
                    </p>
                  </div>
                </div>
                <Download
                  size={18}
                  className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors"
                />
              </a>
            </div>

            {/* 嵌入预览 */}
            <div className="border border-[color:var(--line)] overflow-hidden bg-[color:var(--surface)]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[color:var(--line)] bg-[color:var(--bg)]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)]">
                  {cfg.pdf.filename || "resume.pdf"} · Preview
                </span>
                <a
                  href={cfg.pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--accent)] hover:underline"
                >
                  Open full
                </a>
              </div>
              <iframe
                src={`${cfg.pdf.url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full"
                style={{ height: "min(80vh, 900px)" }}
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}