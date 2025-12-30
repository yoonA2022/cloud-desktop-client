import { ipcMain as d, shell as m, app as t, BrowserWindow as a } from "electron";
import { fileURLToPath as h } from "node:url";
import n from "node:path";
import { existsSync as R } from "node:fs";
const c = n.dirname(h(import.meta.url));
process.env.APP_ROOT = n.join(c, "..");
const s = process.env.VITE_DEV_SERVER_URL, P = n.join(process.env.APP_ROOT, "dist-electron"), p = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? n.join(process.env.APP_ROOT, "public") : p;
let e;
d.handle("open-external", async (i, o) => {
  if (typeof o == "string")
    try {
      const r = new URL(o);
      if (r.protocol !== "http:" && r.protocol !== "https:") return;
      await m.openExternal(r.toString());
    } catch {
      return;
    }
});
function l() {
  const i = n.join(process.env.VITE_PUBLIC || "", "icon.png"), o = R(i) ? i : void 0;
  e = new a({
    ...o && { icon: o },
    autoHideMenuBar: !0,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: n.join(c, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!1), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), s ? e.loadURL(s) : e.loadFile(n.join(p, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  a.getAllWindows().length === 0 && l();
});
t.whenReady().then(l);
export {
  P as MAIN_DIST,
  p as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
