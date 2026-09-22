import { useEffect, useState } from "react";
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

  const save = async () => {
    setConfig(draft);
    setSaving(true);
    setSaveErr("");
    try {
      const r = await cloudSaveConfig(draft);
      if (r?.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setSaveErr(r?.error || "云端保存失败");
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
      setConfig(defaultConfig);
      cloudSaveConfig(defaultConfig)
        .then((r) => {
          if (r?.ok) setSavedAt(new Date().toLocaleTimeString());
          else setSaveErr(r?.error || "云端同步失败");
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

  // ───────── 已登录 ─────────
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-white/60" />
            <span className="font-display text-base">Admin Console</span>
            {savedAt && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 ml-4">
                ✓ Saved at {savedAt}
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
              <Eye size={12} /> Preview
            </Link>
            <button
              onClick={() => {
                logout();
                setAuthed(false);
                nav("/admin");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/10 hover:border-white/30"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 侧边栏 */}
        <aside className="lg:col-span-3 space-y-1">
          {[
            { id: "profile", label: "Profile & Content", icon: Type },
            { id: "skills", label: "Skills & Notes", icon: Palette },
            { id: "works", label: `Works · ${draft.works.items.length}`, icon: ImageIcon },
            { id: "theme", label: "Theme & Layout", icon: Palette },
            { id: "pdf", label: "PDF & Hero", icon: Upload },
            { id: "system", label: "System", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition border ${
                tab === t.id
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}

          <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
            <button
              onClick={save}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition disabled:opacity-60"
            >
              <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-white/60 text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition"
            >
              <RefreshCw size={14} /> Reset to demo
            </button>
          </div>
        </aside>

        {/* 内容区 */}
        <section className="lg:col-span-9 space-y-8">
          {tab === "profile" && (
            <Card title="Profile" icon={Type}>
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
              </Field>

              <Field label="首屏一句话 / Hero Statement（鼠标滑过会变粗）">
                <Textarea
                  value={draft.hero.statement || ""}
                  onChange={(v) => update("hero.statement", v)}
                  rows={2}
                />
              </Field>

              <Field label="流动英文 · 上行（用逗号分隔）">
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

              <Field label="流动英文 · 下行（用逗号分隔）">
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

              <Field label="About Headline">
                <Input
                  value={draft.about.headline}
                  onChange={(v) => update("about.headline", v)}
                />
              </Field>
              <Field label="About 段落 1">
                <Textarea
                  value={draft.about.paragraph1}
                  onChange={(v) => update("about.paragraph1", v)}
                  rows={4}
                />
              </Field>
              <Field label="About 段落 2">
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

              <Field label="Experience Headline">
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
                  <Field label="Period">
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
                  <Field label="Company">
                    <Input
                      value={it.company}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], company: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea
                      value={it.description}
                      onChange={(v) => {
                        const next = [...draft.experience.items];
                        next[i] = { ...next[i], description: v };
                        update("experience.items", next);
                      }}
                    />
                  </Field>
                </div>
              ))}
            </Card>
          )}

          {tab === "skills" && (
            <Card title="Skills & Notes" icon={Palette}>
              <p className="-mt-2 text-xs leading-relaxed text-white/50">
                每一项技能都会显示为一张带图标和说明文字的卡片；这里的内容会同步到主页。
              </p>
              <Field label="Skills Headline">
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
                    <Field label="技能项目（用逗号分隔）"><Textarea value={group.items.join(", ")} onChange={(v) => updateSkill(i, "items", v.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} rows={2} /></Field>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => update("skills.groups", [...draft.skills.groups, { category: "New skill", icon: "Sparkles", description: "", items: [] }])} className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/5"><Plus size={14} /> 添加技能卡</button>
              <Field label="常用工具（用逗号分隔）"><Textarea value={draft.skills.tools.join(", ")} onChange={(v) => update("skills.tools", v.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} rows={2} /></Field>
            </Card>
          )}

          {tab === "works" && (
            <Card title={`作品库 · 当前 ${draft.works.items.length} 件`} icon={ImageIcon}>
              <p className="text-xs text-white/50 -mt-2">
                点击「添加作品」可无限新增。主页所有作品以等大卡片排列，鼠标滑过显示简介，点击弹出案例详情（图集可左右翻页、PDF 可在弹窗内直接阅读）。
              </p>

              <div className="space-y-4">
                {draft.works.items.map((w, i) => (
                  <div
                    key={i}
                    className="border border-white/10 p-5 space-y-3 relative bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between -mt-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        Project #{i + 1} {i === 0 && "· Featured"}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "works.items",
                            draft.works.items.filter((_, idx) => idx !== i)
                          )
                        }
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-[10px] uppercase tracking-[0.2em]"
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>

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

                    <Field label="封面图 URL / Cover">
                      <div className="flex gap-2">
                        <Input
                          value={w.cover || ""}
                          onChange={(v) => updateWork(i, "cover", v)}
                          placeholder="/works/青山计划.jpg 或 https://..."
                        />
                        <label className="flex items-center gap-1 px-3 py-2 border border-white/20 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 shrink-0">
                          <Upload size={12} /> 本机
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateWork(i, "cover", reader.result as string);
                                alert(
                                  "封面已载入（base64）。图片 < 1MB 推荐，否则会超 localStorage。"
                                );
                              };
                              reader.readAsDataURL(f);
                            }}
                          />
                        </label>
                      </div>
                      {w.cover && (
                        <div className="mt-2 h-24 w-32 border border-white/10 overflow-hidden bg-black/30">
                          <img
                            src={w.cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </Field>

                    <Field label="图集 / Gallery（多图，弹窗里左右翻）">
                      <div className="flex flex-wrap gap-2">
                        {(w.gallery || []).map((src, gi) => (
                          <div
                            key={gi}
                            className="relative w-20 h-20 border border-white/10 group"
                          >
                            <img
                              src={src}
                              alt=""
                              className="w-full h-full object-cover"
                            />
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
                              if (!files.length) return;
                              const readers = files.map(
                                (f) =>
                                  new Promise<string>((resolve, reject) => {
                                    const r = new FileReader();
                                    r.onload = () => resolve(r.result as string);
                                    r.onerror = reject;
                                    r.readAsDataURL(f);
                                  })
                              );
                              Promise.all(readers).then((urls) => {
                                const next = [...(w.gallery || []), ...urls];
                                updateWork(i, "gallery", next as any);
                              });
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        💡 弹窗里会按顺序轮播，第一张是默认封面；封面图（Cover）可与图集重复。
                      </p>
                    </Field>

                    <Field label="PDF 附件（弹窗里直接预览）">
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
                              if (f.size > 5 * 1024 * 1024) {
                                alert("PDF 超过 5MB，建议放到 public/ 后用 URL 引用。");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateWork(i, "pdf", reader.result as string);
                                alert("PDF 已载入（base64）。大文件请放 public/ 目录。");
                              };
                              reader.readAsDataURL(f);
                            }}
                          />
                        </label>
                      </div>
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

                    <Field label="外链 URL（可选）">
                      <Input
                        value={w.link || ""}
                        onChange={(v) => updateWork(i, "link", v)}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                ))}

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

              <Field label="Section Headline">
                <Input
                  value={draft.works.headline}
                  onChange={(v) => update("works.headline", v)}
                />
              </Field>
            </Card>
          )}

          {tab === "theme" && (
            <>
              <Card title="主题色" icon={Palette}>
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

              <Card title="排版参数" icon={Type}>
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
                <Field label="字号缩放">
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
                <Field label="圆角">
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
              <Card title="PDF 简历" icon={Upload}>
                <Field label="启用 PDF 在线阅读">
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

                <Field label="PDF 文件 URL">
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

                <Field label="文件名（下载时）">
                  <Input
                    value={draft.pdf.filename}
                    onChange={(v) => update("pdf.filename", v)}
                  />
                </Field>

                <Field label="Section Headline">
                  <Input
                    value={draft.pdf.headline}
                    onChange={(v) => update("pdf.headline", v)}
                  />
                </Field>

                <Field label="Section Description">
                  <Textarea
                    value={draft.pdf.description}
                    onChange={(v) => update("pdf.description", v)}
                    rows={3}
                  />
                </Field>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={async () => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "application/pdf";
                      input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          update("pdf.url", dataUrl);
                          alert("PDF 已载入（保存在浏览器本地）。注意：大文件会超过 localStorage 限制，建议放到 public/ 目录。");
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs uppercase tracking-[0.2em] hover:bg-white/90"
                  >
                    <Upload size={14} /> 从本机上传 PDF（转 base64）
                  </button>
                </div>
              </Card>

              <Card title="封面图 / Hero 背景" icon={ImageIcon}>
                <Field label="Hero 背景图 URL">
                  <Input
                    value={draft.hero.backgroundImage}
                    onChange={(v) => update("hero.backgroundImage", v)}
                    placeholder="/cover.jpg 或 https://..."
                  />
                </Field>
                <Field label="Hero 背景视频 URL（可选）">
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
              <Card title="数据管理" icon={Settings}>
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

              <Card title="修改后台密码" icon={Lock}>
                <ChangePasswordForm />
              </Card>

              <Card title="注意事项" icon={AlertTriangle}>
                <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
                  <li>
                    配置真源是腾讯云 CloudBase 数据库：后台保存 → 云函数校验密码写入 →
                    所有访客<b className="text-white">实时收到推送</b>（无需刷新页面、无需重新部署）。
                  </li>
                  <li>
                    <code className="text-white/70">src/data/config.json</code> 仅作为首次初始化
                    与云端不可用时的兜底数据。
                  </li>
                  <li>封面图 / Hero 背景图建议放 <code className="text-white/70">public/</code> 目录（最稳妥），不要用 base64（体积大会拖慢同步）。</li>
                  <li>后台密码以 scrypt 加盐哈希存储在云端，首次访问 /admin 时自行设置，任何人都看不到明文。</li>
                  <li>更安全的方案：Cloudflare Pages → Settings → Access，给 /admin 路径加邮箱验证。</li>
                </ul>
              </Card>
            </>
          )}
        </section>
      </div>
    </main>
  );

  function updateWork(idx: number, key: keyof WorkItem, value: any) {
    const next = [...draft.works.items];
    next[idx] = { ...next[idx], [key]: value };
    update("works.items", next);
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
            Sign in to continue
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
            placeholder="Username"
            autoComplete="username"
            className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
            autoFocus
          />
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full mt-3 px-5 py-4 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
          />
          {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-4 px-5 py-4 bg-white text-black text-xs uppercase tracking-[0.25em] hover:bg-white/90 transition disabled:opacity-60"
          >
            {busy ? "验证中…" : "Login"}
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
      <Field label="当前密码">
        <Input value={cur} onChange={setCur} type="password" />
      </Field>
      <Field label="新密码">
        <Input value={a} onChange={setA} type="password" placeholder="至少 6 位" />
      </Field>
      <Field label="确认新密码">
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
        {busy ? "更新中…" : "更新密码"}
      </button>
      {done && <p className="text-emerald-400 text-xs">✓ 密码已更新（云端生效）</p>}
      {err && <p className="text-rose-400 text-xs">{err}</p>}
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <Icon size={14} className="text-white/60" />
        <h3 className="text-xs uppercase tracking-[0.25em]">{title}</h3>
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
