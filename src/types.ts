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
  nav: NavItem[];
  hero: {
    eyebrow: string;
    backgroundImage: string;
    backgroundVideo: string;
    quickFacts: QuickFact[];
  };
  about: {
    headline: string;
    paragraph1: string;
    paragraph2: string;
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