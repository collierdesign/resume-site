import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function Hero() {
  const cfg = useConfig();

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex items-end"
    >
      {/* 背景图 / 视频 / 渐变 */}
      <div className="absolute inset-0">
        {cfg.hero.backgroundVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            src={cfg.hero.backgroundVideo}
          />
        ) : cfg.hero.backgroundImage ? (
          <img
            src={cfg.hero.backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(circle at 30% 50%, color-mix(in srgb, var(--accent) 25%, transparent), transparent 60%), linear-gradient(180deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 80%, var(--accent) 20%) 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--bg)]" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 md:px-12 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            <span className="h-px w-8 bg-[color:var(--muted)]" />
            {cfg.hero.eyebrow || "Portfolio · 2026"}
          </p>
          <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-tight text-[color:var(--fg)]">
            {cfg.profile.name}
          </h1>
          <h2 className="mt-4 font-display text-[clamp(1.25rem,2.6vw,2rem)] font-light italic text-[color:var(--muted)]">
            {cfg.profile.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
        >
          {cfg.hero.quickFacts.map((f, i) => (
            <div key={i} className="border-t border-[color:var(--line)] pt-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)]">
                {f.label}
              </p>
              <p className="mt-2 text-sm text-[color:var(--fg)]">{f.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]"
      >
        <span>Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </motion.div>
    </section>
  );
}