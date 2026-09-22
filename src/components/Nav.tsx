import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useConfig } from "../lib/useConfig";

const WEIGHT = { "--w-from": 500, "--w-to": 700 } as React.CSSProperties;

export function Nav() {
  const cfg = useConfig();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { damping: 30, stiffness: 120 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 切页时收起菜单
  useEffect(() => setOpen(false), [pathname]);

  const isHome = pathname === "/";
  const isResume = pathname === "/resume";
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "border-b border-[color:var(--line)] bg-[color:var(--bg)]/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      {/* 阅读进度：一条极细的朱色线 */}
      <motion.span
        className="absolute inset-x-0 top-0 block h-px origin-left bg-[color:var(--accent)]"
        style={{ scaleX: progress, opacity: scrolled ? 0.9 : 0 }}
      />

      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <Link to="/" className="group flex items-center gap-3">
          <span className="seal transition-transform duration-500 group-hover:rotate-45" />
          <span
            className="display w-anim text-[1.05rem] tracking-[0.02em] text-[color:var(--fg)]"
            style={WEIGHT}
          >
            {cfg.profile.name || "Your Name"}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {isHome &&
            cfg.nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="w-anim eyebrow text-[color:var(--fg)] hover:text-[color:var(--fg)]"
                style={WEIGHT}
              >
                {item.label}
              </a>
            ))}
          <Link
            to="/resume"
            className="w-anim eyebrow text-[color:var(--fg)]"
            style={WEIGHT}
          >
            {isResume ? "Back" : "Resume"}
          </Link>
          <Link
            to="/admin"
            title="Admin"
            className="eyebrow text-[10px] text-[color:var(--fg-subtle)] transition-colors hover:text-[color:var(--accent)]"
          >
            ·
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="group relative -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
          aria-label="menu"
          aria-expanded={open}
        >
          <span
            className={`absolute h-px w-6 bg-[color:var(--fg)] transition-all duration-500 ${
              open ? "rotate-45" : "-translate-y-[4px]"
            }`}
          />
          <span
            className={`absolute h-px w-6 bg-[color:var(--fg)] transition-all duration-500 ${
              open ? "-rotate-45" : "translate-y-[4px]"
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[color:var(--line)] bg-[color:var(--bg)]/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-6">
              {isHome &&
                cfg.nav.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="display border-b border-[color:var(--line)] py-5 text-2xl text-[color:var(--fg)]"
                  >
                    {item.label}
                  </a>
                ))}
              <Link
                to="/resume"
                onClick={() => setOpen(false)}
                className="display py-5 text-2xl text-[color:var(--fg)]"
              >
                Resume
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
