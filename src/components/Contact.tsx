import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { ArrowUpRight } from "lucide-react";
import { useConfig } from "../lib/useConfig";

const W = { "--w-from": 400, "--w-to": 700 } as React.CSSProperties;

export function Contact() {
  const cfg = useConfig();

  return (
    <section id="contact" className="section-pad">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
        <SectionHead
          index="05"
          label="Contact"
          meta={cfg.contact.eyebrow || "Get in touch"}
        />

        <div className="mt-14 md:mt-24">
          <Reveal>
            <a
              href={`mailto:${cfg.profile.email}`}
              className="group block break-words"
            >
              <span
                className="display w-anim block text-[clamp(1.9rem,6.4vw,5rem)] leading-[1.12] text-[color:var(--fg)]"
                style={W}
              >
                {cfg.profile.email}
              </span>
              <span className="mt-6 inline-flex items-center gap-3 text-[color:var(--muted)] transition-all duration-500 group-hover:gap-5 group-hover:text-[color:var(--accent)]">
                <span className="eyebrow text-[10px]">Write me a line</span>
                <ArrowUpRight size={16} />
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-20 grid grid-cols-1 gap-10 border-t border-[color:var(--line)] pt-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <p className="eyebrow text-[10px]">Based in</p>
                <p className="mt-4 text-[0.95rem] text-[color:var(--fg)]">
                  {cfg.profile.location}
                </p>
              </div>

              <div className="md:col-span-7 md:col-start-6">
                <p className="eyebrow text-[10px]">Elsewhere</p>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                  {cfg.contact.socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 text-[0.95rem] text-[color:var(--fg)]"
                    >
                      <span className="link-line">{s.label}</span>
                      <ArrowUpRight
                        size={12}
                        className="text-[color:var(--muted)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
