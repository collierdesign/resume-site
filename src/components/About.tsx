import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { useConfig } from "../lib/useConfig";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

export function About() {
  const cfg = useConfig();

  return (
    <section id="about" className="section-pad relative overflow-hidden">
      {/* 制图网格肌理：径向渐隐，衬在正文一侧 */}
      <div
        aria-hidden
        className="fine-grid fine-grid-fade pointer-events-none absolute -right-10 -top-6 hidden h-[26rem] w-[42rem] opacity-70 md:block"
      />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
        <SectionHead index="01" label="About" meta="Introduction" />

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:gap-16">
          {/* 大标题 */}
          <Reveal className="md:col-span-4">
            <h2
              className="display w-anim text-balance text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.25] text-[color:var(--fg)]"
              style={W}
            >
              {cfg.about.headline}
            </h2>
          </Reveal>

          {/* 正文 */}
          <div className="md:col-span-7 md:col-start-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              <Reveal delay={0.08}>
                <p className="text-[0.95rem] leading-[1.95] text-[color:var(--fg)]/80">
                  {cfg.about.paragraph1}
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-[0.95rem] leading-[1.95] text-[color:var(--fg)]/80">
                  {cfg.about.paragraph2}
                </p>
              </Reveal>
            </div>

            {/* 数字 */}
            {cfg.about.stats.length > 0 && (
              <Reveal delay={0.22}>
                <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-20 md:grid-cols-4">
                  {cfg.about.stats.map((s, i) => (
                    <div key={i} className="border-t border-[color:var(--line)] pt-4">
                      <dt className="display tnum text-[clamp(1.75rem,3vw,2.5rem)] leading-none text-[color:var(--fg)]">
                        {s.value}
                      </dt>
                      <dd className="eyebrow mt-3 text-[10px] leading-relaxed">
                        {s.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
