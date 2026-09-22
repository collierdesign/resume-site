// 简单的客户端 admin 认证（生产环境请配合 Cloudflare Access 或后端）
// 默认密码：admin / admin123  —— 部署后请立即在 admin 页修改
const AUTH_KEY = "resume_admin_authed";

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === "1";
}
export function login(pwd: string): boolean {
  // 默认密码 = admin123；你可以改成自己的（在 Admin 页"修改密码"卡片）
  const stored = localStorage.getItem("resume_admin_pwd") || "admin123";
  if (pwd === stored) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
export function setPassword(newPwd: string) {
  localStorage.setItem("resume_admin_pwd", newPwd);
}
export function getPasswordHint(): string {
  return localStorage.getItem("resume_admin_pwd") ? "已自定义" : "默认 admin123";
}