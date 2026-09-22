import json from "./config.json";
import type { SiteConfig } from "../types";

/**
 * 默认配置 —— 实际数据现在来自 `config.json`。
 * - 在 dev 模式下，后台修改会写回 `config.json`，Vite 自动刷新所有页面。
 * - 发布生产版本（starle1997.cn）时，Vite 会把这个 JSON 打包进 dist。
 *   想让访客看到后台的改动，运行 build → push 即可（不必再手动覆盖文件）。
 */
export const defaultConfig: SiteConfig = json as SiteConfig;