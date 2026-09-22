import { Reveal } from "./Reveal";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function Contact() {
  const cfg = useConfig();

  return (
    <section id="contact" className="py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 06 — Contact
            </p>
          </Reveal>

          <div className="md:col-span-9">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted)] mb-6">
                {cfg.contact.eyebrow || "Get in touch"}
              </p>
            </Reveal>

            <Reveal>
              <a
                href={`mailto:${cfg.profile.email}`}
                className="group block font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-tight text-[color:var(--fg)] hover:text-[color:var(--accent)] transition-colors break-all"
              >
                {cfg.profile.email}
                <ArrowUpRight
                  className="inline-block ml-4 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2"
                  size={48}
                />
              </a>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[color:var(--line)]">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] mb-3">
                    <MapPin size={12} /> Based in
                  </p>
                  <p className="text-base text-[color:var(--fg)]">{cfg.profile.location}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] mb-3">
                    <Mail size={12} /> Elsewhere
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {cfg.contact.socials.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-base text-[color:var(--fg)] hover:text-[color:var(--accent)] transition-colors inline-flex items-center gap-1"
                      >
                        {s.label} <ArrowUpRight size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}