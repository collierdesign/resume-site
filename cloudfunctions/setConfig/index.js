// 配置写入 + 管理员密码云函数
// action:
//   status  → 是否已初始化密码
//   setup   → 首次设置密码（仅未初始化时）
//   login   → 校验密码
//   change  → 修改密码（需当前密码）
//   save    → 写入站点配置（需密码）
const cloud = require("@cloudbase/node-sdk");
const crypto = require("crypto");

const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();

function hashPwd(pwd, salt) {
  return crypto.scryptSync(String(pwd), salt, 32).toString("hex");
}

async function getAdmin() {
  try {
    const r = await db.collection("settings").doc("admin").get();
    let d = r && r.data;
    if (Array.isArray(d)) d = d[0];
    // 必须是包含 salt + hash 的有效文档才算已初始化
    if (d && typeof d === "object" && d.salt && d.hash) return d;
    return null;
  } catch (e) {
    return null;
  }
}

exports.main = async (event) => {
  const { action, password, newPassword, config } = event || {};

  try {
    if (action === "status") {
      const admin = await getAdmin();
      return { ok: true, initialized: !!admin };
    }

    if (action === "setup") {
      const admin = await getAdmin();
      if (admin) return { ok: false, error: "已初始化，请直接登录" };
      if (!password || String(password).length < 6)
        return { ok: false, error: "密码至少 6 位" };
      const salt = crypto.randomBytes(16).toString("hex");
      await db.collection("settings").doc("admin").set({
        salt,
        hash: hashPwd(password, salt),
        createdAt: Date.now(),
      });
      return { ok: true };
    }

    // —— 以下操作都需要密码 ——
    const admin = await getAdmin();
    if (!admin) return { ok: false, error: "尚未设置密码", needSetup: true };
    if (!password || hashPwd(password, admin.salt) !== admin.hash)
      return { ok: false, error: "密码错误" };

    if (action === "login") return { ok: true };

    if (action === "change") {
      if (!newPassword || String(newPassword).length < 6)
        return { ok: false, error: "新密码至少 6 位" };
      const salt = crypto.randomBytes(16).toString("hex");
      await db.collection("settings").doc("admin").update({
        salt,
        hash: hashPwd(newPassword, salt),
        updatedAt: Date.now(),
      });
      return { ok: true };
    }

    if (action === "save") {
      if (!config || typeof config !== "object")
        return { ok: false, error: "config 数据无效" };
      const updatedAt = Date.now();
      // update 而不是 set：合并字段，保留未来新增的字段不被旧字段覆盖
      await db.collection("config").doc("main").update({
        ...config,
        updatedAt,
      });
      return { ok: true, updatedAt };
    }

    return { ok: false, error: "未知 action: " + action };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
};
