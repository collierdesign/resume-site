import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SiteConfig, ThemeConfig } from "../types";
import { defaultConfig } from "../data/config";

const KEY = "resume_site_config_v1";

const ConfigContext = createContext<{
  config: SiteConfig;
  setConfig: (c: SiteConfig) => void;
  resetConfig: () => void;
  setTheme: (t: ThemeConfig["id"]) => void;
} | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(() => {
    if (typeof window === "undefined") return defaultConfig;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {}
    return defaultConfig;
  });

  const setConfig = useCallback((c: SiteConfig) => {
    setConfigState(c);
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch (e) {
      console.warn("localStorage 保存失败", e);
    }
  }, []);

  const resetConfig = useCallback(() => setConfig(defaultConfig), [setConfig]);

  const setTheme = useCallback(
    (id: ThemeConfig["id"]) => {
      setConfig({ ...config, theme: { ...config.theme, id } });
    },
    [config, setConfig]
  );

  // 把主题变量写入 :root
  useEffect(() => {
    const root = document.documentElement;
    const palettes: Record<ThemeConfig["id"], { bg: string; fg: string; muted: string; line: string; surface: string }> = {
      dark: { bg: "#0a0a0a", fg: "#f5f5f0", muted: "#888", line: "#222", surface: "#111" },
      light: { bg: "#f5f5f0", fg: "#0a0a0a", muted: "#666", line: "#dcdcd6", surface: "#ffffff" },
      paper: { bg: "#ede7d8", fg: "#2a2520", muted: "#7a6e5e", line: "#c9bea8", surface: "#e3dac6" },
      mono: { bg: "#000000", fg: "#ffffff", muted: "#999", line: "#222", surface: "#0a0a0a" },
    };
    const p = palettes[config.theme.id] || palettes.dark;
    root.style.setProperty("--bg", p.bg);
    root.style.setProperty("--fg", p.fg);
    root.style.setProperty("--muted", p.muted);
    root.style.setProperty("--line", p.line);
    root.style.setProperty("--surface", p.surface);
    root.style.setProperty("--accent", config.theme.accent || "#c5f82e");
    root.style.setProperty("--font-display", config.theme.fontDisplay || "'Playfair Display', serif");
    root.style.setProperty("--font-scale", String(config.theme.fontScale || 1));
    root.style.setProperty("--line-height", String(config.theme.lineHeight || 1.6));
    root.style.setProperty("--radius", `${config.theme.radius || 0}px`);
  }, [config.theme]);

  return (
    <ConfigContext.Provider value={{ config, setConfig, resetConfig, setTheme }}>
      {children}
    </ConfigContext.Provider>
  );
}

// 组件里直接用：const cfg = useConfig();
export function useConfig(): SiteConfig {
  const ctx = useContext(ConfigContext);
  return ctx?.config ?? defaultConfig;
}

export function useConfigActions() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfigActions must be used inside ConfigProvider");
  return ctx;
}