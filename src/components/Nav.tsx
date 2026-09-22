import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useConfig } from "../lib/useConfig";

export function Nav() {
  const cfg = useConfig();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const isResume = pathname === "/resume";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "backdrop-blur-md bg-[color:var(--surface)]/80 border-b border-[color:var(--line)]"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--accent)] transition-transform group-hover:scale-150" />
          <span className="font-display text-base tracking-wider text-[color:var(--fg)]">
            {cfg.profile.name || "Your Name"}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {isHome &&
            cfg.nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition"
              >
                {item.label}
              </a>
            ))}
          <Link
            to="/resume"
            className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition"
          >
            {isResume ? "← Back" : "Resume"}
          </Link>
          {!isAdmin && (
            <Link
              to="/admin"
              className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition opacity-50"
              title="Admin"
            >
              ··
            </Link>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[color:var(--fg)]"
          aria-label="menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[color:var(--surface)] border-t border-[color:var(--line)]"
          >
            <div className="flex flex-col gap-6 px-6 py-8">
              {isHome &&
                cfg.nav.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]"
                  >
                    {item.label}
                  </a>
                ))}
              <Link
                to="/resume"
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]"
              >
                Resume
              </Link>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}