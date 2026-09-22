// 简单的客户端 admin 认证。
// 无默认密码：首次访问 /admin 时必须自行设置；之后凭密码登录。
// 注意：源码在 GitHub 公开可见，所以这只是"防路人"的薄屏障。
// 生产环境建议叠加 Cloudflare Access（详见 DEPLOY.md）。
const PWD_KEY = "resume_admin_pwd";
const AUTH_KEY = "resume_admin_authed";

/** 是否已设置过密码（即首次设置流程完成） */
export function isInitialized(): boolean {
  if (typeof localStorage === "undefined") return false;
  return !!localStorage.getItem(PWD_KEY);
}

/** 当前是否登录态 */
export function isAuthed(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1";
}

/** 设置初始密码（仅在未初始化时使用） */
export function setupPassword(pwd: string) {
  localStorage.setItem(PWD_KEY, pwd);
  localStorage.setItem(AUTH_KEY, "1");
}

/** 校验密码并登录 */
export function login(pwd: string): boolean {
  const stored = localStorage.getItem(PWD_KEY);
  if (stored && pwd === stored) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

/** 修改密码（需要当前密码校验） */
export function changePassword(currentPwd: string, newPwd: string): boolean {
  const stored = localStorage.getItem(PWD_KEY);
  if (!stored || currentPwd !== stored) return false;
  localStorage.setItem(PWD_KEY, newPwd);
  return true;
}

/** 仅修改密码（已登录状态下） */
export function setPassword(newPwd: string) {
  localStorage.setItem(PWD_KEY, newPwd);
}

export function getPasswordHint(): string {
  return localStorage.getItem(PWD_KEY) ? "已自定义" : "未设置";
}