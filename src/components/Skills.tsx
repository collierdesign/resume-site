import { Reveal } from "./Reveal";
import { useConfig } from "../lib/useConfig";

export function Skills() {
  const cfg = useConfig();

  return (
    <section id="skills" className="py-32 md:py-48 px-6 md:px-12 bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 04 — Skills
            </p>
          </Reveal>

          <div className="md:col-span-9">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-[color:var(--fg)] mb-16">
                {cfg.skills.headline}
              </h2>
            </Reveal>

            <div className="space-y-16">
              {cfg.skills.groups.map((g, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--accent)] mb-6">
                      {g.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((s, j) => (
                        <span
                          key={j}
                          className="px-4 py-2 border border-[color:var(--line)] text-sm text-[color:var(--fg)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
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
              <Reveal delay={0.3}>
                <div className="mt-16 pt-12 border-t border-[color:var(--line)]">
                  <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] mb-6">
                    Tools I use daily
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    {cfg.skills.tools.map((t, i) => (
                      <span
                        key={i}
                        className="text-sm text-[color:var(--fg)]/70"
                      >
                        {t}
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