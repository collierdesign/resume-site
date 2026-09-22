import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "../components/Hero";
import { Marquee } from "../components/Marquee";
import { About } from "../components/About";
import { Experience } from "../components/Experience";
import { Works } from "../components/Works";
import { Skills } from "../components/Skills";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { useConfig } from "../lib/useConfig";

/** 滚动导轨：固定在左缘的细线，朱色圆点随整页阅读进度下行。 */
function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-3 top-0 z-40 hidden h-screen w-px rail-track sm:block md:left-5"
    >
      <motion.span
        style={{ top: dotTop }}
        className="absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[color:var(--accent)] shadow-[0_0_0_3px_rgba(176,70,48,0.14)]"
      />
    </motion.div>
  );
}

export default function Home() {
  const cfg = useConfig();

  return (
    <main className="paper-fiber">
      <ScrollRail />
      <Hero />

      {/* 向右流动的英文条带（斜纹肌理底） */}
      <Marquee
        items={cfg.marquee?.top ?? []}
        duration={32}
        className="hatch-band border-y border-[color:var(--line)]"
      />

      <About />
      <Experience />

      {/* 向左流动的英文条带（与上一条相反方向） */}
      <Marquee items={cfg.marquee?.bottom ?? []} reverse variant="italic" duration={42} className="hatch-band border-y border-[color:var(--line)]" />

      <div className="dark-canvas">
        <Works />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
