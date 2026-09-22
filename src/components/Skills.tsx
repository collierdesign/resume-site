import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { useConfig } from "../lib/useConfig";
import { Box, Languages, PenTool, Sparkles } from "lucide-react";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

/** 三个辅助色循环使用，只出现在很小的圆点上 */
const DOTS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
const ICONS = { PenTool, Box, Languages } as const;

export function Skills() {
  const cfg = useConfig();

  return (
    <section id="skills" className="section-pad">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
        <SectionHead index="04" label="Skills" meta="Capabilities" />

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-4">
            <h2
              className="display w-anim text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.25] text-[color:var(--fg)]"
              style={W}
            >
              {cfg.skills.headline}
            </h2>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {cfg.skills.groups.map((g, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="group h-full border border-[color:var(--line)] p-6 transition-colors duration-500 hover:border-[color:var(--fg-subtle)] md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <p className="eyebrow flex items-center gap-3 text-[10px]">
                        <span className="inline-block h-[5px] w-[5px] rounded-full" style={{ background: DOTS[i % DOTS.length] }} />
                        {g.category}
                      </p>
                      <SkillIcon name={g.icon} />
                    </div>
                    <p className="mt-8 min-h-[3.6em] border-l border-[color:var(--line)] pl-4 text-[0.82rem] leading-[1.8] text-[color:var(--muted)]">
                      {g.description || "以细致的判断与稳定的执行，完成每一次表达。"}
                    </p>
                    <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-3">
                      {g.items.map((s, j) => (
                        <span
                          key={j}
                          className="display w-anim text-[clamp(1.1rem,2.1vw,1.65rem)] leading-none text-[color:var(--fg)]"
                          style={W}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {cfg.skills.tools && cfg.skills.tools.length > 0 && (
              <Reveal delay={0.2}>
                <div className="mt-16 border-t border-[color:var(--line)] pt-6">
                  <p className="eyebrow text-[10px]">Tools I use daily</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {cfg.skills.tools.map((t, i) => (
                      <span key={i} className="flex items-center gap-4">
                        <span className="text-[0.9rem] text-[color:var(--muted)]">
                          {t}
                        </span>
                        {i < cfg.skills.tools.length - 1 && (
                          <span className="h-1 w-1 rounded-full bg-[color:var(--line)]" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillIcon({ name }: { name?: string }) {
  const Icon = name && name in ICONS ? ICONS[name as keyof typeof ICONS] : Sparkles;
  return <Icon size={18} strokeWidth={1.15} className="text-[color:var(--fg-muted)] transition-colors duration-500 group-hover:text-[color:var(--accent)]" aria-hidden="true" />;
}
