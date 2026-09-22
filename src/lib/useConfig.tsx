import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SiteConfig, ThemeConfig } from "../types";
import { defaultConfig } from "../data/config";
import { fetchCloudConfig, watchCloudConfig } from "./cloudbase";

const KEY = "resume_site_config_v1";

/** 深合并：让旧版本存在浏览器里的配置，也能自动补上新增字段 */
function mergeConfig(base: any, patch: any): any {
  if (Array.isArray(base) || Array.isArray(patch)) return patch ?? base;
  if (typeof base === "object" && base !== null && typeof patch === "object" && patch !== null) {
    const out: any = { ...base };
    for (const k of Object.keys(patch)) out[k] = mergeConfig(base[k], patch[k]);
    return out;
  }
  return patch === undefined ? base : patch;
}

const ConfigContext = createContext<{
  config: SiteConfig;
  setConfig: (c: SiteConfig) => void;
  resetConfig: () => void;
  setTheme: (t: ThemeConfig["id"]) => void;
} | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(() => {
    if (typeof window === "undefined") return defaultConfig;
    // dev 模式：以磁盘上的 config.json 为初始值（云端拉取成功后会被覆盖为云端数据）
    if (import.meta.env.DEV) return defaultConfig;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return mergeConfig(defaultConfig, JSON.parse(raw));
    } catch {}
    return defaultConfig;
  });

  const setConfig = useCallback((c: SiteConfig) => {
    setConfigState(c);
    if (import.meta.env.DEV) {
      // dev：写回 config.json（云端同步由 Admin 的保存流程负责）
      postConfigToDevServer(c);
      return;
    }
    // 生产：写浏览器 localStorage 作为离线缓存
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch (e) {
      console.warn("localStorage 保存失败", e);
    }
  }, []);

  const resetConfig = useCallback(() => setConfig(defaultConfig), [setConfig]);

  // ── 云端配置：拉取 + 实时订阅（dev / prod 都以云端为真源）──
  // 管理后台保存 → 云函数写入数据库 → 这里收到推送 → 全站立刻更新，无需刷新。
  useEffect(() => {
    let unsub: () => void = () => {};
    fetchCloudConfig<SiteConfig>()
      .then((c) => {
        if (c) setConfigState((prev) => mergeConfig(defaultConfig, c));
      })
      .catch((e) => console.warn("[config] 云端拉取失败，先使用本地默认数据", e));
    unsub = watchCloudConfig<SiteConfig>((c) => {
      setConfigState(() => mergeConfig(defaultConfig, c));
    });
    return () => unsub();
  }, []);

  const setTheme = useCallback(
    (id: ThemeConfig["id"]) => {
      setConfig({ ...config, theme: { ...config.theme, id } });
    },
    [config, setConfig]
  );

  // 把主题变量写入 :root
  useEffect(() => {
    const root = document.documentElement;
    const palettes: Record<
      ThemeConfig["id"],
      {
        bg: string;
        fg: string;
        muted: string;
        line: string;
        surface: string;
        accent2: string;
        accent3: string;
      }
    > = {
      // 純白（默认）：最大留白，宋体细笔画才显质感
      light: {
        bg: "#ffffff",
        fg: "#141310",
        muted: "#8b8880",
        line: "#e9e7e2",
        surface: "#fbfaf8",
        accent2: "#33556e",
        accent3: "#7d9174",
      },
      // 生成り（暖纸）
      paper: {
        bg: "#f7f4ed",
        fg: "#2b2721",
        muted: "#8a7f6d",
        line: "#e3dccd",
        surface: "#f1ece1",
        accent2: "#33556e",
        accent3: "#7d9174",
      },
      // 墨夜
      dark: {
        bg: "#111110",
        fg: "#f4f3ef",
        muted: "#9a978f",
        line: "#262523",
        surface: "#1a1918",
        accent2: "#8fb0c9",
        accent3: "#a8bd9f",
      },
      // 純墨
      mono: {
        bg: "#000000",
        fg: "#ffffff",
        muted: "#8f8f8f",
        line: "#222222",
        surface: "#0b0b0b",
        accent2: "#b9c7d6",
        accent3: "#c2cdb8",
      },
    };
    const p = palettes[config.theme.id] || palettes.light;
    root.style.setProperty("--bg", p.bg);
    root.style.setProperty("--fg", p.fg);
    root.style.setProperty("--fg-muted", p.muted);
    root.style.setProperty("--muted", p.muted);
    root.style.setProperty("--line", p.line);
    root.style.setProperty("--border", p.line);
    root.style.setProperty("--surface", p.surface);
    root.style.setProperty("--accent", config.theme.accent || "#b04630");
    root.style.setProperty("--accent-2", p.accent2);
    root.style.setProperty("--accent-3", p.accent3);
    root.style.setProperty(
      "--font-display",
      config.theme.fontDisplay ||
        "'EB Garamond', 'Noto Serif SC', 'Songti SC', STSong, SimSun, serif"
    );
    root.style.setProperty("--font-scale", String(config.theme.fontScale || 1));
    root.style.setProperty("--line-height", String(config.theme.lineHeight || 1.8));
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

/** dev 模式下把配置写回 config.json（vite.config.ts 的 /api/config 接口） */
function postConfigToDevServer(c: SiteConfig) {
  fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  }).catch((e) => console.warn("写回 config.json 失败", e));
}

export function useConfigActions() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfigActions must be used inside ConfigProvider");
  return ctx;
}
