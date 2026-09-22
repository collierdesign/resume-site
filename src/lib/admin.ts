/**
 * 管理员认证 —— CloudBase Auth 用户名密码登录。
 * - 账号（siteadmin）已在控制台预创建；访客只读，登录后直连数据库写入。
 * - "已登录" = 当前会话为非匿名登录（auth.currentUser && !isAnonymous）。
 */
import { tcbApp, ensureTcbAuth } from "./cloudbase";

export const ADMIN_USER = "siteadmin";

type FnResult = { ok: boolean; error?: string };

function auth() {
  return (tcbApp() as any).auth({ persistence: "local" });
}

/** 当前是否已登录管理员（非匿名会话） */
export function isAuthed(): boolean {
  const u = auth().currentUser;
  return !!u && !u.isAnonymous;
}

/**
 * 用用户名 + 密码登录。
 * 兼容中文 SDK 错误消息。
 */
export async function login(
  username: string,
  password: string
): Promise<FnResult> {
  if (!username || !password) {
    return { ok: false, error: "请填写用户名与密码" };
  }
  try {
    // 先登出，清掉可能的匿名会话，避免 "已登录" 错误
    await auth().signOut().catch(() => {});
    await auth().signInWithPassword({ username, password });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "登录失败" };
  }
}

/** 退出登录 */
export function logout() {
  auth().signOut().catch(() => {});
}

/**
 * 修改密码 —— SDK 签名 updatePassword(newPassword, oldPassword)。
 * UI 上需要用户提供当前密码作为身份验证。
 */
export async function changePassword(
  currentPwd: string,
  newPwd: string
): Promise<FnResult> {
  try {
    const u = auth().currentUser;
    if (!u || u.isAnonymous) {
      return { ok: false, error: "请先登录" };
    }
    await u.updatePassword(newPwd, currentPwd);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "修改失败" };
  }
}

/** 直接写数据库 —— 需已登录管理员（auth.uid == ADMIN_UID，由安全规则强制） */
export async function cloudSaveConfig(config: unknown): Promise<FnResult> {
  try {
    await ensureTcbAuth();
    const db = (tcbApp() as any).database();
    await db.collection("config").doc("main").set(config);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "保存失败" };
  }
}