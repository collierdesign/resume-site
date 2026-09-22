import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function Hero() {
  const cfg = useConfig();
  const heroRef = useRef<HTMLDivElement>(null);

  // 鼠标 spotlight
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sx = useSpring(mx, { damping: 30, stiffness: 150, mass: 0.5 });
  const sy = useSpring(my, { damping: 30, stiffness: 150, mass: 0.5 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = heroRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inX = e.clientX >= r.left && e.clientX <= r.right;
      const inY = e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inX || !inY) return;
      mx.set(((e.clientX - r.left) / r.width) * 100);
      my.set(((e.clientY - r.top) / r.height) * 100);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  const spotlightX = useTransform(sx, (v) => `${v}%`);
  const spotlightY = useTransform(sy, (v) => `${v}%`);

  const name = cfg.profile.name || "Starle";
  const letters = Array.from(name);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
    >
      {/* ───── 背景层 ───── */}
      <div className="absolute inset-0">
        {/* 渐变底色 / 自定义背景 */}
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
              background: `radial-gradient(ellipse at 50% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%), linear-gradient(180deg, var(--bg) 0%, var(--bg) 55%, color-mix(in srgb, var(--bg) 92%, var(--accent)) 100%)`,
            }}
          />
        )}

        {/* SVG 网格 */}
        <svg
          className="absolute inset-0 w-full h-full text-[color:var(--fg)]"
          style={{ opacity: 0.06 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="heroGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>

        {/* 噪点纹理 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.07, mixBlendMode: "overlay" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="heroNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#heroNoise)" />
        </svg>

        {/* 浮动光斑 1 */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{
            left: "-10%",
            top: "15%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 35%, transparent) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 220, 60, 0], y: [0, 120, -40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 浮动光斑 2 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{
            right: "-8%",
            bottom: "5%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)",
          }}
          animate={{ x: [0, -180, -60, 0], y: [0, -100, 60, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 鼠标 spotlight */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            left: spotlightX,
            top: spotlightY,
            x: "-50%",
            y: "-50%",
            mixBlendMode: "screen",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 28%, transparent) 0%, transparent 45%)",
          }}
        />

        {/* 底部柔和过渡 */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[color:var(--bg)]" />
      </div>

      {/* ───── 顶部 eyebrow ───── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 px-6 md:px-12 pt-32 md:pt-40"
      >
        <p className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          <span className="h-px w-10 bg-[color:var(--muted)]" />
          {cfg.hero.eyebrow || "Portfolio · 2026"}
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)]/60 backdrop-blur px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
            <span className="text-[10px]">Available</span>
          </span>
        </p>
      </motion.div>

      {/* ───── 中央主标题（字符错峰） ───── */}
      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-6 md:px-12 flex-1 flex items-center py-12">
        <div className="w-full">
          <h1 className="font-display text-[color:var(--fg)] overflow-hidden leading-[0.9] tracking-tight text-[clamp(3rem,11vw,9rem)]">
            {letters.map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.25 + i * 0.04,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 + letters.length * 0.04 }}
            className="mt-6 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <h2 className="font-display text-[color:var(--muted)] italic font-light max-w-2xl text-[clamp(1.25rem,2.6vw,2.25rem)] leading-snug">
              {cfg.profile.title}
            </h2>
            <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              <span>Designer</span>
              <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" />
              <span>Engineer</span>
              <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" />
              <span>Shanghai · CN</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ───── 底部 quickFacts ───── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
        >
          {cfg.hero.quickFacts.map((f, i) => (
            <div key={i} className="border-t border-[color:var(--line)] pt-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)] mb-2">
                {f.label}
              </p>
              <p className="text-sm text-[color:var(--fg)]">{f.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ───── Scroll 提示 ───── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 right-6 md:right-12 z-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]"
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