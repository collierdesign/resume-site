import { Reveal } from "./Reveal";
import { useConfig } from "../lib/useConfig";

export function Experience() {
  const cfg = useConfig();

  return (
    <section id="experience" className="py-32 md:py-48 px-6 md:px-12 bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 02 — Experience
            </p>
          </Reveal>

          <div className="md:col-span-9">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-[color:var(--fg)] mb-16">
                {cfg.experience.headline}
              </h2>
            </Reveal>

            <div className="space-y-0">
              {cfg.experience.items.map((item, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <article className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 py-10 border-t border-[color:var(--line)] transition-colors hover:bg-[color:var(--bg)]/40">
                    <div className="md:col-span-2">
                      <p className="font-mono text-xs uppercase tracking-wider text-[color:var(--accent)]">
                        {item.period}
                      </p>
                    </div>
                    <div className="md:col-span-7">
                      <h3 className="font-display text-2xl md:text-3xl text-[color:var(--fg)]">
                        {item.role}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {item.company}
                        {item.location && ` · ${item.location}`}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-[color:var(--fg)]/80">
                        {item.description}
                      </p>
                      {item.highlights && item.highlights.length > 0 && (
                        <ul className="mt-4 space-y-1">
                          {item.highlights.map((h, j) => (
                            <li
                              key={j}
                              className="text-xs text-[color:var(--muted)] flex items-start gap-2"
                            >
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-[color:var(--accent)] shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="md:col-span-3 md:text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        {String(i + 1).padStart(2, "0")} / {String(cfg.experience.items.length).padStart(2, "0")}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
              <div className="border-t border-[color:var(--line)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}