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
    // 关键：V2 SDK 凭据错误时可能不抛异常（仅 console warning），
    // 必须验证当前会话是否真的是非匿名管理员，否则会被静默放行。
    const u = auth().currentUser;
    if (!u || u.isAnonymous) {
      return { ok: false, error: "用户名或密码错误" };
    }
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
    // 保存前强制校验管理员会话，避免匿名态被静默写入失败后只报模糊的"保存失败"
    const u = auth().currentUser;
    if (!u || u.isAnonymous) {
      return { ok: false, error: "登录已失效，请重新登录后再保存" };
    }
    const db = (tcbApp() as any).database();
    await db.collection("config").doc("main").set(config);
    return { ok: true };
  } catch (e: any) {
    const code = e?.code ? ` [${e.code}]` : "";
    return { ok: false, error: (e?.message || "保存失败") + code };
  }
}