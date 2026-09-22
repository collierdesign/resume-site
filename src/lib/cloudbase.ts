/**
 * CloudBase（腾讯云）接入层
 * - 访客端：匿名登录后直接读数据库 config/main，并订阅实时更新
 * - 管理端：通过云函数 setConfig 校验密码后写入
 */
import cloudbase from "@cloudbase/js-sdk";

const FALLBACK_ENV = "lenhe1026-4gpfachbe3c7625b";

export const TCB_ENV: string =
  (import.meta.env?.VITE_TCB_ENV_ID as string) || FALLBACK_ENV;

let app: ReturnType<typeof cloudbase.init> | null = null;
let authReady: Promise<void> | null = null;

export function tcbApp() {
  if (!app) app = cloudbase.init({ env: TCB_ENV });
  return app;
}

/** 确保匿名登录完成（重复调用安全） */
export async function ensureTcbAuth(): Promise<void> {
  if (!authReady) {
    authReady = (async () => {
      const a = tcbApp() as any;
      const auth = a.auth({ persistence: "local" });
      if (auth.hasLoginState && auth.hasLoginState()) return;
      if (auth.anonymousAuthProvider) await auth.anonymousAuthProvider().signIn();
      else if (auth.signInAnonymously) await auth.signInAnonymously();
      else throw new Error("SDK 不支持匿名登录");
    })().catch((e) => {
      authReady = null; // 失败允许重试
      throw e;
    });
  }
  return authReady;
}

function stripMeta<T>(data: any): T | null {
  if (!data || typeof data !== "object") return null;
  const { _id, _openid, updatedAt, ...rest } = data;
  return rest as T;
}

/** 读取云端配置（config 集合 / main 文档） */
export async function fetchCloudConfig<T = unknown>(): Promise<T | null> {
  await ensureTcbAuth();
  const db = (tcbApp() as any).database();
  const r = await db.collection("config").doc("main").get();
  const data = Array.isArray(r?.data) ? r.data[0] : r?.data;
  return stripMeta<T>(data);
}

/**
 * 订阅云端配置实时更新（管理端保存后，所有访客立刻收到推送）。
 * 返回取消订阅函数。
 *
 * 实现细节：CloudBase 的 doc().watch() 推送只携带 {type:'init'|'update'...}，
 * 不带文档数据，因此收到非 init 事件时再主动 fetch 一次。
 */
export function watchCloudConfig<T>(
  onChange: (c: T) => void
): () => void {
  let close: () => void = () => {};
  let closed = false;
  let pending = false;

  async function refetch() {
    if (pending) return;
    pending = true;
    try {
      const c = await fetchCloudConfig<T>();
      if (!closed && c) onChange(c);
    } catch (e) {
      console.warn("[cloudbase] 实时重拉失败", e);
    } finally {
      pending = false;
    }
  }

  ensureTcbAuth()
    .then(() => {
      if (closed) return;
      const db = (tcbApp() as any).database();
      const watcher = db
        .collection("config")
        .doc("main")
        .watch({
          onChange(snap: any) {
            // doc().watch() 推送只含 {type}，需要主动拉一次
            if (!snap || snap.type === "init") return;
            refetch();
          },
          onError(e: any) {
            console.warn("[cloudbase] 实时订阅出错", e);
          },
        });
      close = () => {
        try {
          watcher.close();
        } catch {}
      };
    })
    .catch((e) => console.warn("[cloudbase] 实时订阅不可用", e));

  return () => {
    closed = true;
    close();
  };
}


