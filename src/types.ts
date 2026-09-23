// 站点完整配置结构

export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
}

export interface NavItem {
  id: string;
  label: string;
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location?: string;
  description: string;
  highlights?: string[];
}

export interface WorkItem {
  title: string;
  year: string;
  tag: string;
  cover?: string;
  gallery?: string[];
  pdf?: string;
  description: string;
  role?: string;
  link?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
  /** 展示在技能卡片内的简短说明 */
  description?: string;
  /** lucide 图标名称，例如 PenTool、Box、Languages */
  icon?: string;
}

export interface Social {
  label: string;
  url: string;
}

export interface PdfConfig {
  enabled: boolean;
  url: string;
  filename: string;
  headline: string;
  description: string;
}

export interface ThemeConfig {
  id: "dark" | "light" | "paper" | "mono";
  accent: string;
  fontDisplay: string;
  fontScale: number;
  lineHeight: number;
  radius: number;
}

export interface SiteConfig {
  profile: Profile;
  /** 站点级展示：浏览器标签页标题、SEO 描述等 */
  site: {
    title: string;
    description?: string;
  };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    /** 首屏那一句话（鼠标滑过会变粗） */
    statement: string;
    backgroundImage: string;
    backgroundVideo: string;
    quickFacts: QuickFact[];
  };
  /** 左右流动的英文条带 */
  marquee: {
    top: string[];
    bottom: string[];
  };
  about: {
    headline: string;
    paragraph1: string;
    paragraph2: string;
    /** 区块中那句独立的引文（鼠标滑过会变粗） */
    quote: string;
    stats: Stat[];
  };
  experience: {
    headline: string;
    items: ExperienceItem[];
  };
  works: {
    headline: string;
    items: WorkItem[];
  };
  skills: {
    headline: string;
    groups: SkillGroup[];
    tools: string[];
  };
  pdf: PdfConfig;
  contact: {
    eyebrow: string;
    socials: Social[];
  };
  theme: ThemeConfig;
}
