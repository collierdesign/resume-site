import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function Hero() {
  const cfg = useConfig();
  const heroRef = useRef<HTMLDivElement>(null);

  // 鼠标 spotlight（更大更柔）
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sx = useSpring(mx, { damping: 30, stiffness: 120, mass: 0.6 });
  const sy = useSpring(my, { damping: 30, stiffness: 120, mass: 0.6 });

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
      {/* ───── 隐藏 SVG 滤镜定义 ───── */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* 液体流淌：用 turbulence + 位移滤镜让色块持续变形 */}
          <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="2"
              seed="5"
              result="turb"
            >
              <animate
                attributeName="baseFrequency"
                values="0.008 0.012;0.016 0.009;0.011 0.014;0.008 0.012"
                dur="24s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turb"
              scale="320"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* 颗粒噪点（更强） */}
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* ───── 背景层 ───── */}
      <div className="absolute inset-0">
        {/* 1. 自定义背景图 / 视频 */}
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
          <>
            {/* 2. 底层基础渐变（对角、深色） */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 92%, var(--accent)) 40%, var(--bg) 75%, color-mix(in srgb, var(--bg) 88%, var(--accent)) 100%)",
              }}
            />

            {/* 3. 液体流淌层：多个柔光色块被 SVG 滤镜扭曲变形 */}
            <div
              className="absolute inset-0"
              style={{ filter: "url(#liquid)" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 55% 45% at 22% 28%, color-mix(in srgb, var(--accent) 55%, transparent), transparent 65%),
                    radial-gradient(ellipse 45% 55% at 78% 62%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 70%),
                    radial-gradient(ellipse 50% 60% at 48% 88%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 65%)
                  `,
                }}
              />
              <div
                className="absolute -top-40 -left-40 w-[700px] h-[700px]"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--accent) 35%, transparent) 0%, transparent 70%)",
                }}
              />
              <div
                className="absolute -bottom-32 -right-32 w-[650px] h-[650px]"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--accent) 28%, transparent) 0%, transparent 70%)",
                }}
              />
            </div>
          </>
        )}

        {/* 4. 加密网格（更密） */}
        <svg
          className="absolute inset-0 w-full h-full text-[color:var(--fg)] pointer-events-none"
          style={{ opacity: 0.1 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>

        {/* 5. 强噪点纹理 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.14, mixBlendMode: "overlay" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* 6. 鼠标 spotlight（更大、更柔） */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: spotlightX,
            top: spotlightY,
            x: "-50%",
            y: "-50%",
            width: 1000,
            height: 1000,
            mixBlendMode: "screen",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 32%, transparent) 0%, transparent 40%)",
          }}
        />

        {/* 7. 底部柔和过渡 */}
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

      {/* ───── 中央主标题 ───── */}
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