import { ipcMain as f, shell as E, app as i, BrowserWindow as h } from "electron";
import { fileURLToPath as g } from "node:url";
import o from "node:path";
import { existsSync as v } from "node:fs";
import { exec as u } from "node:child_process";
import { promisify as P } from "node:util";
const y = P(u), R = o.dirname(g(import.meta.url));
process.env.APP_ROOT = o.join(R, "..");
const a = process.env.VITE_DEV_SERVER_URL, S = o.join(process.env.APP_ROOT, "dist-electron"), _ = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = a ? o.join(process.env.APP_ROOT, "public") : _;
let e;
f.handle("open-external", async (r, n) => {
  if (typeof n == "string")
    try {
      const t = new URL(n);
      if (t.protocol !== "http:" && t.protocol !== "https:") return;
      await E.openExternal(t.toString());
    } catch {
      return;
    }
});
f.handle("remote-desktop-connect", async (r, n) => {
  const { ip: t, port: c, username: p, password: m } = n;
  if (!t || !p || !m)
    return { success: !1, error: "缺少必要的连接参数" };
  const l = c && c !== "0" ? `${t}:${c}` : t;
  try {
    const s = `cmdkey /generic:TERMSRV/${l} /user:${p} /pass:"${m}"`;
    await y(s);
    const d = `mstsc /v:${l}`;
    return u(d), { success: !0 };
  } catch (s) {
    return { success: !1, error: s instanceof Error ? s.message : "连接失败" };
  }
});
function w() {
  const r = o.join(process.env.VITE_PUBLIC || "", "icon.png"), n = v(r) ? r : void 0;
  e = new h({
    ...n && { icon: n },
    autoHideMenuBar: !0,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: o.join(R, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!1), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), a ? e.loadURL(a) : e.loadFile(o.join(_, "index.html"));
}
i.on("window-all-closed", () => {
  process.platform !== "darwin" && (i.quit(), e = null);
});
i.on("activate", () => {
  h.getAllWindows().length === 0 && w();
});
i.whenReady().then(w);
export {
  S as MAIN_DIST,
  _ as RENDERER_DIST,
  a as VITE_DEV_SERVER_URL
};
