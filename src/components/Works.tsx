import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { useConfig } from "../lib/useConfig";

export function Works() {
  const cfg = useConfig();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="works" className="py-32 md:py-48 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] sticky top-32">
              <span className="text-[color:var(--accent)]">/</span> 03 — Works
            </p>
          </Reveal>

          <div className="md:col-span-9">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-[color:var(--fg)] mb-16">
                {cfg.works.headline}
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {cfg.works.items.map((w, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <button
                    onClick={() => setActive(i)}
                    className="group block w-full text-left"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface)] mb-5">
                      {w.cover ? (
                        <img
                          src={w.cover}
                          alt={w.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[color:var(--accent)]/30 to-[color:var(--bg)]" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                        <ArrowUpRight
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          size={32}
                        />
                      </div>
                      <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider text-white bg-black/60 px-2 py-1 rounded-sm">
                        {w.year}
                      </div>
                    </div>
                    <h3 className="font-display text-xl text-[color:var(--fg)] group-hover:text-[color:var(--accent)] transition-colors">
                      {w.title}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {w.tag}
                    </p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[color:var(--bg)] max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-[color:var(--line)]">
                <div>
                  <h3 className="font-display text-2xl text-[color:var(--fg)]">
                    {cfg.works.items[active].title}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] mt-1">
                    {cfg.works.items[active].tag} · {cfg.works.items[active].year}
                  </p>
                </div>
                <button onClick={() => setActive(null)} className="text-[color:var(--fg)]">
                  <X size={24} />
                </button>
              </div>
              {cfg.works.items[active].cover && (
                <img
                  src={cfg.works.items[active].cover}
                  alt=""
                  className="w-full"
                />
              )}
              <div className="p-6 space-y-4 text-sm text-[color:var(--fg)]/85 leading-relaxed">
                <p>{cfg.works.items[active].description}</p>
                {cfg.works.items[active].role && (
                  <p>
                    <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      Role ·{" "}
                    </span>
                    {cfg.works.items[active].role}
                  </p>
                )}
                {cfg.works.items[active].link && (
                  <a
                    href={cfg.works.items[active].link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[color:var(--accent)] hover:underline"
                  >
                    Visit <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}