# Cloudflare Pages 部署指南（精确到每一步）

> 总耗时：约 **30 分钟**（其中大部分是等 DNS 生效）
> 费用：**¥0**（Cloudflare Pages 免费 + 自带 HTTPS）
> 最终结果：你的 `starle1997.cn` 在国内外都能稳定访问

---

## 📋 整体流程（一张图）

```
1. 代码 → 推到 GitHub（5 分钟）
2. Cloudflare → 创建 Pages 项目（5 分钟）
3. Cloudflare → 添加自定义域名 starle1997.cn（3 分钟）
4. 腾讯云 → 修改 NS 服务器指向 Cloudflare（10 分钟）
5. 等待 DNS 生效 + SSL 自动签发（10-30 分钟）
6. 测试访问 → 完成 ✅
```

---

## Step 1：把代码推到 GitHub

### 1.1 在 GitHub 创建空仓库

1. 打开 <https://github.com/new>
2. **Repository name**：`resume-site`
3. **Public / Private**：选 **Public**（Cloudflare Pages 免费版可以访问 public 仓库）
5. **不要**勾选 "Add a README" / "Add .gitignore"
6. 点 **Create repository**

### 1.2 在本地推送代码

我已经在本地帮你写好了所有代码。在项目根目录 `resume-site/` 下执行：

```bash
cd resume-site
git init
git add .
git commit -m "init: resume site"
git branch -M main
git remote add origin https://github.com/你的用户名/resume-site.git
git push -u origin main
```

> 💡 如果你的 GitHub 用户名不是默认显示的，请告诉我，我会帮你生成正确的命令。

---

## Step 2：在 Cloudflare 创建 Pages 项目

### 2.1 登录 Cloudflare

打开 <https://dash.cloudflare.com/>，用你注册的账号登录。

### 2.2 创建 Pages 项目

1. 左侧菜单 → **Workers & Pages** → 点 **Create application**
2. 选择 **Pages** 标签 → 点 **Connect to Git**
3. 选择 **GitHub** → 点 **Connect GitHub account**
4. 授权 Cloudflare 访问你的 GitHub（弹窗里点 Authorize）
5. 选择 `resume-site` 仓库 → 点 **Begin setup**

### 6. 配置构建设置

| 配置项 | 值 |
|--------|----|
| Project name | `resume-site`（会自动变成 `resume-site.pages.dev`） |
| Production branch | `main` |
| Framework preset | **Vite**（自动识别） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | （留空） |
| Environment variables | 不用填 |

7. 点 **Save and Deploy**

### 2.3 等待首次部署

Cloudflare 会：
1. 克隆你的代码（约 30 秒）
2. 安装依赖（约 1-2 分钟）
3. 构建项目（约 30 秒）
4. 部署到全球 CDN（约 10 秒）

部署完成后你会看到一个绿色 ✓ 和一个临时域名，类似：
```
https://resume-site.pages.dev
```

**立即点开测试** —— 现在 `resume-site.pages.dev` 已经可以访问了。

---

## Step 3：添加自定义域名 `starle1997.cn`

### 3.1 进入项目设置

1. Cloudflare Dashboard → **Workers & Pages** → 点 `resume-site`
2. 点顶部 **Custom domains** 标签
3. 点 **Set up a custom domain**
4. 输入：`starle1997.cn`
5. 点 **Continue**

### 3.2 Cloudflare 会提示

它会告诉你：

```
To add this domain, please:
1. Add an A record pointing xxx.xxx.xxx.xxx to your domain
2. OR change your nameservers to: 
   anna.ns.cloudflare.com
   bob.ns.cloudflare.com
```

**记下这两个 NS 服务器地址**（截图或复制）。

---

## Step 4：修改腾讯云的 NS 服务器

### 4.1 进入域名管理后台

1. 打开腾讯云控制台 → <https://console.cloud.tencent.com/>
2. 顶部搜索框输入 `域名` → 进入 **域名注册**
3. 找到 `starle1997.cn` → 点右边的 **管理**
4. 左侧菜单 **DNS 解析** → 顶部 **DNS 服务器** 标签
5. 点 **修改 DNS 服务器**

### 4.2 替换为 Cloudflare 的 NS

把原来的两个 NS 替换为 Cloudflare 提供的（你刚记下的那两个），形如：

```
原：ns3.dnsv.net.cn         →  anna.ns.cloudflare.com
原：ns4.dnsv.net.cn         →  bob.ns.cloudflare.com
```

