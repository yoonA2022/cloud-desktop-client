import { ipcMain as R, shell as H, session as P, net as U, app as S, BrowserWindow as b } from "electron";
import { fileURLToPath as q } from "node:url";
import l from "node:path";
import { existsSync as F } from "node:fs";
import { exec as j } from "node:child_process";
import { promisify as N } from "node:util";
const T = N(j), D = l.dirname(q(import.meta.url));
process.env.APP_ROOT = l.join(D, "..");
const $ = process.env.VITE_DEV_SERVER_URL, Y = l.join(process.env.APP_ROOT, "dist-electron"), W = l.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = $ ? l.join(process.env.APP_ROOT, "public") : W;
let a;
R.handle("open-external", async (p, s) => {
  if (typeof s == "string")
    try {
      const e = new URL(s);
      if (e.protocol !== "http:" && e.protocol !== "https:") return;
      await H.openExternal(e.toString());
    } catch {
      return;
    }
});
R.handle("remote-desktop-connect", async (p, s) => {
  const { ip: e, port: n, username: f, password: t } = s;
  if (!e || !f || !t)
    return { success: !1, error: "缺少必要的连接参数" };
  const y = n && n !== "0" ? `${e}:${n}` : e;
  try {
    const c = `cmdkey /generic:TERMSRV/${y} /user:${f} /pass:"${t}"`;
    await T(c);
    const w = `mstsc /v:${y}`;
    return j(w), { success: !0 };
  } catch (c) {
    return { success: !1, error: c instanceof Error ? c.message : "连接失败" };
  }
});
R.handle("remote-desktop-disconnect", async (p, s) => {
  const { ip: e, port: n } = s;
  if (!e)
    return { success: !1, error: "缺少 IP 地址" };
  const f = n && n !== "0" ? `${e}:${n}` : e;
  try {
    try {
      const t = `powershell -Command "Get-Process mstsc -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*${e}*'} | Stop-Process -Force"`;
      await T(t);
    } catch {
    }
    try {
      const t = `cmdkey /delete:TERMSRV/${f}`;
      await T(t);
    } catch {
    }
    return { success: !0 };
  } catch (t) {
    return { success: !1, error: t instanceof Error ? t.message : "断开连接失败" };
  }
});
R.handle("http-request", async (p, s) => {
  const { url: e, method: n = "GET", headers: f = {}, body: t } = s;
  return new Promise((y, c) => {
    P.defaultSession.cookies.get({ url: e }).then((w) => {
      const u = U.request({
        method: n,
        url: e,
        session: P.defaultSession
      });
      if (Object.entries(f).forEach(([o, i]) => {
        u.setHeader(o, i);
      }), w.length > 0) {
        const o = w.map((i) => `${i.name}=${i.value}`).join("; ");
        u.setHeader("Cookie", o);
      }
      let h = Buffer.alloc(0), k = 0, E = {};
      u.on("response", (o) => {
        k = o.statusCode, E = o.headers;
        const i = E["set-cookie"];
        i && (Array.isArray(i) ? i : [i]).forEach((d) => {
          const C = d.split(";"), [B] = C, [O, V] = B.split("=");
          if (O && V) {
            let _, x, A = "/", I = !1, M = !1;
            C.slice(1).forEach((m) => {
              const g = m.trim().toLowerCase();
              if (g.startsWith("expires=")) {
                const v = m.split("=")[1];
                _ = new Date(v).getTime() / 1e3;
              } else if (g.startsWith("max-age=")) {
                const v = parseInt(m.split("=")[1]);
                _ = Date.now() / 1e3 + v;
              } else g.startsWith("domain=") ? x = m.split("=")[1] : g.startsWith("path=") ? A = m.split("=")[1] : g === "secure" ? I = !0 : g === "httponly" && (M = !0);
            }), P.defaultSession.cookies.set({
              url: e,
              name: O.trim(),
              value: V.trim(),
              domain: x,
              path: A,
              secure: I,
              httpOnly: M,
              expirationDate: _
            }).catch((m) => {
              console.error("Failed to set cookie:", m);
            });
          }
        }), o.on("data", (r) => {
          h = Buffer.concat([h, r]);
        }), o.on("end", () => {
          let r;
          const d = E["content-type"];
          if (typeof d == "string" && d.includes("application/json"))
            try {
              r = JSON.parse(h.toString("utf-8"));
            } catch {
              r = h.toString("utf-8");
            }
          else typeof d == "string" && d.includes("image/") ? r = `data:${d};base64,${h.toString("base64")}` : r = h.toString("utf-8");
          y({
            statusCode: k,
            headers: E,
            data: r
          });
        }), o.on("error", (r) => {
          c(r);
        });
      }), u.on("error", (o) => {
        c(o);
      }), t && u.write(t), u.end();
    }).catch(c);
  });
});
function L() {
  const p = l.join(process.env.VITE_PUBLIC || "", "icon.png"), s = F(p) ? p : void 0;
  a = new b({
    ...s && { icon: s },
    autoHideMenuBar: !0,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: l.join(D, "preload.mjs")
    }
  }), a.setMenuBarVisibility(!1), a.webContents.on("did-finish-load", () => {
    a == null || a.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), $ ? a.loadURL($) : a.loadFile(l.join(W, "index.html"));
}
S.on("window-all-closed", () => {
  process.platform !== "darwin" && (S.quit(), a = null);
});
S.on("activate", () => {
  b.getAllWindows().length === 0 && L();
});
S.whenReady().then(L);
export {
  Y as MAIN_DIST,
  W as RENDERER_DIST,
  $ as VITE_DEV_SERVER_URL
};
