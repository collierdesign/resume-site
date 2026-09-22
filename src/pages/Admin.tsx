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
} from "lucide-react";
import { login, logout, isAuthed, setPassword, getPasswordHint } from "../lib/admin";
import { useConfig, useConfigActions } from "../lib/useConfig";
import { defaultConfig } from "../data/config";
import type { SiteConfig } from "../types";

const THEMES = [
  { id: "dark", label: "Dark", preview: "#0a0a0a" },
  { id: "light", label: "Light", preview: "#f5f5f0" },
  { id: "paper", label: "Paper", preview: "#ede7d8" },
  { id: "mono", label: "Mono", preview: "#000000" },
] as const;

const ACCENTS = [
  { name: "Lime", value: "#c5f82e" },
  { name: "Coral", value: "#ff5e3a" },
  { name: "Amber", value: "#ffb547" },
  { name: "Cyan", value: "#5eead4" },
  { name: "Violet", value: "#a78bfa" },
  { name: "Rose", value: "#fb7185" },
];

export default function Admin() {
  const nav = useNavigate();
  const cfg = useConfig();
  const { setConfig } = useConfigActions();
  const [authed, setAuthed] = useState(isAuthed());
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [tab, setTab] = useState<"profile" | "theme" | "pdf" | "system">("profile");
  const [draft, setDraft] = useState<SiteConfig>(cfg);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDraft(cfg);
  }, [cfg]);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/5 border border-white/10 mb-4">
              <Lock size={20} />
            </div>
            <h1 className="font-display text-3xl mb-2">Admin</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Enter password to continue
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (login(pwd)) {
                setAuthed(true);
                setPwdErr("");
              } else {
                setPwdErr("密码错误");
              }
            }}
          >
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-white/40 outline-none text-sm transition"
              autoFocus
            />
            {pwdErr && (
              <p className="mt-2 text-xs text-rose-400">{pwdErr}</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 px-5 py-4 bg-white text-black text-xs uppercase tracking-[0.25em] hover:bg-white/90 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-white/40">
            默认密码 <code className="text-white/70">admin123</code>
            <br />
            登录后到「系统」里修改
          </p>
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

  const save = () => {
    setConfig(draft);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const reset = () => {
    if (confirm("确认重置为默认示例数据？")) {
      setDraft(defaultConfig);
      setConfig(defaultConfig);
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
            { id: "theme", label: "Theme & Layout", icon: Palette },
            { id: "pdf", label: "PDF Resume", icon: Upload },
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition"
            >
              <Save size={14} /> Save Changes
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
                    <option value="'Playfair Display', serif">Playfair Display（衬线）</option>
                    <option value="'Inter', sans-serif">Inter（无衬线）</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono（等宽）</option>
                    <option value="'Cormorant Garamond', serif">Cormorant Garamond（优雅）</option>
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
                      在首页底部展示 PDF 区块
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
                    <code className="text-white/70">/resume.pdf</code> 即可。
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
                        // 把 PDF 转 base64 存到 localStorage（小文件 OK，大文件会超限）
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
                    <Upload size={14} /> 导入 config.json
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
                  当前数据存于浏览器 localStorage。建议每月导出一次备份，或把导出文件作为
                  <code className="text-white/70"> src/data/config.ts </code> 提交到 GitHub。
                </p>
              </Card>

              <Card title="修改后台密码" icon={Lock}>
                <NewPasswordForm />
              </Card>

              <Card title="注意事项" icon={AlertTriangle}>
                <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
                  <li>本后台的「修改」存于浏览器 localStorage，清缓存会丢失，请定期导出 JSON 备份。</li>
                  <li>PDF / 图片放 <code className="text-white/70">public/</code> 目录是最稳妥的方案。</li>
                  <li>默认密码 <code className="text-white/70">admin123</code>，部署后请立刻修改。</li>
                  <li>如需真正云端管理（多设备同步），需对接 Cloudflare KV 或 D1（后续可扩展）。</li>
                </ul>
              </Card>
            </>
          )}
        </section>
      </div>
    </main>
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

function NewPasswordForm() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-3">
      <Field label="新密码">
        <Input value={a} onChange={setA} type="password" placeholder="至少 6 位" />
      </Field>
      <Field label="确认新密码">
        <Input value={b} onChange={setB} type="password" />
      </Field>
      <button
        onClick={() => {
          if (a.length < 6) return alert("至少 6 位");
          if (a !== b) return alert("两次密码不一致");
          setPassword(a);
          setA("");
          setB("");
          setDone(true);
          setTimeout(() => setDone(false), 3000);
        }}
        className="px-4 py-2 bg-white text-black text-xs uppercase tracking-[0.2em]"
      >
        更新密码
      </button>
      {done && <p className="text-emerald-400 text-xs">✓ 密码已更新</p>}
      <p className="text-xs text-white/40">当前状态：{getPasswordHint()}</p>
    </div>
  );
}