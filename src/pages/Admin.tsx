import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Save,
  Download,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Palette,
  Settings,
  Eye,
  LogOut,
  AlertTriangle,
  Plus,
  X,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  login,
  logout,
  isAuthed,
  changePassword,
  cloudSaveConfig,
  ADMIN_USER,
} from "../lib/admin";
import { useConfig, useConfigActions } from "../lib/useConfig";
import { defaultConfig } from "../data/config";
import type { SiteConfig, WorkItem } from "../types";
import { ImageCropper } from "../components/ImageCropper";
import { uploadImage, uploadFile, MAX_IMAGE_BYTES } from "../lib/storage";

const THEMES = [
  { id: "light", label: "純白", preview: "#ffffff" },
  { id: "paper", label: "生成り", preview: "#f7f4ed" },
  { id: "dark", label: "墨夜", preview: "#111110" },
  { id: "mono", label: "純墨", preview: "#000000" },
] as const;

const ACCENTS = [
  { name: "朱", value: "#b04630" },
  { name: "藍", value: "#33556e" },
  { name: "若竹", value: "#7d9174" },
  { name: "藤", value: "#8b81c3" },
  { name: "琥珀", value: "#a9761f" },
  { name: "灰桜", value: "#b98b8b" },
];

const FONT_OPTIONS = [
  {
    label: "EB Garamond（英文衬线 · 推荐）",
    value: "'EB Garamond', 'Noto Serif SC', 'Songti SC', STSong, SimSun, serif",
  },
  {
    label: "思源宋体 / Noto Serif SC（中文宋体）",
    value: "'Noto Serif SC', 'Songti SC', STSong, SimSun, serif",
  },
  {
    label: "Noto Serif（英文衬线）",
    value: "'Noto Serif', 'Noto Serif SC', 'Songti SC', SimSun, serif",
  },
  {
    label: "系统宋体（SimSun / Songti SC）",
    value: "SimSun, 'Songti SC', STSong, serif",
  },
];

const EMPTY_WORK: WorkItem = {
  title: "",
  year: "",
  tag: "",
  cover: "",
  gallery: [],
  pdf: "",
  description: "",
  role: "",
  link: "",
};

