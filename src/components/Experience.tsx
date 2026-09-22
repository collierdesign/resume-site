import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { useConfig } from "../lib/useConfig";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

export function Experience() {
  const cfg = useConfig();

  return (
    <section id="experience" className="section-pad">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
        <SectionHead index="02" label="Experience" meta="Selected timeline" />

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-4">
            <h2
              className="display w-anim text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.25] text-[color:var(--fg)]"
              style={W}
            >
              {cfg.experience.headline}
            </h2>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6">
            {cfg.experience.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <article className="group grid grid-cols-1 gap-4 border-t border-[color:var(--line)] py-9 md:grid-cols-12 md:gap-6 md:py-11">
                  <p className="italic-serif tnum text-sm text-[color:var(--muted)] md:col-span-3">
                    {item.period}
                  </p>

                  <div className="md:col-span-8">
                    <h3
                      className="display w-anim text-[1.35rem] leading-snug text-[color:var(--fg)] md:text-[1.6rem]"
                      style={W}
                    >
                      {item.role}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {item.company}
                      {item.location && ` · ${item.location}`}
                    </p>
                    <p className="mt-5 text-[0.9rem] leading-[1.9] text-[color:var(--fg)]/75">
                      {item.description}
                    </p>

                    {item.highlights && item.highlights.length > 0 && (
                      <ul className="mt-5 space-y-1.5">
                        {item.highlights.map((h, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-3 text-[0.85rem] leading-relaxed text-[color:var(--muted)]"
                          >
                            <span className="mt-[0.6em] h-px w-3 shrink-0 bg-[color:var(--fg-subtle)]" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="md:col-span-1 md:text-right">
                    <span className="eyebrow tnum text-[10px] transition-colors duration-500 group-hover:text-[color:var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
            <div className="border-t border-[color:var(--line)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
