# 个人简历网站

> 一个高端、设计感、可管理的个人作品集 / 简历网站。参考 [dillinger.tv](https://www.dillinger.tv/) 的极简风格。

## ✨ 特性

- **极简高级感**：黑白色调、大留白、衬线字体
- **完全响应式**：PC、平板、手机均适配
- **可管理后台**：`/admin` 路由，密码登录，所见即所得编辑
- **4 套主题 + 自定义点缀色**：暗色 / 亮色 / 纸质 / 纯黑
- **排版参数可调**：字号、行距、圆角、字体
- **作品库管理**：在后台增删改，**无数量限制**
- **PDF 简历**：首页内嵌预览 + `/resume` 全屏阅读器（缩放 / 下载）
- **动画细腻**：滚动入场、悬停效果、页面过渡

## 🛠 技术栈

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS** + **Framer Motion**
- **react-router-dom**（路由）
- **pdfjs-dist**（PDF 渲染）
- **Cloudflare Pages**（部署）

## 📁 项目结构

```
resume-site/
├── public/                  # 静态资源
│   ├── resume.pdf          # ← 简历 PDF（示例文件，替换成你自己的）
│   ├── cover.jpg           # ← 首屏背景图（可选）
│   └── favicon.svg
├── src/
│   ├── components/         # 页面区块组件
│   │   ├── Nav.tsx         # 顶部导航
│   │   ├── Hero.tsx        # 首屏（含液体流淌动效）
│   │   ├── About.tsx       # 关于我
│   │   ├── Experience.tsx  # 经历时间线
│   │   ├── Works.tsx       # 作品集（Bento Grid）
│   │   ├── Skills.tsx      # 技能
│   │   ├── PdfSection.tsx  # 完整简历 PDF 区块
│   │   ├── Contact.tsx     # 联系
│   │   └── Footer.tsx      # 页脚
│   ├── pages/
│   │   ├── Home.tsx        # 首页（组装所有区块）
│   │   ├── Resume.tsx      # /resume 全屏 PDF 阅读器
│   │   └── Admin.tsx       # 后台编辑器
│   ├── data/
│   │   └── config.ts       # 默认配置数据
│   ├── lib/
│   │   ├── useConfig.tsx   # 配置 Hook（含主题、排版）
│   │   ├── admin.ts        # 后台鉴权
│   │   └── reveal.ts       # 滚动入场
│   ├── types.ts            # 类型定义
│   ├── App.tsx             # 路由
│   └── main.tsx            # 入口
├── index.html
├── package.json
└── vite.config.ts
```

## 🚀 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
```

后台地址：`http://localhost:5173/admin`

## 📄 PDF 简历

仓库自带一份示例 `public/resume.pdf`（两页英文示例），**直接替换成你自己的 PDF 即可生效**：

```bash
# 用你自己的简历覆盖示例文件
cp ~/Desktop/my-resume.pdf public/resume.pdf
```

页面上的三个入口：

| 入口 | 位置 | 行为 |
|------|------|------|
| 区块内嵌预览 | 首页 05 · Résumé | iframe 直接预览（桌面端） |
| 全屏阅读器 | 导航「Resume」→ `/resume` | pdfjs 渲染，支持缩放 / 下载 |
| 下载 | 区块与阅读器右上角 | 按 `pdf.filename` 保存 |

想换路径或临时关掉整个区块，去 `/admin` → **PDF & Hero** 修改 `pdf.enabled` / `pdf.url` / `pdf.filename` 等字段（也可以直接改 `src/data/config.ts`）。

> ⚠️ 后台「从本机上传 PDF」会转成 base64 存在浏览器 localStorage 里，**只对你自己可见**，且体积大容易超限。正式发布请把文件放进 `public/` 并部署。

## 🔐 后台安全

**没有默认密码。** 首次访问 `/admin` 时，系统会引导你设置一个 6 位以上的初始密码。

设置后请妥善保管，源码是公开的（GitHub 任何人都能看到），所以这只是"防路人"的薄屏障。

生产环境建议在 Cloudflare 后台开启 **Access** 给 `/admin` 路径加身份验证（详见 DEPLOY.md）。

## 📦 生产构建

```bash
npm run build      # 输出到 dist/
npm run preview    # 本地预览构建结果
```

## 🌐 部署到 Cloudflare Pages

完整步骤见 [DEPLOY.md](./DEPLOY.md)。简单版：

1. 把代码 push 到 GitHub
2. Cloudflare Dashboard → Pages → Connect to Git
3. 选择仓库 → Build command: `npm run build` → Output: `dist`
4. 绑定你的自定义域名

## 📝 后台使用

1. 访问 `/admin`，**首次会让你设置密码**，之后凭密码登录
2. 在「Profile」里改你的姓名、邮箱、经历
3. 在「Theme」切换主题、改点缀色、调整排版
4. 在「Works」管理作品：点击「添加作品」可无限新增，填写封面、标题、年份、描述、链接、PDF 等
5. 在「PDF & Hero」改简历区块的开关、PDF 地址、下载文件名与文案，以及首屏背景
6. 点 "Save Changes" 保存到浏览器
7. 点 "导出 config.json" 定期备份，或把 JSON 内容贴到 `src/data/config.ts` 同步到 GitHub

## 💰 成本

- 域名（.cn）：约 ¥33/年
- Cloudflare Pages：免费
- **总计：¥33/年**

## 📄 License

MIT