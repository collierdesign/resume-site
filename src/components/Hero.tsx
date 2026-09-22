import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useConfig } from "../lib/useConfig";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

function splitUnits(name: string) {
  const units: string[] = [];
  for (const token of name.split(/(\s+)/)) {
    if (!token) continue;
    if (/^\s+$/.test(token)) units.push("\u00A0");
    else if (/[\u3400-\u9FFF]/.test(token)) units.push(...Array.from(token));
    else units.push(token);
  }
  return units;
}

/** 首屏：留白 + 织物肌理 + 视差圆环，随滚动缓缓沉入纸面。 */
export function Hero() {
  const cfg = useConfig();
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const sx = useSpring(x, { damping: 38, stiffness: 75, mass: 1.1 });
  const sy = useSpring(y, { damping: 38, stiffness: 75, mass: 1.1 });
  const glowX = useTransform(sx, (value) => `${value}%`);
  const glowY = useTransform(sy, (value) => `${value}%`);

  /* 滚动视差：内容下沉淡出，圆环反向上升并旋转 */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const ringY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const ringInnerY = useTransform(scrollYProgress, [0, 1], [0, -72]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: MouseEvent) => {
      const area = ref.current?.getBoundingClientRect();
      if (!area) return;
      x.set(((event.clientX - area.left) / area.width) * 100);
      y.set(((event.clientY - area.top) / area.height) * 100);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  const name = cfg.profile.name || "Your Name";
  const units = useMemo(() => splitUnits(name), [name]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--bg)]"
    >
      {/* 背景：媒体 / 织物肌理 / 光晕 */}
      <div className="pointer-events-none absolute inset-0">
        {cfg.hero.backgroundVideo ? (
          <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-20" src={cfg.hero.backgroundVideo} />
        ) : cfg.hero.backgroundImage ? (
          <img src={cfg.hero.backgroundImage} alt="" className="h-full w-full object-cover opacity-20 grayscale" />
        ) : null}
        <motion.div
          className="absolute h-[36rem] w-[36rem] rounded-full"
          style={{
            left: glowX,
            top: glowY,
            x: "-50%",
            y: "-50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 5%, transparent), transparent 65%)",
          }}
        />
      </div>

      {/* 视差圆环：一大一小，错速上升 */}
      <motion.div
        aria-hidden
        style={{ y: ringY, rotate: ringRotate }}
        className="pointer-events-none absolute -right-[16vmin] top-[10vh] h-[58vmin] w-[58vmin] ring-deco"
      >
        <span className="absolute -top-[3px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[color:var(--accent)]" />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ y: ringInnerY }}
        className="pointer-events-none absolute right-[26vmin] top-[42vh] h-[18vmin] w-[18vmin] ring-deco-accent hidden md:block"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col px-6 md:px-10 lg:px-16">
        {/* 眉题 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.15 }}
          className="flex items-center justify-between pt-28 md:pt-36"
        >
          <span className="flex items-center gap-3">
            <span className="seal" />
            <span className="eyebrow">{cfg.hero.eyebrow || "Portfolio · 2026"}</span>
          </span>
          <span className="eyebrow hidden text-[9px] tracking-[0.48em] md:block">
            Selected works · 2026
          </span>
        </motion.div>

        {/* 主体：左陈述 / 右下巨名 */}
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="flex flex-1 flex-col justify-center py-14 md:py-10">
          {cfg.hero.statement && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[30em]"
            >
              <p className="eyebrow mb-6 flex items-center gap-3 text-[9px]">
                <span className="seal-line" />
                Notes on making
              </p>
              <p
                data-cursor-lens
                className="w-anim display max-w-[13em] text-[clamp(1.9rem,4vw,4.1rem)] leading-[1.28] tracking-[-0.03em] text-[color:var(--fg)]"
                style={W}
              >
                {cfg.hero.statement}
              </p>
            </motion.div>
          )}

          {/* 巨名：右对齐落在基线上，与陈述形成对角张力 */}
          <div className="mt-14 flex justify-end md:mt-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-full text-right"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute -right-3 -top-8 hidden h-10 w-10 rounded-full border border-[color:var(--accent)]/55 md:block"
              />
              <h1
                data-cursor-lens
                className="group display whitespace-nowrap text-[clamp(2.5rem,5.6vw,5.9rem)] leading-[0.92] tracking-[-0.045em] text-[color:var(--fg)]"
              >
                {units.map((unit, index) => (
                  <motion.span
                    key={`${unit}-${index}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.52 + index * 0.055, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                    className="w-anim inline-block"
                    style={W}
                  >
                    {unit}
                  </motion.span>
                ))}
              </h1>
              <p className="italic-serif mt-5 text-sm text-[color:var(--muted)]">{cfg.profile.title}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* 事实栏 */}
        <motion.dl
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 1 }}
          className="grid grid-cols-1 gap-4 border-t border-[color:var(--line)] py-6 md:grid-cols-3 md:gap-8 md:py-7"
        >
          {cfg.hero.quickFacts.slice(0, 3).map((fact, index) => (
            <div key={index} className="flex items-baseline justify-between gap-4 md:justify-start md:gap-4 md:border-l md:border-[color:var(--line)] md:pl-6 md:first:border-l-0 md:first:pl-0">
              <dt className="eyebrow shrink-0 text-[9px]">{fact.label}</dt>
              <dd className="text-right text-sm text-[color:var(--fg)] md:text-left">{fact.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
