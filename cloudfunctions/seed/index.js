// 一次性初始化函数：建集合 + 把默认配置写入 config/main；action=diag 时输出诊断信息
const cloud = require("@cloudbase/node-sdk");
const config = require("./config.json");

const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();

exports.main = async (event) => {
  if (event && event.action === "diag") {
    const out = {};
    try {
      const r = await db.collection("settings").doc("admin").get();
      out.rawGetType = typeof (r && r.data);
      out.rawIsArray = Array.isArray(r && r.data);
      out.raw = JSON.stringify(r && r.data).slice(0, 500);
    } catch (e) {
      out.getErr = String((e && e.message) || e);
    }
    try {
      const all = await db.collection("settings").limit(10).get();
      out.docsCount = (all.data || []).length;
      out.docs = (all.data || []).map((d) => ({
        _id: d._id,
        keys: Object.keys(d),
        saltLen: d.salt ? String(d.salt).length : 0,
      }));
    } catch (e) {
      out.listErr = String((e && e.message) || e);
    }
    try {
      const cfg = await db.collection("config").doc("main").get();
      let cd = cfg && cfg.data;
      if (Array.isArray(cd)) cd = cd[0];
      out.configKeys = cd ? Object.keys(cd).slice(0, 8) : null;
      out.configHero = cd && cd.hero ? JSON.stringify(cd.hero).slice(0, 200) : null;
    } catch (e) {
      out.cfgErr = String((e && e.message) || e);
    }
    return out;
  }

  const results = {};

  try {
    await db.createCollection("config");
    results.createConfig = "created";
  } catch (e) {
    results.createConfig = String(e.message || e);
  }

  try {
    await db.createCollection("settings");
    results.createSettings = "created";
  } catch (e) {
    results.createSettings = String(e.message || e);
  }

  try {
    await db.collection("config").doc("main").set(config);
    results.seed = "ok";
    results.count = (config && Object.keys(config).length) || 0;
  } catch (e) {
    results.seed = String(e.message || e);
  }

  // action=cleanup：删除测试用的 admin 密码文档，恢复「首次设置」状态
  if (event && event.action === "cleanup") {
    try {
      await db.collection("settings").doc("admin").delete();
      results.cleanup = "ok";
    } catch (e) {
      results.cleanup = String(e.message || e);
    }
  }

  return results;
};
