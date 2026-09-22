# 个人简历网站

> 一个高端、设计感、可管理的个人作品集 / 简历网站。参考 [dillinger.tv](https://www.dillinger.tv/) 的极简风格。

## ✨ 特性

- **极简高级感**：黑白色调、大留白、衬线字体
- **完全响应式**：PC、平板、手机均适配
- **可管理后台**：`/admin` 路由，密码登录，所见即所得编辑
- **4 套主题 + 自定义点缀色**：暗色 / 亮色 / 纸质 / 纯黑
- **排版参数可调**：字号、行距、圆角、字体
- **完整 PDF 在线阅读**：基于 PDF.js，支持缩放
- **动画细腻**：滚动入场、悬停效果、页面过渡

## 🛠 技术栈

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Framer Motion**
- **PDF.js**（完整简历阅读）
- **react-router-dom**（路由）
- **Cloudflare Pages**（部署）

## 📁 项目结构

```
resume-site/
├── public/                  # 静态资源
│   ├── resume.pdf          # ← 把你的简历 PDF 放这里
│   ├── cover.jpg           # ← 首屏背景图
│   └── favicon.svg
├── src/
│   ├── components/         # 页面区块组件
│   │   ├── Nav.tsx         # 顶部导航
│   │   ├── Hero.tsx        # 首屏
│   │   ├── About.tsx       # 关于我
│   │   ├── Experience.tsx  # 经历时间线
│   │   ├── Works.tsx       # 作品集
│   │   ├── Skills.tsx      # 技能
│   │   ├── PdfSection.tsx  # PDF 区域
│   │   ├── Contact.tsx     # 联系
│   │   └── Footer.tsx      # 页脚
│   ├── pages/
│   │   ├── Home.tsx        # 首页（组装所有区块）
│   │   ├── Resume.tsx      # PDF 完整阅读页
│   │   └── Admin.tsx       # 后台编辑器
│   ├── data/
│   │   └── config.ts       # 默认配置数据
│   ├── lib/
│   │   ├── useConfig.ts    # 配置 Hook（含主题、排版）
│   │   └── admin.ts        # 后台鉴权
│   ├── types.ts            # 类型定义
│   ├── index.css           # 全局样式 + 主题变量
│   ├── App.tsx             # 路由
│   └── main.tsx            # 入口
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🚀 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
```

后台地址：`http://localhost:5173/admin`，默认密码 `admin123`。

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

1. 访问 `/admin`，输入密码（默认 `admin123`）
2. 在「Profile」里改你的姓名、邮箱、经历
3. 在「Theme」切换主题、改点缀色、调整排版
4. 在「PDF」填 PDF 文件 URL（推荐放 `public/resume.pdf`，路径写 `/resume.pdf`）
5. 点 "Save Changes" 保存到浏览器
6. 点 "导出 config.json" 定期备份，或把 JSON 内容贴到 `src/data/config.ts` 同步到 GitHub

## 💰 成本

- 域名（.cn）：约 ¥33/年
- Cloudflare Pages：免费
- **总计：¥33/年**

## 📄 License

MIT