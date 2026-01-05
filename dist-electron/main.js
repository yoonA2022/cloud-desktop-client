import { ipcMain, shell, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(exec);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
ipcMain.handle("open-external", async (_event, url) => {
  if (typeof url !== "string") return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
    await shell.openExternal(parsed.toString());
  } catch {
    return;
  }
});
ipcMain.handle("remote-desktop-connect", async (_event, options) => {
  const { ip, port, username, password } = options;
  if (!ip || !username || !password) {
    return { success: false, error: "缺少必要的连接参数" };
  }
  const server = port && port !== "0" ? `${ip}:${port}` : ip;
  try {
    const cmdkeyCommand = `cmdkey /generic:TERMSRV/${server} /user:${username} /pass:"${password}"`;
    await execAsync(cmdkeyCommand);
    const mstscCommand = `mstsc /v:${server}`;
    exec(mstscCommand);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "连接失败";
    return { success: false, error: errorMessage };
  }
});
ipcMain.handle("remote-desktop-disconnect", async (_event, options) => {
  const { ip, port } = options;
  if (!ip) {
    return { success: false, error: "缺少 IP 地址" };
  }
  const server = port && port !== "0" ? `${ip}:${port}` : ip;
  try {
    try {
      const killCommand = `powershell -Command "Get-Process mstsc -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*${ip}*'} | Stop-Process -Force"`;
      await execAsync(killCommand);
    } catch {
    }
    try {
      const cmdkeyCommand = `cmdkey /delete:TERMSRV/${server}`;
      await execAsync(cmdkeyCommand);
    } catch {
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "断开连接失败";
    return { success: false, error: errorMessage };
  }
});
function createWindow() {
  const iconPath = path.join(process.env.VITE_PUBLIC || "", "icon.png");
  const icon = existsSync(iconPath) ? iconPath : void 0;
  win = new BrowserWindow({
    ...icon && { icon },
    autoHideMenuBar: true,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.setMenuBarVisibility(false);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
