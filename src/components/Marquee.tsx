import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

/** 用实际内容宽度驱动循环，避免短文本和不同屏幕上出现停滞。 */
export function Marquee({
  items,
  reverse = false,
  duration = 52,
  variant = "caps",
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
  variant?: "caps" | "italic";
  className?: string;
}) {
  const words = items.filter(Boolean);
  const unitRef = useRef<HTMLDivElement>(null);
  const [unitWidth, setUnitWidth] = useState(0);

  useLayoutEffect(() => {
    const unit = unitRef.current;
    if (!unit) return;
    const measure = () => setUnitWidth(unit.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(unit);
    return () => observer.disconnect();
  }, [words.join("|")]);

  if (words.length === 0) return null;

  const row = (ariaHidden: boolean, key: number) => (
    <div
      key={key}
      ref={key === 0 ? unitRef : undefined}
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {words.map((w, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span
            className={
              variant === "caps"
                ? "display whitespace-nowrap text-[clamp(.95rem,1.8vw,1.35rem)] font-normal uppercase leading-none tracking-[0.18em] text-[color:var(--fg)]/85"
                : "italic-serif whitespace-nowrap text-[clamp(.8rem,1.2vw,.98rem)] leading-none tracking-[0.04em] text-[color:var(--muted)]"
            }
          >
            {w}
          </span>
          <span
            className={`mx-5 inline-block rounded-full md:mx-9 ${
              variant === "caps"
                ? "h-[5px] w-[5px] bg-[color:var(--accent)]"
                : "h-[3px] w-[3px] bg-[color:var(--accent-3)]"
            }`}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="marquee fade-edges py-5 md:py-6">
        <motion.div
          className="marquee-track"
          animate={unitWidth ? { x: reverse ? [-unitWidth, 0] : [0, -unitWidth] } : false}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1, 2, 3].map((copy) => row(copy !== 0, copy))}
        </motion.div>
      </div>
    </div>
  );
}
