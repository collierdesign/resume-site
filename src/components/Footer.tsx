import { useConfig } from "../lib/useConfig";

export function Footer() {
  const cfg = useConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--line)] px-6 py-10 md:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow flex items-center gap-3 text-[10px]">
          <span className="seal" />
          © {year} {cfg.profile.name}
        </p>

        <div className="flex items-center gap-6">
          <p className="eyebrow text-[10px]">Designed with care</p>
          <span className="hidden h-3 w-px bg-[color:var(--line)] md:block" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="eyebrow text-[10px] transition-colors hover:text-[color:var(--accent)]"
          >
            ↑ Top
          </button>
        </div>
      </div>
    </footer>
  );
}
