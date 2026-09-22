import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowLeft, ExternalLink } from "lucide-react";
import { useConfig } from "../lib/useConfig";

type WorkItem = {
  title: string;
  tag: string;
  year: string;
  cover?: string;
  description: string;
  role?: string;
  link?: string;
};

export function Works() {
  const cfg = useConfig();
  const works: WorkItem[] = cfg.works.items;
  const [active, setActive] = useState<number | null>(null);

  if (!works || works.length === 0) return null;

  // Bento 布局：第一个占两列两行（featured），其余一列一行
  const featured = works[0];
  const rest = works.slice(1);

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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:auto-rows-[260px]">
          {/* Featured 大卡：占 2 列 2 行 */}
          <WorkCard
            item={featured}
            index={0}
            onOpen={() => setActive(0)}
            featured
          />

          {/* 其余小卡 */}
          {rest.map((w, i) => (
            <WorkCard
              key={i}
              item={w}
              index={i + 1}
              onOpen={() => setActive(i + 1)}
            />
          ))}
        </div>

        {/* 装饰：作品计数 */}
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

      {/* 整页详情视图 */}
      <AnimatePresence>
        {active !== null && works[active] && (
          <WorkDetail
            key="detail"
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

/* ─── 卡片组件 ─── */
function WorkCard({
  item,
  index,
  onOpen,
  featured = false,
}: {
  item: WorkItem;
  index: number;
  onOpen: () => void;
  featured?: boolean;
}) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden border border-[color:var(--line)] bg-[color:var(--surface)] text-left ${
        featured ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-[4/3] md:aspect-auto"
      }`}
    >
      {/* 图片 / 占位渐变 */}
      {item.cover ? (
        <img
          src={item.cover}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 group-hover:rotate-1"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:from-black/90 group-hover:via-black/40 transition-all duration-500" />

      {/* 顶部：编号 + 右上角图标 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm">
          {String(index + 1).padStart(2, "0")} · {item.year}
        </span>
        <motion.span
          className="text-white/90 group-hover:text-[color:var(--accent)] transition-colors"
          whileHover={{ rotate: 45 }}
        >
          <ArrowUpRight size={featured ? 28 : 22} />
        </motion.span>
      </div>

      {/* 底部：标题 + tag + 描述 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-2 transform transition-transform duration-500 group-hover:-translate-y-1">
          {item.tag}
        </p>
        <h3
          className={`font-display text-white leading-[1.1] ${
            featured
              ? "text-3xl md:text-5xl"
              : "text-xl md:text-2xl"
          } transform transition-transform duration-500 group-hover:-translate-y-1`}
        >
          {item.title}
        </h3>

        {/* Hover 划入的描述 */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <p className="pt-3 text-sm text-white/85 max-w-md leading-relaxed">
              {item.description}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)]">
              View case <ArrowUpRight size={12} />
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── 详情视图 ─── */
function WorkDetail({
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-[color:var(--bg)] overflow-y-auto"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen"
      >
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[color:var(--line)] bg-[color:var(--bg)]/85 backdrop-blur-md">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to works
          </button>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              aria-label="Previous"
              className="p-2 text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={onNext}
              aria-label="Next"
              className="p-2 text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Hero 封面 */}
        {item.cover && (
          <div className="relative w-full overflow-hidden">
            <img
              src={item.cover}
              alt={item.title}
              className="w-full h-[50vh] md:h-[70vh] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[color:var(--bg)]" />
          </div>
        )}

        {/* 内容 */}
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-20">
            <div className="md:col-span-4">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)] mb-4 inline-flex items-center gap-2"
              >
                <span className="h-px w-6 bg-[color:var(--accent)]" />
                {item.tag} · {item.year}
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-display text-[color:var(--fg)] leading-[1.05] tracking-tight mb-10 text-[clamp(2rem,4.5vw,3.5rem)]"
              >
                {item.title}
              </motion.h3>

              {item.role && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)] mb-2">
                    Role
                  </p>
                  <p className="text-sm text-[color:var(--fg)]/85 leading-relaxed">
                    {item.role}
                  </p>
                </motion.div>
              )}

              {item.link && (
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 border border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--bg)] transition-all duration-300"
                >
                  Visit live
                  <ExternalLink size={14} />
                </motion.a>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-8"
            >
              <p className="text-[color:var(--fg)]/90 leading-relaxed text-base md:text-lg">
                {item.description}
              </p>

              {/* 装饰元素：底部彩条 */}
              <div className="mt-16 flex items-center gap-2">
                <span className="h-px flex-1 bg-[color:var(--line)]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  End of case
                </span>
                <span className="h-px flex-1 bg-[color:var(--line)]" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}