import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { SectionHead } from "./SectionHead";
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

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

/** 折叠阈值：超过该数量显示"查看更多" */
const COLLAPSE_AT = 6;

export function Works() {
  const cfg = useConfig();
  const works: WorkItem[] = cfg.works.items || [];
  const [active, setActive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (works.length === 0) return null;

  /* 超过 6 个时默认折叠，点"查看更多"展开全部 */
  const list =
    expanded || works.length <= COLLAPSE_AT ? works : works.slice(0, COLLAPSE_AT);

  /* 奇偶分列 → 右列整体下沉，任何断点下都是两列错位 */
  const leftCol = list.filter((_, i) => i % 2 === 0);
  const rightCol = list.filter((_, i) => i % 2 === 1);

  return (
    <section id="works" className="section-pad relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-10 lg:px-16">
        <SectionHead
          index="03"
          label="Works"
          meta={`${String(works.length).padStart(2, "0")} Projects · 2023—2026`}
        />

        <div className="mt-10 flex flex-col gap-6 md:mt-16 md:flex-row md:items-end md:justify-between md:gap-16">
          <Reveal>
            <h2
              data-cursor-lens
              className="w-anim display text-balance text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[1.08] text-[color:var(--fg)]"
              style={W}
            >
              {cfg.works.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[30ch] text-[0.88rem] leading-[1.9] text-[color:var(--muted)] md:pb-3 md:text-right">
              选择一件作品，查看完整案例与过程记录。
            </p>
          </Reveal>
        </div>

        {/* 移动端：单列大图（顺序排列） */}
        <div className="mt-14 flex flex-col gap-14 md:hidden">
          {list.map((w, i) => (
            <WorkCard
              key={`M-${i}`}
              item={w}
              index={i}
              onOpen={() => setActive(i)}
            />
          ))}
        </div>

        {/* 桌面端：两列错位排布，右列下沉 */}
        <div className="hidden md:mt-20 md:grid md:grid-cols-2 md:gap-x-10 lg:gap-x-14">
          <div className="flex flex-col gap-24">
            {leftCol.map((w, i) => (
              <WorkCard
                key={`L-${i}`}
                item={w}
                index={i * 2}
                onOpen={() => setActive(i * 2)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-24 md:pt-36 lg:pt-44">
            {rightCol.map((w, i) => (
              <WorkCard
                key={`R-${i}`}
                item={w}
                index={i * 2 + 1}
                onOpen={() => setActive(i * 2 + 1)}
              />
            ))}
          </div>
        </div>

        {/* 超过阈值时的 展开/收起 */}
        {works.length > COLLAPSE_AT && (
          <div className="mt-16 flex flex-col items-center gap-3 md:mt-24">
            <button
              onClick={() => {
                setExpanded((v) => !v);
                if (expanded) {
                  // 收起后滚回作品区顶部，避免停留在空白处
                  document
                    .getElementById("works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="eyebrow group/btn flex items-center gap-3 border border-[color:var(--fg)]/40 px-8 py-4 text-[10px] text-[color:var(--fg)] transition-colors duration-500 hover:border-[color:var(--fg)] hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]"
            >
              {expanded
                ? "收起 · Show Less"
                : `查看更多 · View More（${works.length - COLLAPSE_AT}）`}
            </button>
            {!expanded && (
              <span className="eyebrow tnum text-[9px] text-[color:var(--muted)]">
                {String(works.length).padStart(2, "0")} Projects in total
              </span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active !== null && works[active] && (
          <WorkModal
            key="modal"
            item={works[active]}
            index={active}
            total={works.length}
            onClose={() => setActive(null)}
            onPrev={() => setActive((active - 1 + works.length) % works.length)}
            onNext={() => setActive((active + 1) % works.length)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────────────── 卡片 ───────────────── */
function WorkCard({
  item,
  index,
  onOpen,
}: {
  item: WorkItem;
  index: number;
  onOpen: () => void;
}) {
  /* 手机端：封面跨过屏幕中线偏上（约 43% 高度）的触发线时说明条自动弹出；整卡划过线后自动收起。
     用 rAF + getBoundingClientRect 直接判定，滚动再快（含锚点跳转）也不会漏判 —— 之前
     IntersectionObserver 窄带方案在快速滚动时会漏掉第一个作品的弹出/收起 */
  const coverRef = useRef<HTMLDivElement>(null);
  const [veilUp, setVeilUp] = useState(false);
  useEffect(() => {
    const el = coverRef.current;
    if (!el || !window.matchMedia("(max-width: 767px)").matches) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const line = window.innerHeight * 0.43;
      setVeilUp(rect.top <= line && rect.bottom >= line);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 1,
        delay: (index % 2) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group block w-full touch-manipulation text-left"
    >
      <div
        ref={coverRef}
        className="relative w-full overflow-hidden border border-[color:var(--line)]"
      >
        {/* 封面：按后台裁剪的原始比例完整显示（所见即所得，不再二次裁切） */}
        {item.cover ? (
          <img
            src={item.cover}
            alt={item.title}
            loading="lazy"
            className="block w-full grayscale-[18%] transition-[filter] duration-[1400ms] ease-silk group-hover:grayscale-0"
          />
        ) : (
          <div className="relative aspect-video w-full">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(155deg, #fdfcfa 0%, #f4f2ed 58%, #ece7de 100%)",
              }}
            />
            <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[color:var(--accent)]/35" />
          </div>
        )}

        {/* 说明条：桌面端滑过弹出（hover）；手机端只随滚动位置自动弹出/收起，
            不响应触摸的 hover 模拟（否则按住封面一会就卡在弹出状态） */}
        <div
          className={`work-veil absolute inset-x-0 bottom-0 px-3 py-3.5 transition-transform duration-[900ms] ease-silk md:px-4 md:py-4 ${
            veilUp ? "translate-y-0" : "translate-y-full"
          } md:group-hover:translate-y-0`}
        >
          <p className="line-clamp-3 text-[0.72rem] leading-[1.8] text-[color:var(--fg)]/80 md:text-[0.78rem]">
            {item.description}
          </p>
          <span className="eyebrow mt-3.5 flex items-center gap-3 text-[12px] text-[color:var(--accent)]">
            详情 <ArrowUpRight size={14} />
          </span>
        </div>
      </div>

      {/* 图片下方固定信息：标题居左，右侧为标签组（年份在英文标签正上方） */}
      <div className="mt-3 flex items-end justify-between gap-3 md:mt-4 md:gap-4">
        <h3
          data-cursor-lens
          className="w-anim display text-[1rem] leading-snug text-[color:var(--fg)] md:text-[1.35rem]"
          style={W}
        >
          {item.title}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="eyebrow tnum text-[9px] text-[color:var(--fg)]/45 md:text-[10px]">
            {item.year}
          </span>
          <span className="eyebrow text-[8px] md:text-[9px]">{item.tag}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ───────────────── 进场 ───────────────── */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────── 弹窗 ───────────────── */
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
  /* 手机端：弹窗改为底部半屏抽屉（头部可拖拽，上滑过半屏 / 下滑收起） */
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const dragControls = useDragControls();

  /* 最新回调存 ref：effect 只跑一次，避免反复解绑/绑定 */
  const cbRef = useRef({ onClose, onPrev, onNext });
  cbRef.current = { onClose, onPrev, onNext };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cbRef.current.onClose();
      if (e.key === "ArrowLeft") cbRef.current.onPrev();
      if (e.key === "ArrowRight") cbRef.current.onNext();
    };
    window.addEventListener("keydown", onKey);

    /* 打开时压入一条历史记录：手机返回键 = 关弹窗，而不是退出网站 */
    window.history.pushState({ workModal: true }, "");
    const onPop = () => cbRef.current.onClose();
    window.addEventListener("popstate", onPop);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      /* 通过界面（而非返回键）关闭时，把压入的历史记录弹回去 */
      if (window.history.state?.workModal) window.history.back();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gallery: string[] = item.gallery?.length
    ? item.gallery
    : item.cover
      ? [item.cover]
      : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 md:items-center md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: isMobile ? "100%" : 40,
          scale: isMobile ? 1 : 0.985,
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: isMobile ? "100%" : 40,
          scale: isMobile ? 1 : 0.985,
        }}
        transition={{ duration: isMobile ? 0.4 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        drag={isMobile ? "y" : false}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.55, bottom: 0.3 }}
        onDragEnd={(_, info) => {
          /* 上滑超过半屏或快速上甩 → 收起；下滑同样可收起 */
          const half = window.innerHeight / 2;
          if (info.offset.y < -half || info.velocity.y < -700) onClose();
          else if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="relative flex h-[95vh] w-full select-none flex-col overflow-hidden rounded-t-2xl border border-white/15 bg-[#141412] shadow-[0_36px_110px_-18px_rgba(0,0,0,0.7)] md:h-auto md:max-h-[88vh] md:max-w-5xl md:bg-transparent md:select-text md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 玻璃层 1：磨砂压暗（手机端实底不磨砂）；层 2：黑色镜面渐变 */}
        <div className="glass-warp pointer-events-none absolute inset-0 hidden md:block" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1a1a19]/72 via-[#0c0c0b]/70 to-[#161613]/78" />
        {/* 玻璃上缘高光 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* 头部整体（手机端作为抽屉拖拽把手区：按住上下拖动） */}
        <div
          className="relative z-20 shrink-0"
          style={isMobile ? { touchAction: "none" } : undefined}
          onPointerDown={(e) => {
            if (!isMobile) return;
            /* 按钮上按下时不启动拖拽，保证点击正常 */
            if ((e.target as HTMLElement).closest("button, a")) return;
            dragControls.start(e);
          }}
        >
          {/* 手机端抽屉把手（朱红色，深色底上一眼可见） */}
          <div className="flex justify-center pb-1.5 pt-3 md:hidden">
            <span className="h-1.5 w-14 rounded-full bg-[color:var(--accent)]" />
          </div>

          {/* 顶栏（手机端白底红字，桌面端保持黑色玻璃） */}
          <div className="flex items-center justify-between border-b border-black/10 bg-white px-5 py-4 md:border-white/10 md:bg-black/35 md:backdrop-blur-xl md:px-8">
            <span className="eyebrow tnum text-[10px] text-[#141310]/55 md:text-inherit">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-6">
              <button
                onClick={onPrev}
                className="eyebrow text-[10px] text-[color:var(--accent)] transition-colors md:text-[color:var(--muted)] md:hover:text-[color:var(--fg)]"
                aria-label="Previous"
              >
                ← Prev
              </button>
              <button
                onClick={onNext}
                className="eyebrow text-[10px] text-[color:var(--accent)] transition-colors md:text-[color:var(--muted)] md:hover:text-[color:var(--fg)]"
                aria-label="Next"
              >
                Next →
              </button>
              <button
                onClick={onClose}
                className="eyebrow text-[10px] text-[color:var(--accent)] md:text-[color:var(--fg)]"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>

          {/* 标题区：固定在顶部，不随图片滚动；手机端白底黑字（红字点缀），桌面端黑色玻璃 */}
          <div className="relative z-20 shrink-0 border-b border-black/10 bg-white px-5 py-6 md:border-white/10 md:bg-black/55 md:backdrop-blur-xl md:px-8 md:py-8">
            <p className="eyebrow flex items-center gap-3 text-[10px] text-[color:var(--accent)]">
              <span className="seal-line" />
              {item.tag} · {item.year}
            </p>
            <h3 className="display mt-4 text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.15] text-[#141310] md:text-[color:var(--fg)]">
              {item.title}
            </h3>
            <p className="mt-4 line-clamp-4 whitespace-pre-line text-[0.82rem] leading-[1.85] text-[#141310]/70 md:text-[0.88rem] md:text-[color:var(--fg)]/65">
              {item.description}
            </p>
            {item.role && (
              <p className="mt-3 text-sm text-[#141310]/60 md:text-[color:var(--muted)]">
                <span className="eyebrow mr-3 text-[10px]">Role</span>
                {item.role}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* 图集：公众号式纵向排布，图片之间零间距 */}
          {gallery.length > 0 && (
            <div className="flex flex-col bg-black/25">
              {gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${item.title} — ${i + 1}/${gallery.length}`}
                  loading="lazy"
                  draggable={false}
                  className="block w-full select-none"
                />
              ))}
            </div>
          )}

          {/* PDF */}
          {item.pdf && (
            <div className="border-b border-[color:var(--line)]">
              <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3 md:px-8">
                <p className="eyebrow text-[10px]">PDF Document</p>
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="eyebrow flex items-center gap-2 text-[10px] text-[color:var(--accent)]"
                >
                  <Download size={12} /> Download
                </a>
              </div>
              <iframe
                src={item.pdf}
                title={`${item.title} PDF`}
                className="h-[60vh] w-full bg-white md:h-[68vh]"
              />
            </div>
          )}

          {/* 描述与外链（标题已固定在顶部） */}
          <div className="px-5 py-9 md:px-8 md:py-12">
            <div className="rule mb-8" />

            <p className="whitespace-pre-line text-[0.92rem] leading-[1.95] text-[color:var(--fg)]/80">
              {item.description}
            </p>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="group mt-10 inline-flex items-center gap-3 border border-[color:var(--fg)] px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--fg)] transition-colors duration-500 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]"
              >
                Visit live
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
