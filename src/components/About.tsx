import { Reveal } from "./Reveal";
import { useConfig } from "../lib/useConfig";

export function About() {
  const cfg = useConfig();

  return (
    <section id="about" className="py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          {/* 标签 */}
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 01 — About
            </p>
          </Reveal>

          {/* 内容 */}
          <div className="md:col-span-9 space-y-12">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-[color:var(--fg)]">
                {cfg.about.headline}
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <Reveal delay={0.1}>
                <p className="text-base leading-relaxed text-[color:var(--fg)]/85">
                  {cfg.about.paragraph1}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-base leading-relaxed text-[color:var(--fg)]/85">
                  {cfg.about.paragraph2}
                </p>
              </Reveal>
            </div>

            {cfg.about.stats.length > 0 && (
              <Reveal delay={0.3}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[color:var(--line)]">
                  {cfg.about.stats.map((s, i) => (
                    <div key={i}>
                      <p className="font-display text-4xl md:text-5xl text-[color:var(--accent)]">
                        {s.value}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}