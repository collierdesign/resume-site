import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, ExternalLink, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useConfig } from "../lib/useConfig";

type WorkItem = {
  title: string;
  tag: string;
  year: string;
  cover?: string;
  gallery?: string[];
  pdf?: string;
  description: string;
  role?: string;
  link?: string;
};

export function Works() {
  const cfg = useConfig();
  const works: WorkItem[] = cfg.works.items;
  const [active, setActive] = useState<number | null>(null);

  if (!works || works.length === 0) return null;

  return (
    <section id="works" className="py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* 标题区 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-20 mb-12 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-3 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]"
          >
            <span className="text-[color:var(--accent)]">/</span> 03 — Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-9 font-display text-[color:var(--fg)] leading-[1.05] tracking-tight text-[clamp(2rem,4.5vw,3.75rem)]"
          >
            {cfg.works.headline}
          </motion.h2>
        </div>

        {/* 统一等大网格：手机 2 列 / 桌面 3 列 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {works.map((w, i) => (
            <WorkCard key={i} item={w} index={i} onOpen={() => setActive(i)} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-10 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]"
        >
          {String(works.length).padStart(2, "0")} Projects · 2023—2026
        </motion.p>
      </div>

      {/* 模态弹窗 */}
      <AnimatePresence>
        {active !== null && works[active] && (
          <WorkModal
            key="modal"
            item={works[active]}
            index={active}
            total={works.length}
            onClose={() => setActive(null)}
            onPrev={() =>
              setActive((active - 1 + works.length) % works.length)
            }
            onNext={() => setActive((active + 1) % works.length)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── 卡片 ─── */
function WorkCard({
  item,
  index,
  onOpen,
}: {
  item: WorkItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative aspect-[4/5] overflow-hidden border border-[color:var(--line)] bg-[color:var(--surface)] text-left"
    >
      {/* 封面图 / 占位渐变 */}
      {item.cover ? (
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110"
          style={{
            background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 60%), linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--accent) 15%, var(--bg)))`,
          }}
        />
      )}

      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:from-black/95 transition-all duration-500" />

      {/* 顶部：编号 + 右上角图标 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm">
          {String(index + 1).padStart(2, "0")} · {item.year}
        </span>
        <motion.span
          className="text-white/90 group-hover:text-[color:var(--accent)] transition-colors"
          whileHover={{ rotate: 45 }}
        >
          <ArrowUpRight size={20} />
        </motion.span>
      </div>

      {/* 底部：tag + 标题 + hover 划入描述 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-1.5 transform transition-transform duration-500 group-hover:-translate-y-1">
          {item.tag}
        </p>
        <h3 className="font-display text-white leading-[1.1] text-lg md:text-xl transform transition-transform duration-500 group-hover:-translate-y-1">
          {item.title}
        </h3>

        {/* Hover 划入描述 */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <p className="pt-2 text-xs md:text-sm text-white/85 leading-relaxed line-clamp-3">
              {item.description}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)]">
              View case <ArrowUpRight size={12} />
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── 模态弹窗 ─── */
function WorkModal({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: WorkItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // 锁定 body 滚动 + ESC 关闭
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  // 合并 cover + gallery 用于轮播
  const gallery: string[] = item.gallery?.length
    ? item.gallery
    : item.cover
    ? [item.cover]
    : [];
  const [activeImg, setActiveImg] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/85 backdrop-blur-md p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full md:max-w-5xl h-full md:h-auto md:max-h-[90vh] bg-[color:var(--bg)] border border-[color:var(--line)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-8 py-4 border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 backdrop-blur">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              aria-label="Previous"
              className="p-2 text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNext}
              aria-label="Next"
              className="p-2 text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 ml-2 text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 内容滚动区 */}
        <div className="flex-1 overflow-y-auto">
          {/* 图集轮播 */}
          {gallery.length > 0 && (
            <div className="relative w-full bg-black">
              <img
                src={gallery[activeImg]}
                alt={item.title}
                className="w-full max-h-[60vh] md:max-h-[55vh] object-contain mx-auto"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImg((activeImg - 1 + gallery.length) % gallery.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur text-white/90 hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImg((activeImg + 1) % gallery.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur text-white/90 hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`h-1.5 transition-all ${
                          i === activeImg
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 缩略图条 */}
          {gallery.length > 1 && (
            <div className="flex gap-2 p-4 md:px-8 overflow-x-auto border-b border-[color:var(--line)]">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 border transition-all ${
                    i === activeImg
                      ? "border-[color:var(--accent)] opacity-100"
                      : "border-[color:var(--line)] opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* PDF 嵌入预览 */}
          {item.pdf && (
            <div className="border-b border-[color:var(--line)]">
              <div className="flex items-center justify-between px-5 md:px-8 py-3 border-b border-[color:var(--line)] bg-[color:var(--surface)]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  PDF Document
                </p>
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[color:var(--accent)] hover:underline"
                >
                  <Download size={12} /> Download
                </a>
              </div>
              <iframe
                src={item.pdf}
                title={`${item.title} PDF`}
                className="w-full h-[60vh] md:h-[70vh] bg-white"
              />
            </div>
          )}

          {/* 标题 + 描述 */}
          <div className="px-5 md:px-8 py-8 md:py-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)] mb-3 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[color:var(--accent)]" />
              {item.tag} · {item.year}
            </p>
            <h3 className="font-display text-[color:var(--fg)] leading-[1.05] tracking-tight text-[clamp(1.75rem,4vw,3rem)] mb-6">
              {item.title}
            </h3>

            {item.role && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)] mb-1">
                  Role
                </p>
                <p className="text-sm text-[color:var(--fg)]/85 leading-relaxed">
                  {item.role}
                </p>
              </div>
            )}

            <p className="text-[color:var(--fg)]/90 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {item.description}
            </p>

            {item.link && (
              <div className="mt-8">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 border border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--bg)] transition-all duration-300"
                >
                  Visit live
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* 底部装饰 */}
            <div className="mt-12 flex items-center gap-2">
              <span className="h-px flex-1 bg-[color:var(--line)]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                End of case
              </span>
              <span className="h-px flex-1 bg-[color:var(--line)]" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}