填好后点 **确认修改**。

> ⚠️ 腾讯云会弹一个提示："修改 NS 后该域名将不在腾讯云解析，需去新 DNS 服务商处配置"
> 选 **我已知晓，继续修改**。

---

## Step 5：回到 Cloudflare 完成域名绑定

### 5.1 等待 NS 切换生效

NS 修改后通常 **10-30 分钟** 生效（最坏 24 小时）。你可以在 Cloudflare 域名页面看到状态：

- 🟡 **Pending**：还在等待
- 🟢 **Active**：已生效

生效后 Cloudflare 会自动：
- 为 `starle1997.cn` 签发 SSL 证书（约 5 分钟）
- 自动启用 HTTPS

### 5.2 验证

在 Cloudflare Pages → Custom domains 里，你的域名状态应该变成 ✅ Active。

打开浏览器访问：
- `https://starle1997.cn` ✅
- `https://www.starle1997.cn` ✅

应该都能看到你的简历网站了！

---

## Step 6：国内访问加速（可选但强烈推荐）

Cloudflare 在国内访问速度大约 1-3 秒（取决于网络）。如果想要国内秒开（< 1 秒），可以：

### 方案 A：Cloudflare 中国大陆友好节点（免费）

1. Cloudflare Dashboard → 你的域名 → **Speed** → **Optimization**
2. 开启 **Early Hints** 和 **HTTP/3**
3. **Network** 标签 → 开启 **HTTP/2 to Origin** 和 **0-RTT**

### 方案 B：用腾讯云 EdgeOne 做国内 CDN（推荐）

1. 注册腾讯云账号（已有则跳过）→ 开通 **EdgeOne**
2. 添加站点 `starle1997.cn`
3. 选择 **仅中国 / 全球加速** 套餐（有免费版）
4. EdgeOne 会自动配 CNAME 和 HTTPS
5. 在 Cloudflare 设置中保留 NS，EdgeOne 通过 CNAME 接入（不影响 Cloudflare 的国外节点）

> 简单起见，先不上 EdgeOne，等你的网站跑通后再说。

---

## 🎯 部署完成后

| 检查项 | 怎么做 |
|--------|--------|
| ✅ PC 访问 | 浏览器打开 `https://starle1997.cn`，全屏看效果 |
| ✅ 手机访问 | 用手机 4G/5G 打开，测试响应式布局 |
| ✅ PDF 阅读 | 点导航 "Resume"，确认 PDF 能加载 |
| ✅ 后台登录 | 打开 `/admin`，默认密码 `admin123` |
| ✅ 国内访问 | 用手机数据流量（不是 WiFi）测试速度 |
| ✅ 速度评分 | 打开 <https://pagespeed.web.dev/> 输入你的域名测速 |

---

## 🆘 出问题了怎么办？

### 问题 1：Cloudflare 部署失败
- 看 build log，把报错截图发给我
- 99% 是依赖装不上，重试即可

### 问题 2：NS 修改了但域名没生效
- 等更长时间（最长 24 小时）
- 检查 <https://dnschecker.org/> 输入 `starle1997.cn`，看 NS 是否已指向 Cloudflare

### 问题 3：访问域名显示「连接不安全」
- Cloudflare 还没签发 SSL 证书，等 5-10 分钟
- 或在 Cloudflare → SSL/TLS → 把模式改成 **Full**

### 问题 4：想换回腾讯云 DNS
- 同样路径改回原来的 NS（`ns3.dnsv.net.cn` 和 `ns4.dnsv.net.cn`）即可，5 分钟生效
- 不影响 GitHub 仓库和 Cloudflare Pages 项目

---

## 📋 你需要做的（汇总清单）

[ ] **5 分钟**：注册 Cloudflare 账号（已完成？）
[ ] **5 分钟**：GitHub 创建空仓库 `resume-site`
[ ] **5 分钟**：把本地代码 push 到 GitHub（我会帮你写命令）
[ ] **5 分钟**：Cloudflare 连接 GitHub → 一键部署
[ ] **5 分钟**：Cloudflare 添加 `starle1997.cn` 自定义域
[ ] **5 分钟**：腾讯云改 NS 服务器为 Cloudflare
[ ] **等待**：30 分钟左右让 DNS + SSL 生效
[ ] ✅ 测试访问

**现在开始第一步吧** —— 你先在 GitHub 创建仓库，然后告诉我你的 GitHub 用户名，我来生成推送命令。