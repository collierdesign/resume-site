import { useConfig } from "../lib/useConfig";

export function Footer() {
  const cfg = useConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--line)] px-6 md:px-12 py-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
          © {year} {cfg.profile.name} · All rights reserved
        </p>
        <p className="text-xs text-[color:var(--muted)]">
          Designed with care · Hosted on Cloudflare
        </p>
      </div>
    </footer>
  );
}