export default function Admin() {
  const nav = useNavigate();
  const cfg = useConfig();
  const { setConfig } = useConfigActions();
  const [authed, setAuthed] = useState(isAuthed());
  const [tab, setTab] = useState<"profile" | "skills" | "theme" | "works" | "pdf" | "system">(
    "profile"
  );
  const [draft, setDraft] = useState<SiteConfig>(cfg);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  /** 上传进度：key → 0-100 */
  const [uploading, setUploading] = useState<Record<string, number>>({});
  /* 作品库逐项折叠：默认全部折叠，避免几十个作品堆在一起要一直滚。点标题/行展开才有 body */
  const [openWorks, setOpenWorks] = useState<Record<number, boolean>>({});
  /* 作品整行拖拽排序：ref 存拖动源（dragover 期间读不到 dataTransfer 数据），state 只管高亮 */
  const dragWorkRef = useRef<number | null>(null);
  const [dragWork, setDragWork] = useState<number | null>(null);
  const [dragOverWork, setDragOverWork] = useState<number | null>(null);
  /** 待裁剪的文件及其用途 */
  const [cropJob, setCropJob] = useState<{
    file: File;
    apply: (f: File) => void;
  } | null>(null);

  useEffect(() => {
    setDraft(cfg);
  }, [cfg]);

  // ───────── 未登录：要么首次设置密码，要么输入密码 ─────────
  if (!authed) {
    return <AuthGate onAuthed={() => setAuthed(true)} />;
  }

  const update = (path: string, value: any) => {
    setDraft((d) => {
      const next = JSON.parse(JSON.stringify(d));
      const keys = path.split(".");
      let cur: any = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  /** 草稿与云端是否不一致（未保存指示） */
  const dirty = JSON.stringify(draft) !== JSON.stringify(cfg);

  const save = async () => {
    setSaving(true);
    setSaveErr("");
    try {
      const r = await cloudSaveConfig(draft);
      if (r?.ok) {
        // 成功才同步到本地 config（失败保持本地脏状态，提示用户原因）
        setConfig(draft);
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setSaveErr(r?.error || "云端保存失败 / Cloud save failed");
      }
    } catch (e: any) {
      setSaveErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (confirm("确认重置为默认示例数据？此操作会同步到云端，所有访客可见。")) {
      setDraft(defaultConfig);
      cloudSaveConfig(defaultConfig)
        .then((r) => {
          if (r?.ok) {
            setConfig(defaultConfig);
            setSavedAt(new Date().toLocaleTimeString());
          } else setSaveErr(r?.error || "云端同步失败 / Cloud sync failed");
        })
        .catch((e) => setSaveErr(String(e?.message || e)));
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setDraft(parsed);
      } catch {
        alert("JSON 格式错误");
      }
    };
    reader.readAsText(file);
  };

  /**
   * 统一上传入口：带进度展示。
   * apply 在拿到稳定 URL 后写入 draft。
   */
  const startUpload = async (
    key: string,
    file: File,
    apply: (url: string) => void
  ) => {
    if (file.size > MAX_IMAGE_BYTES) {
      alert(
        `图片 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过 3MB 上限，请压缩后再上传。`
      );
      return;
    }
    try {
      setUploading((m) => ({ ...m, [key]: 0 }));
      const url = await uploadImage(file, file.name, (p) =>
        setUploading((m) => ({ ...m, [key]: p }))
      );
      apply(url);
    } catch (e: any) {
      alert(e?.message || "上传失败 / Upload failed");
    } finally {
      setUploading((m) => {
        const n = { ...m };
        delete n[key];
        return n;
      });
    }
  };

  /** 打开裁剪窗口（选择图片 → 裁剪 → 上传） */
  const openCropper = (file: File, apply: (f: File) => void) => {
    if (file.size > MAX_IMAGE_BYTES) {
      alert(
        `图片 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过 3MB 上限，请压缩后再上传。`
      );
      return;
    }
    setCropJob({ file, apply });
  };

  /** 上传进度条（内联小组件） */
  const progressBar = (key: string) => {
    const p = uploading[key];
    if (p === undefined) return null;
    return (
      <div className="mt-2 h-1 w-full bg-white/10">
        <div
          className="h-full bg-emerald-400 transition-all duration-200"
          style={{ width: `${p}%` }}
        />
        <p className="mt-1 text-[10px] text-emerald-400/80">
          上传中… {p}%
        </p>
      </div>
    );
  };

  // ───────── 已登录 ─────────
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-white/60" />
            <span className="font-display text-base">
              后台管理 <span className="text-white/40">/ Admin Console</span>
            </span>
            {dirty && !saveErr && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 ml-4">
                ● 未保存 · Unsaved
              </span>
            )}
            {!dirty && savedAt && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 ml-4">
                ✓ 已保存 · Saved {savedAt}
              </span>
            )}
            {saveErr && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-rose-400 ml-4">
                ✗ {saveErr}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/10 hover:border-white/30"
            >
              <Eye size={12} /> 预览 Preview
            </Link>
            <button
              onClick={() => {
                logout();
                setAuthed(false);
                nav("/admin");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/10 hover:border-white/30"
            >
              <LogOut size={12} /> 退出 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 侧边栏 */}
        <aside className="lg:col-span-3 space-y-1 lg:sticky lg:top-24 self-start">
          {[
            { id: "profile", zh: "内容与档案", en: "Profile & Content", icon: Type },
            { id: "skills", zh: "技能与随笔", en: "Skills & Notes", icon: Palette },
            { id: "works", zh: "作品库", en: `Works · ${draft.works.items.length}`, icon: ImageIcon },
            { id: "theme", zh: "主题与排版", en: "Theme & Layout", icon: Palette },
            { id: "pdf", zh: "PDF 与首屏", en: "PDF & Hero", icon: Upload },
            { id: "system", zh: "系统", en: "System", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border ${
                tab === t.id
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <t.icon size={14} className="shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm">{t.zh}</span>
                <span
                  className={`text-[9px] uppercase tracking-[0.2em] ${
                    tab === t.id ? "text-black/50" : "text-white/30"
                  }`}
                >
                  {t.en}
                </span>
              </span>
            </button>
          ))}

          <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
            <button
              onClick={save}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition disabled:opacity-60"
            >
              <Save size={14} /> {saving ? "保存中… Saving…" : "保存更改 · Save Changes"}
            </button>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-white/60 text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition"
            >
              <RefreshCw size={14} /> 重置示例 · Reset to demo
            </button>
          </div>
        </aside>

        {/* 内容区 */}
        <section className="lg:col-span-9 space-y-8">
          {tab === "profile" && (
            <Card title="个人档案" subtitle="Profile" icon={Type}>
              <Field label="姓名 / Name">
                <Input value={draft.profile.name} onChange={(v) => update("profile.name", v)} />
              </Field>
              <Field label="职位 / Title">
                <Input value={draft.profile.title} onChange={(v) => update("profile.title", v)} />
              </Field>
              <Field label="邮箱 / Email">
                <Input
                  value={draft.profile.email}
                  onChange={(v) => update("profile.email", v)}
                  type="email"
                />
              </Field>
              <Field label="所在地 / Location">
                <Input
                  value={draft.profile.location}
                  onChange={(v) => update("profile.location", v)}
                />
                <p className="text-xs text-white/40 mt-2">
                  💡 显示在页面底部 Contact 区块（BASED IN）。
                  首屏左下角的「Location」是下面的快速事实，需要单独改。
                </p>
              </Field>

              <Field label="浏览器标签页标题 / Tab Title（显示在浏览器/收藏夹上）">
                <Input
                  value={draft.site?.title || ""}
                  onChange={(v) => update("site.title", v)}
                  placeholder="Starle 林夏 — 作品集"
                />
              </Field>

              {/* 首屏左下角快速事实（Location / Focus / Status） */}
              <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  首屏快速事实 / Hero Quick Facts（首页左下角 Location · Focus · Status）
                </p>
                {(draft.hero.quickFacts || []).map((fact, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label={`标签 / Label ${i + 1}`}>
                      <Input
                        value={fact.label}
                        onChange={(v) => {
                          const next = [...draft.hero.quickFacts];
                          next[i] = { ...next[i], label: v };
                          update("hero.quickFacts", next);
                        }}
                      />
                    </Field>
                    <Field label={`内容 / Value ${i + 1}`}>
                      <Input
                        value={fact.value}
                        onChange={(v) => {
                          const next = [...draft.hero.quickFacts];
                          next[i] = { ...next[i], value: v };
                          update("hero.quickFacts", next);
                        }}
                      />
                    </Field>
                  </div>
                ))}
              </div>

              {/* 导航标签 */}
              <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  导航标签 / Nav Labels（页面顶部 About · Experience · Works · Skills · Contact）
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {(draft.nav || []).map((item, i) => (
                    <Field key={item.id} label={item.id}>
                      <Input
                        value={item.label}
                        onChange={(v) => {
                          const next = [...draft.nav];
                          next[i] = { ...next[i], label: v };
                          update("nav", next);
                        }}
                      />
                    </Field>
                  ))}
                </div>
              </div>

              {/* Contact 区块（页面底部） */}
              <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Contact 区块 / Footer Contact（页面底部邮箱下方）
                </p>
                <Field label="区块副标 / Eyebrow（默认 Get in touch）">
                  <Input
                    value={draft.contact?.eyebrow || ""}
                    onChange={(v) => update("contact.eyebrow", v)}
                  />
                </Field>
                <div className="space-y-3">
                  {(draft.contact?.socials || []).map((s, i) => (
                    <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                      <Field label={`链接名 / Label ${i + 1}`}>
                        <Input
                          value={s.label}
                          onChange={(v) => {
                            const next = [...(draft.contact?.socials || [])];
                            next[i] = { ...next[i], label: v };
                            update("contact.socials", next);
                          }}
                        />
                      </Field>
                      <Field label="URL">
                        <Input
                          value={s.url}
                          onChange={(v) => {
                            const next = [...(draft.contact?.socials || [])];
                            next[i] = { ...next[i], url: v };
                            update("contact.socials", next);
                          }}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "contact.socials",
                            (draft.contact?.socials || []).filter((_, idx) => idx !== i)
                          )
                        }
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-[10px] uppercase tracking-[0.2em] md:mb-1"
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update("contact.socials", [
                        ...(draft.contact?.socials || []),
                        { label: "New link", url: "https://" },
                      ])
                    }
                    className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/5"
                  >
                    <Plus size={14} /> 添加链接 · Add link
                  </button>
                </div>
              </div>

              <Field label="首屏一句话 / Hero Statement（鼠标滑过会变粗）">
                <Textarea
                  value={draft.hero.statement || ""}
                  onChange={(v) => update("hero.statement", v)}
                  rows={2}
                />
              </Field>

              <Field label="流动文字 · 上行 / Marquee Top（逗号分隔）">
                <Input
                  value={(draft.marquee?.top || []).join(", ")}
                  onChange={(v) =>
                    update(
                      "marquee.top",
                      v
                        .split(/[,，]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </Field>

              <Field label="流动文字 · 下行 / Marquee Bottom（逗号分隔）">
                <Input
                  value={(draft.marquee?.bottom || []).join(", ")}
                  onChange={(v) =>
                    update(
                      "marquee.bottom",
                      v
                        .split(/[,，]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </Field>

              <Field label="About 标题 / Headline">
                <Input
                  value={draft.about.headline}
                  onChange={(v) => update("about.headline", v)}
                />
              </Field>
              <Field label="About 段落 1 / Paragraph 1">
                <Textarea
                  value={draft.about.paragraph1}
                  onChange={(v) => update("about.paragraph1", v)}
                  rows={4}
                />
              </Field>
              <Field label="About 段落 2 / Paragraph 2">
                <Textarea
                  value={draft.about.paragraph2}
                  onChange={(v) => update("about.paragraph2", v)}
                  rows={4}
                />
              </Field>

              <Field label="About 引文 / Quote（鼠标滑过会变粗）">
                <Textarea
                  value={draft.about.quote || ""}
                  onChange={(v) => update("about.quote", v)}
                  rows={2}
                />
              </Field>

              {/* About 数字统计（7+ / 60+ / 20+ / 32 那一排） */}
              <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  About 数字统计 / Stats（About 板块正文下方 7+ · 60+ 那一排）
                </p>
                {(draft.about.stats || []).map((s, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                    <Field label={`数字 / Value ${i + 1}`}>
                      <Input
                        value={s.value}
                        onChange={(v) => {
                          const next = [...draft.about.stats];
                          next[i] = { ...next[i], value: v };
                          update("about.stats", next);
                        }}
                      />
                    </Field>
                    <Field label={`说明 / Label ${i + 1}`}>
                      <Input
                        value={s.label}
                        onChange={(v) => {
                          const next = [...draft.about.stats];
                          next[i] = { ...next[i], label: v };
                          update("about.stats", next);
                        }}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "about.stats",
                          draft.about.stats.filter((_, index) => index !== i)
                        )
                      }
                      className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-[10px] uppercase tracking-[0.2em] md:mb-1"
                    >
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update("about.stats", [
                      ...(draft.about.stats || []),
                      { value: "0+", label: "NEW STAT" },
                    ])
                  }
                  className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/5"
                >
                  <Plus size={14} /> 添加一项 · Add stat
                </button>
              </div>

              <Field label="Experience 标题 / Headline">
                <Input
                  value={draft.experience.headline}
                  onChange={(v) => update("experience.headline", v)}
                />
              </Field>

              {draft.experience.items.map((it, i) => (
                <div key={i} className="border border-white/10 p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Experience #{i + 1}
                  </p>
                  <Field label="时间段 / Period">
                    <Input
                      value={it.period}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], period: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                  <Field label="Role">
                    <Input
                      value={it.role}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], role: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                  <Field label="公司 / Company">
                    <Input
                      value={it.company}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], company: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                  <Field label="描述 / Description">
                    <Textarea
                      value={it.description}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], description: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                  <Field label="总结亮点 / Highlights（每行一条，如：主导 5+ 个品牌……）">
                    <Textarea
                      value={(it.highlights || []).join("\n")}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = {
                          ...next[i],
                          highlights: v
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        update("experience.items", next);
                      }}
                      rows={3}
                    />
                  </Field>
                </div>
              ))}
            </Card>
          )}

          {tab === "skills" && (
            <Card title="技能与随笔" subtitle="Skills & Notes" icon={Palette}>
              <p className="-mt-2 text-xs leading-relaxed text-white/50">
                每一项技能都会显示为一张带图标和说明文字的卡片；这里的内容会同步到主页。
              </p>
              <Field label="Skills 标题 / Headline">
                <Input value={draft.skills.headline} onChange={(v) => update("skills.headline", v)} />
              </Field>
              <div className="space-y-4">
                {draft.skills.groups.map((group, i) => (
                  <div key={i} className="space-y-3 border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Skill card #{i + 1}</p>
                      <button type="button" onClick={() => update("skills.groups", draft.skills.groups.filter((_, index) => index !== i))} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-rose-400 hover:text-rose-300"><Trash2 size={12} /> 删除</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field label="分类 / Category"><Input value={group.category} onChange={(v) => updateSkill(i, "category", v)} /></Field>
                      <Field label="图标 / Icon"><select value={group.icon || "Sparkles"} onChange={(e) => updateSkill(i, "icon", e.target.value)} className="w-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-white/40"><option value="PenTool">PenTool · 设计</option><option value="Box">Box · 工具</option><option value="Languages">Languages · 语言</option><option value="Sparkles">Sparkles · 其他</option></select></Field>
                    </div>
                    <Field label="说明文本 / Description"><Textarea value={group.description || ""} onChange={(v) => updateSkill(i, "description", v)} rows={2} /></Field>
                    <Field label="技能项目 / Items（逗号分隔）"><Textarea value={group.items.join(", ")} onChange={(v) => updateSkill(i, "items", v.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} rows={2} /></Field>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => update("skills.groups", [...draft.skills.groups, { category: "New skill", icon: "Sparkles", description: "", items: [] }])} className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/5"><Plus size={14} /> 添加技能卡</button>
              <Field label="常用工具 / Tools（逗号分隔）"><Textarea value={draft.skills.tools.join(", ")} onChange={(v) => update("skills.tools", v.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} rows={2} /></Field>
            </Card>
          )}

          {tab === "works" && (
            <Card title={`作品库 · 当前 ${draft.works.items.length} 件`} icon={ImageIcon}>
              <p className="text-xs text-white/50 -mt-2">
                点击「添加作品」可无限新增。主页所有作品以等大卡片排列，鼠标滑过显示简介，点击弹出案例详情（图集可左右翻页、PDF 可在弹窗内直接阅读）。按住作品行可上下拖动调整顺序，首页同步此顺序。
              </p>

              <div className="space-y-4">
                {draft.works.items.map((w, i) => {
                  const open = !!openWorks[i];
                  return (
                  <div
                    key={i}
                    className="border border-white/10 relative bg-white/[0.02]"
                  >
                    {/* 头部一行：点任意空白处展开/折叠；按住可上下拖动排序（首页同步此顺序）；删除在最右 */ }
                    <div
                      className={`flex items-stretch justify-between cursor-grab active:cursor-grabbing transition ${
                        dragWork === i
                          ? "opacity-40"
                          : dragOverWork === i
                          ? "ring-1 ring-inset ring-white/50"
                          : ""
                      }`}
                      draggable
                      onDragStart={(e) => {
                        dragWorkRef.current = i;
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", `work-${i}`);
                        setDragWork(i);
                      }}
                      onDragEnd={() => {
                        dragWorkRef.current = null;
                        setDragWork(null);
                        setDragOverWork(null);
                      }}
                      onDragOver={(e) => {
                        if (dragWorkRef.current === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverWork !== i) setDragOverWork(i);
                      }}
                      onDragLeave={() => {
                        if (dragOverWork === i) setDragOverWork(null);
                      }}
                      onDrop={(e) => {
                        const from = dragWorkRef.current;
                        if (from === null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        dragWorkRef.current = null;
                        setDragWork(null);
                        setDragOverWork(null);
                        if (from === i) return;
                        const next = [...draft.works.items];
                        const [moved] = next.splice(from, 1);
                        next.splice(i, 0, moved);
                        update("works.items", next);
                        /* 展开状态跟着作品一起搬过去 */
                        setOpenWorks((m) => {
                          const flags = draft.works.items.map(
                            (_, idx) => !!m[idx]
                          );
                          const [f] = flags.splice(from, 1);
                          flags.splice(i, 0, f);
                          const n: Record<number, boolean> = {};
                          flags.forEach((v, idx) => {
                            if (v) n[idx] = true;
                          });
                          return n;
                        });
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenWorks((m) => ({ ...m, [i]: !m[i] }))
                        }
                        className="flex flex-1 items-center justify-between gap-3 p-5 text-left transition hover:bg-white/[0.03]"
                        aria-expanded={open}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                            Project #{i + 1} {i === 0 && "· Featured"}
                            {!open && (
                              <span className="ml-3 normal-case tracking-normal text-white/30">
                                {w.gallery?.length
                                  ? `· ${w.gallery.length} 张图`
                                  : ""}
                              </span>
                            )}
                          </p>
                          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-white">
                            <span className="truncate">
                              {w.title || (
                                <em className="text-white/40 not-italic">
                                  未命名作品
                                </em>
                              )}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                              {w.year}
                            </span>
                            {w.tag && (
                              <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                                {w.tag}
                              </span>
                            )}
                          </p>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-white/50 transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "works.items",
                            draft.works.items.filter((_, idx) => idx !== i)
                          )
                        }
                        className="flex items-center gap-1 px-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-[10px] uppercase tracking-[0.2em] transition border-l border-white/10"
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>

                    {open && (
                      <div className="border-t border-white/10 p-5 pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="标题 / Title">
                        <Input
                          value={w.title}
                          onChange={(v) => updateWork(i, "title", v)}
                          placeholder="青山计划"
                        />
                      </Field>
                      <Field label="年份 / Year">
                        <Input
                          value={w.year}
                          onChange={(v) => updateWork(i, "year", v)}
                          placeholder="2025"
                        />
                      </Field>
                      <Field label="标签 / Tag">
                        <Input
                          value={w.tag}
                          onChange={(v) => updateWork(i, "tag", v)}
                          placeholder="Brand Identity"
                        />
                      </Field>
                      <Field label="角色 / Role">
                        <Input
                          value={w.role || ""}
                          onChange={(v) => updateWork(i, "role", v)}
                          placeholder="Lead Designer"
                        />
                      </Field>
                    </div>

                    <Field label="封面图 URL / Cover（点击按钮上传，或把图片拖到下面方框里）">
                      <DropZone
                        onFiles={(fs) =>
                          openCropper(fs[0], (cropped) =>
                            startUpload(`cover-${i}`, cropped, (url) =>
                              updateWork(i, "cover", url)
                            )
                          )
                        }
                        hint="松开 → 裁剪并设为封面"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={w.cover || ""}
                            onChange={(v) => updateWork(i, "cover", v)}
                            placeholder="https://... 或点击右侧按钮本机上传"
                          />
                          <label className="flex items-center gap-1 px-3 py-2 border border-white/20 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 shrink-0">
                            <Upload size={12} /> 上传并裁剪
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                e.target.value = "";
                                openCropper(f, (cropped) =>
                                  startUpload(`cover-${i}`, cropped, (url) =>
                                    updateWork(i, "cover", url)
                                  )
                                );
                              }}
                            />
                          </label>
                        </div>
                        {progressBar(`cover-${i}`)}
                        {w.cover && (
                          <div className="mt-2 h-24 w-32 border border-white/10 overflow-hidden bg-black/30">
                            <img
                              src={w.cover}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </DropZone>
                    </Field>

                    <Field label="图集 / Gallery（按住缩略图可排序；从电脑把图片拖到下面方框也可直接上传）">
                      <DropZone
                        multiple
                        onFiles={(fs) => uploadGalleryFiles(i, fs)}
                        hint="松开 → 添加到图集"
                      >
                        <div className="flex flex-wrap gap-2 min-h-[5rem]">
                          {(w.gallery || []).map((src, gi) => (
                            <div
                              key={gi}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", String(gi));
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const from = parseInt(
                                  e.dataTransfer.getData("text/plain"),
                                  10
                                );
                                if (isNaN(from) || from === gi) return;
                                const next = [...(w.gallery || [])];
                                const [moved] = next.splice(from, 1);
                                next.splice(gi, 0, moved);
                                updateWork(i, "gallery", next as any);
                              }}
                              className="relative w-20 h-20 border border-white/10 group cursor-grab active:cursor-grabbing"
                              title="拖动排序"
                            >
                              <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <span className="absolute bottom-1 left-1 bg-black/70 px-1 text-[9px] text-white/80">
                                {gi + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...(w.gallery || [])];
                                  next.splice(gi, 1);
                                  updateWork(i, "gallery", next as any);
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
                                aria-label="删除"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 flex items-center justify-center border border-dashed border-white/30 text-white/60 hover:text-white hover:border-white/60 cursor-pointer transition">
                            <Plus size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                e.target.value = "";
                                uploadGalleryFiles(i, files);
                              }}
                            />
                          </label>
                        </div>
                      </DropZone>
                      {progressBar(`gallery-${i}`)}
                      <p className="text-xs text-white/40 mt-2">
                        💡 按住缩略图拖动可调整顺序；弹窗里按此顺序排列，第一张默认作封面。
                      </p>
                    </Field>

                    <Field label="PDF 附件 / PDF File（弹窗内直接预览）">
                      <div className="flex gap-2">
                        <Input
                          value={w.pdf || ""}
                          onChange={(v) => updateWork(i, "pdf", v)}
                          placeholder="/works/青山计划.pdf 或 https://..."
                        />
                        <label className="flex items-center gap-1 px-3 py-2 border border-white/20 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 shrink-0">
                          <Upload size={12} /> 上传 PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              e.target.value = "";
                              (async () => {
                                try {
                                  setUploading((m) => ({ ...m, [`pdf-${i}`]: 0 }));
                                  const url = await uploadFile(f, (p) =>
                                    setUploading((m) => ({ ...m, [`pdf-${i}`]: p }))
                                  );
                                  updateWork(i, "pdf", url);
                                } catch (err: any) {
                                  alert(err?.message || "上传失败");
                                } finally {
                                  setUploading((m) => {
                                    const n = { ...m };
                                    delete n[`pdf-${i}`];
                                    return n;
                                  });
                                }
                              })();
                            }}
                          />
                        </label>
                      </div>
                      {progressBar(`pdf-${i}`)}
                      {w.pdf && (
                        <div className="mt-2 border border-white/10 bg-black/30">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                              预览
                            </p>
                            <button
                              type="button"
                              onClick={() => updateWork(i, "pdf", "")}
                              className="text-rose-400 hover:text-rose-300 text-[10px] uppercase tracking-[0.2em] inline-flex items-center gap-1"
                            >
                              <Trash2 size={10} /> 清除
                            </button>
                          </div>
                          <iframe
                            src={w.pdf}
                            title="PDF preview"
                            className="w-full h-48"
                          />
                        </div>
                      )}
                    </Field>

                    <Field label="描述 / Description">
                      <Textarea
                        value={w.description}
                        onChange={(v) => updateWork(i, "description", v)}
                        rows={3}
                      />
                    </Field>

                    <Field label="外链 / Link URL（可选）">
                      <Input
                        value={w.link || ""}
                        onChange={(v) => updateWork(i, "link", v)}
                        placeholder="https://..."
                      />
                    </Field>
                      </div>
                    )}
                  </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    update("works.items", [...draft.works.items, { ...EMPTY_WORK }])
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border border-dashed border-white/30 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white hover:border-white/60 transition"
                >
                  <Plus size={14} /> 添加作品（无数量限制）
                </button>
              </div>

              <Field label="区块标题 / Section Headline">
                <Input
                  value={draft.works.headline}
                  onChange={(v) => update("works.headline", v)}
                />
              </Field>
            </Card>
          )}

          {tab === "theme" && (
            <>
              <Card title="主题" subtitle="Theme" icon={Palette}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update("theme.id", t.id)}
                      className={`p-4 border text-left transition ${
                        draft.theme.id === t.id
                          ? "border-white bg-white/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div
                        className="h-12 w-full mb-3 border border-white/10"
                        style={{ background: t.preview }}
                      />
                      <p className="text-xs uppercase tracking-[0.2em]">{t.label}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="点缀色 / Accent" icon={Palette}>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => update("theme.accent", a.value)}
                      className={`h-12 w-12 rounded-full border-2 transition ${
                        draft.theme.accent === a.value
                          ? "border-white scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ background: a.value }}
                      title={a.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={draft.theme.accent}
                    onChange={(e) => update("theme.accent", e.target.value)}
                    className="h-12 w-12 rounded-full bg-transparent border border-white/20 cursor-pointer"
                  />
                </div>
              </Card>

              <Card title="排版参数" subtitle="Typography" icon={Type}>
                <Field label="字体 / Display Font">
                  <select
                    value={draft.theme.fontDisplay}
                    onChange={(e) => update("theme.fontDisplay", e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 text-sm"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="字号缩放 / Font Scale">
                  <input
                    type="range"
                    min="0.9"
                    max="1.2"
                    step="0.05"
                    value={draft.theme.fontScale}
                    onChange={(e) => update("theme.fontScale", parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-white/40 mt-1">{draft.theme.fontScale}x</p>
                </Field>
                <Field label="行距 / Line Height">
                  <input
                    type="range"
                    min="1.4"
                    max="2.0"
                    step="0.05"
                    value={draft.theme.lineHeight}
                    onChange={(e) => update("theme.lineHeight", parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-white/40 mt-1">{draft.theme.lineHeight}</p>
                </Field>
                <Field label="圆角 / Corner Radius">
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="2"
                    value={draft.theme.radius}
                    onChange={(e) => update("theme.radius", parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-white/40 mt-1">{draft.theme.radius}px</p>
                </Field>
              </Card>
            </>
          )}

          {tab === "pdf" && (
            <>
              <Card title="PDF 简历" subtitle="Résumé PDF" icon={Upload}>
                <Field label="启用 PDF 在线阅读 / Enable PDF Viewer">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.pdf.enabled}
                      onChange={(e) => update("pdf.enabled", e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-white/70">
                      在首页 Skills 与 Contact 之间展示 PDF 区块（编号 05）
                    </span>
                  </label>
                </Field>

                <Field label="PDF 文件链接 / PDF URL">
                  <Input
                    value={draft.pdf.url}
                    onChange={(v) => update("pdf.url", v)}
                    placeholder="https://... 或 /resume.pdf"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    💡 把 PDF 放到 <code className="text-white/70">public/</code> 目录，
                    例如 <code className="text-white/70">public/resume.pdf</code>，路径写
                    <code className="text-white/70">/resume.pdf</code> 即可。仓库里已自带一份示例
                    <code className="text-white/70">public/resume.pdf</code>，替换成你自己的即可。
                    首页区块内嵌预览，导航「Resume」进入全屏阅读器（<code className="text-white/70">/resume</code>）。
                  </p>
                </Field>

                <Field label="下载文件名 / Download Filename">
                  <Input
                    value={draft.pdf.filename}
                    onChange={(v) => update("pdf.filename", v)}
                  />
                </Field>

                <Field label="区块标题 / Section Headline">
                  <Input
                    value={draft.pdf.headline}
                    onChange={(v) => update("pdf.headline", v)}
                  />
                </Field>

                <Field label="区块描述 / Section Description">
                  <Textarea
                    value={draft.pdf.description}
                    onChange={(v) => update("pdf.description", v)}
                    rows={3}
                  />
                </Field>

                <div className="pt-4 border-t border-white/10">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 cursor-pointer">
                    <Upload size={14} /> 从本机上传 PDF · Upload（≤10MB，存云存储）
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        e.target.value = "";
                        (async () => {
                          try {
                            setUploading((m) => ({ ...m, ["pdf-resume"]: 0 }));
                            const url = await uploadFile(f, (p) =>
                              setUploading((m) => ({ ...m, ["pdf-resume"]: p }))
                            );
                            update("pdf.url", url);
                          } catch (err: any) {
                            alert(err?.message || "上传失败");
                          } finally {
                            setUploading((m) => {
                              const n = { ...m };
                              delete n["pdf-resume"];
                              return n;
                            });
                          }
                        })();
                      }}
                    />
                  </label>
                  {progressBar("pdf-resume")}
                </div>
              </Card>

              <Card title="封面图 / Hero 背景" icon={ImageIcon}>
                <Field label="Hero 背景图 / Background Image URL">
                  <div className="flex gap-2">
                    <Input
                      value={draft.hero.backgroundImage}
                      onChange={(v) => update("hero.backgroundImage", v)}
                      placeholder="https://... 或右侧本机上传"
                    />
                    <label className="flex items-center gap-1 px-3 py-2 border border-white/20 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 shrink-0">
                      <Upload size={12} /> 上传并裁剪
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          e.target.value = "";
                          openCropper(f, (cropped) =>
                            startUpload("hero-bg", cropped, (url) =>
                              update("hero.backgroundImage", url)
                            )
                          );
                        }}
                      />
                    </label>
                  </div>
                  {progressBar("hero-bg")}
                </Field>
                <Field label="Hero 背景视频 / Background Video URL（可选）">
                  <Input
                    value={draft.hero.backgroundVideo}
                    onChange={(v) => update("hero.backgroundVideo", v)}
                    placeholder="/hero.mp4"
                  />
                </Field>
                <p className="text-xs text-white/40 mt-2">
                  💡 推荐尺寸 1920×1080，文件 &lt; 500KB 最佳。
                  放在 <code className="text-white/70">public/</code> 目录即可。
                </p>
              </Card>
            </>
          )}

          {tab === "system" && (
            <>
              <Card title="数据管理" subtitle="Data Management" icon={Settings}>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={exportJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs uppercase tracking-[0.2em]"
                  >
                    <Download size={14} /> 导出 config.json
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 border border-white/20 text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5">
                    <Upload size={22} /> 导入 config.json
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) importJSON(f);
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-white/40 mt-3">
                  当前数据存于腾讯云 CloudBase 数据库，保存后所有访客实时同步。
                  建议每月导出一次 JSON 备份到本地。
                </p>
              </Card>

              <Card title="修改后台密码" subtitle="Change Password" icon={Lock}>
                <ChangePasswordForm />
              </Card>

              <Card title="架构说明" subtitle="How it works" icon={AlertTriangle}>
                <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
                  <li>
                    配置真源是腾讯云 CloudBase 数据库：后台用 CloudBase Auth 账号密码登录
                    （<code className="text-white/70">siteadmin</code>）后直写数据库 →
                    所有访客<b className="text-white">实时收到推送</b>（无需刷新页面、无需重新部署）。
                  </li>
                  <li>
                    数据库写权限由安全规则锁定为管理员本人（匿名访客只读），
                    登录态与写权限均由云端强制校验。
                  </li>
                  <li>
                    <code className="text-white/70">src/data/config.json</code> 仅作为首次初始化
                    与云端不可用时的兜底数据。
                  </li>
                  <li>
                    图片 / PDF 建议放 <code className="text-white/70">public/</code> 目录后用 URL 引用；
                    base64 内嵌会撑大文档，超过云端单文档限制会导致保存失败。
                  </li>
                  <li>
                    密码可在上方「修改后台密码」中更换（CloudBase Auth 托管，任何人看不到明文）。
                  </li>
                  <li>更强的防护：Cloudflare Pages → Settings → Access，给 /admin 路径加邮箱验证。</li>
                </ul>
              </Card>
            </>
          )}
        </section>
      </div>

      {/* 图片裁剪预览窗口 */}
      {cropJob && (
        <ImageCropper
          file={cropJob.file}
          onConfirm={(f) => {
            cropJob.apply(f);
            setCropJob(null);
          }}
          onCancel={() => setCropJob(null)}
        />
      )}
    </main>
  );

  function updateWork(idx: number, key: keyof WorkItem, value: any) {
    const next = [...draft.works.items];
    next[idx] = { ...next[idx], [key]: value };
    update("works.items", next);
  }

  /**
   * 追加画廊图片（函数式更新）。
   * 多张连续上传时若用 updateWork + 外层闭包里的 w.gallery，
   * 每次都会基于过期快照覆盖 → 只剩最后一张。此函数始终基于最新 draft 追加。
   */
  function appendWorkGallery(idx: number, urls: string[]) {
    setDraft((d) => {
      const next = JSON.parse(JSON.stringify(d));
      const item = next.works.items[idx];
      if (!item) return d;
      item.gallery = [...(item.gallery || []), ...urls];
      return next;
    });
  }

  /** 把一批图片文件按序上传并追加到指定作品的图集（点击选择与拖拽上传共用） */
  function uploadGalleryFiles(idx: number, files: File[]) {
    if (!files.length) return;
    const bad = files.find((f) => f.size > MAX_IMAGE_BYTES);
    if (bad) {
      alert(
        `「${bad.name}」${(bad.size / 1024 / 1024).toFixed(1)}MB 超过 3MB 上限`
      );
      return;
    }
    (async () => {
      for (let fi = 0; fi < files.length; fi++) {
        const f = files[fi];
        try {
          setUploading((m) => ({
            ...m,
            [`gallery-${idx}`]: Math.round((fi / files.length) * 100),
          }));
          const url = await uploadImage(f, f.name, (p) =>
            setUploading((m) => ({
              ...m,
              [`gallery-${idx}`]: Math.round(
                ((fi + p / 100) / files.length) * 100
              ),
            }))
          );
          appendWorkGallery(idx, [url]);
        } catch (err: any) {
          alert(err?.message || "上传失败");
        }
      }
      setUploading((m) => {
        const n = { ...m };
        delete n[`gallery-${idx}`];
        return n;
      });
    })();
  }

  function updateSkill(idx: number, key: string, value: any) {
    const next = [...draft.skills.groups];
    next[idx] = { ...next[idx], [key]: value };
    update("skills.groups", next);
  }
}

/* ───────── 登录（CloudBase Auth 用户名密码） ───────── */
function AuthGate({ onAuthed }: { onAuthed: () => void }) {
  const [user, setUser] = useState(ADMIN_USER);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock size={20} />
          </div>
          <h1 className="font-display text-3xl mb-2">Admin</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            登录以继续 · Sign in to continue
          </p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const r = await login(user, pwd);
            setBusy(false);
            if (r.ok) onAuthed();
            else setErr(r.error || "登录失败");
          }}
        >
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="用户名 Username"
            autoComplete="username"
            className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
            autoFocus
          />
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="密码 Password"
            autoComplete="current-password"
            className="w-full mt-3 px-5 py-4 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
          />
          {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-4 px-5 py-4 bg-white text-black text-xs uppercase tracking-[0.25em] hover:bg-white/90 transition disabled:opacity-60"
          >
            {busy ? "验证中… Verifying…" : "登录 Login"}
          </button>
        </form>
        <Link
          to="/"
          className="block mt-8 text-center text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}

/* ───────── 改密表单（已登录态） ───────── */
function ChangePasswordForm() {
  const [cur, setCur] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
      <Field label="当前密码 / Current Password">
        <Input value={cur} onChange={setCur} type="password" />
      </Field>
      <Field label="新密码 / New Password">
        <Input value={a} onChange={setA} type="password" placeholder="至少 6 位" />
      </Field>
      <Field label="确认新密码 / Confirm Password">
        <Input value={b} onChange={setB} type="password" />
      </Field>
      <button
        onClick={async () => {
          if (a.length < 6) return setErr("新密码至少 6 位");
          if (a !== b) return setErr("两次新密码不一致");
          setBusy(true);
          setErr("");
          const r = await changePassword(cur, a);
          setBusy(false);
          if (!r.ok) return setErr(r.error || "当前密码错误");
          setCur("");
          setA("");
          setB("");
          setDone(true);
          setTimeout(() => setDone(false), 3000);
        }}
        disabled={busy}
        className="px-4 py-2 bg-white text-black text-xs uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {busy ? "更新中… Updating…" : "更新密码 · Update Password"}
      </button>
      {done && <p className="text-emerald-400 text-xs">✓ 密码已更新（云端生效）</p>}
      {err && <p className="text-rose-400 text-xs">{err}</p>}
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <div className="flex items-baseline gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.015]">
        <Icon size={14} className="text-white/60 self-center" />
        <h3 className="text-sm">{title}</h3>
        {subtitle && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">
            {subtitle}
          </span>
        )}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition resize-y"
    />
  );
}

/* ───────── 拖拽上传区 ─────────
 * 只响应外部文件拖入（e.dataTransfer.types 包含 "Files"），
 * 内部图集拖拽排序（text/plain）走各自的 onDrop，互不冲突。
 */
function DropZone({
  onFiles,
  multiple = false,
  hint,
  children,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  /* 在文档层面兜底：浏览器有时不会在「拖到外面释放」时给我们 dragleave，
     导致 depth 永不归 0、绿框卡住。监听 window 的 dragend / drop 重置一次 */
  useEffect(() => {
    const reset = () => {
      depth.current = 0;
      setOver(false);
    };
    window.addEventListener("dragend", reset);
    /* 捕获阶段：任何位置发生 drop 都清掉所有高亮（不影响我们自己 zone 的 onDrop 处理文件） */
    window.addEventListener("drop", reset, true);
    return () => {
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset, true);
    };
  }, []);

  const isFileDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types || []).includes("Files");

  return (
    <div
      onDragEnter={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        depth.current += 1;
        if (depth.current === 1) setOver(true);
      }}
      onDragOver={(e) => {
        /* 只在这里声明允许 drop 并设置光标样式 —— 不递增计数器，避免 onDragOver
           每帧触发把计数推飞后无法靠 onDragLeave 减回去（之前绿框卡住就是这个） */
        if (isFileDrag(e)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}
      onDragLeave={() => {
        if (depth.current > 0) depth.current -= 1;
        if (depth.current <= 0) {
          depth.current = 0;
          setOver(false);
        }
      }}
      onDrop={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        const files = Array.from(e.dataTransfer.files || []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (!files.length) return;
        onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`relative transition-colors ${
        over ? "ring-2 ring-emerald-400/60 bg-emerald-400/5" : ""
      }`}
    >
      {children}
      {over && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded bg-emerald-400/10">
          <span className="rounded border border-emerald-300/70 bg-emerald-400/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-emerald-50">
            {hint || "松开上传图片"}
          </span>
        </div>
      )}
    </div>
  );
}
