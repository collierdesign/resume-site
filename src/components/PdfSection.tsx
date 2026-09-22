import { FileText, Download, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { useConfig } from "../lib/useConfig";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

/** 整份简历 PDF：在线阅读 + 下载。内容与文案都在 /admin → PDF 里改。 */
export function PdfSection() {
  const cfg = useConfig();

  if (!cfg.pdf?.enabled || !cfg.pdf.url) return null;

  return (
    <section id="resume" className="section-pad">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
        <SectionHead
          index="05"
          label="Résumé"
          meta={cfg.pdf.filename || "resume.pdf"}
        />

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-4">
            <h2
              className="display w-anim text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.25] text-[color:var(--fg)]"
              style={W}
            >
              {cfg.pdf.headline}
            </h2>
            <p className="mt-6 max-w-[34ch] text-[0.9rem] leading-[1.9] text-[color:var(--muted)]">
              {cfg.pdf.description}
            </p>

            <div className="mt-10 flex flex-col gap-3">
              <Link
                to="/resume"
                className="group flex items-center justify-between border border-[color:var(--line)] px-5 py-4 transition-colors duration-500 hover:border-[color:var(--accent)]"
              >
                <span className="flex items-center gap-3">
                  <FileText size={16} className="text-[color:var(--accent)]" />
                  <span className="eyebrow text-[10px] text-[color:var(--fg)]">
                    Read full screen
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-[color:var(--muted)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]"
                />
              </Link>

              <a
                href={cfg.pdf.url}
                download={cfg.pdf.filename || undefined}
                className="group flex items-center justify-between border border-[color:var(--line)] px-5 py-4 transition-colors duration-500 hover:border-[color:var(--accent)]"
              >
                <span className="flex items-center gap-3">
                  <Download size={16} className="text-[color:var(--accent)]" />
                  <span className="eyebrow text-[10px] text-[color:var(--fg)]">
                    Download PDF
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-[color:var(--muted)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]"
                />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-7 md:col-start-6">
            <div className="border border-[color:var(--line)]">
              <div className="flex items-center justify-between border-b border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
                <span className="eyebrow text-[9px]">
                  {cfg.pdf.filename || "resume.pdf"}
                </span>
                <a
                  href={cfg.pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2"
                >
                  <span className="link-line eyebrow text-[9px] text-[color:var(--fg)]">
                    Open in new tab
                  </span>
                  <ExternalLink
                    size={11}
                    className="text-[color:var(--muted)] transition-colors duration-500 group-hover:text-[color:var(--accent)]"
                  />
                </a>
              </div>

              {/* 内嵌预览：桌面端用 iframe，小屏给出提示避免浪费流量 */}
              <div className="hidden md:block">
                <iframe
                  src={`${cfg.pdf.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  title="Résumé preview"
                  className="h-[min(78vh,880px)] w-full bg-white"
                />
              </div>

              <div className="flex md:hidden flex-col items-start gap-4 px-5 py-8">
                <p className="text-[0.85rem] leading-[1.9] text-[color:var(--muted)]">
                  小屏不适合逐页阅读，建议直接进入全屏阅读器，或下载 PDF 保存。
                </p>
                <Link
                  to="/resume"
                  className="eyebrow border border-[color:var(--fg)] px-5 py-3 text-[10px] text-[color:var(--fg)] transition-colors duration-500 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]"
                >
                  Open reader
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
