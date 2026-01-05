import { app, BrowserWindow, ipcMain, shell, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { net } from 'electron'

const execAsync = promisify(exec)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

ipcMain.handle('open-external', async (_event, url: string) => {
  if (typeof url !== 'string') return

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
    await shell.openExternal(parsed.toString())
  } catch {
    return
  }
})

/**
 * 远程桌面连接 IPC handler
 * 使用 Windows cmdkey 保存凭据，然后调用 mstsc 连接
 */
ipcMain.handle('remote-desktop-connect', async (_event, options: {
  ip: string
  port?: string
  username: string
  password: string
}) => {
  const { ip, port, username, password } = options

  // 验证参数
  if (!ip || !username || !password) {
    return { success: false, error: '缺少必要的连接参数' }
  }

  // 构建服务器地址（如果有端口则添加端口）
  const server = port && port !== '0' ? `${ip}:${port}` : ip

  try {
    // 使用 cmdkey 保存凭据
    // /generic: 指定通用凭据
    // TERMSRV/ 是远程桌面服务的前缀
    const cmdkeyCommand = `cmdkey /generic:TERMSRV/${server} /user:${username} /pass:"${password}"`
    await execAsync(cmdkeyCommand)

    // 启动远程桌面连接
    const mstscCommand = `mstsc /v:${server}`
    exec(mstscCommand)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '连接失败'
    return { success: false, error: errorMessage }
  }
})

/**
 * 断开远程桌面连接 IPC handler
 * 删除保存的凭据并关闭远程桌面窗口
 */
ipcMain.handle('remote-desktop-disconnect', async (_event, options: {
  ip: string
  port?: string
}) => {
  const { ip, port } = options

  // 验证参数
  if (!ip) {
    return { success: false, error: '缺少 IP 地址' }
  }

  // 构建服务器地址（如果有端口则添加端口）
  const server = port && port !== '0' ? `${ip}:${port}` : ip

  try {
    // 1. 查找并关闭连接到指定服务器的远程桌面窗口
    // 使用 tasklist 查找 mstsc.exe 进程，然后使用 taskkill 关闭
    // 注意：这会关闭所有 mstsc.exe 进程，如果有多个远程桌面连接，都会被关闭
    // 更精确的方法需要使用 Windows API 来查找特定窗口标题
    try {
      // 尝试通过窗口标题查找并关闭（窗口标题通常包含 IP 地址）
      const killCommand = `powershell -Command "Get-Process mstsc -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*${ip}*'} | Stop-Process -Force"`
      await execAsync(killCommand)
    } catch {
      // 如果上面的命令失败，忽略错误继续执行
    }

    // 2. 使用 cmdkey 删除保存的凭据
    try {
      const cmdkeyCommand = `cmdkey /delete:TERMSRV/${server}`
      await execAsync(cmdkeyCommand)
    } catch {
      // 如果凭据不存在，忽略错误
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '断开连接失败'
    return { success: false, error: errorMessage }
  }
})

/**
 * HTTP 请求 IPC handler
 * 通过主进程发送 HTTP 请求，自动处理 Cookie
 */
ipcMain.handle('http-request', async (_event, options: {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
}) => {
  const { url, method = 'GET', headers = {}, body } = options

  return new Promise((resolve, reject) => {
    // 从 session 中获取 Cookie
    session.defaultSession.cookies.get({ url })
      .then(cookies => {
        const request = net.request({
          method,
          url,
          session: session.defaultSession,
        })

        // 设置请求头
        Object.entries(headers).forEach(([key, value]) => {
          request.setHeader(key, value)
        })

        // 手动设置 Cookie 头
        if (cookies.length > 0) {
          const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
          request.setHeader('Cookie', cookieHeader)
        }

        // 收集响应数据
        let responseData = Buffer.alloc(0)
        let statusCode = 0
        let responseHeaders: Record<string, string | string[]> = {}

        request.on('response', (response) => {
          statusCode = response.statusCode
          responseHeaders = response.headers

          // 保存响应中的 Cookie
          const setCookieHeaders = responseHeaders['set-cookie']
          if (setCookieHeaders) {
            const cookieStrings = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
            cookieStrings.forEach(cookieString => {
              // 解析 Cookie 字符串
              const parts = cookieString.split(';')
              const [nameValue] = parts
              const [name, value] = nameValue.split('=')

              if (name && value) {
                // 提取 Cookie 属性
                let expirationDate: number | undefined
                let domain: string | undefined
                let path = '/'
                let secure = false
                let httpOnly = false

                parts.slice(1).forEach(part => {
                  const trimmed = part.trim().toLowerCase()
                  if (trimmed.startsWith('expires=')) {
                    const dateStr = part.split('=')[1]
                    expirationDate = new Date(dateStr).getTime() / 1000
                  } else if (trimmed.startsWith('max-age=')) {
                    const maxAge = parseInt(part.split('=')[1])
                    expirationDate = Date.now() / 1000 + maxAge
                  } else if (trimmed.startsWith('domain=')) {
                    domain = part.split('=')[1]
                  } else if (trimmed.startsWith('path=')) {
                    path = part.split('=')[1]
                  } else if (trimmed === 'secure') {
                    secure = true
                  } else if (trimmed === 'httponly') {
                    httpOnly = true
                  }
                })

                // 保存 Cookie
                session.defaultSession.cookies.set({
                  url,
                  name: name.trim(),
                  value: value.trim(),
                  domain,
                  path,
                  secure,
                  httpOnly,
                  expirationDate,
                }).catch(err => {
                  console.error('Failed to set cookie:', err)
                })
              }
            })
          }

          response.on('data', (chunk) => {
            responseData = Buffer.concat([responseData, chunk])
          })

          response.on('end', () => {
            // 尝试解析为 JSON，如果失败则返回原始数据
            let data: unknown
            const contentType = responseHeaders['content-type']

            if (typeof contentType === 'string' && contentType.includes('application/json')) {
              try {
                data = JSON.parse(responseData.toString('utf-8'))
              } catch {
                data = responseData.toString('utf-8')
              }
            } else if (typeof contentType === 'string' && contentType.includes('image/')) {
              // 图片数据返回 base64
              data = `data:${contentType};base64,${responseData.toString('base64')}`
            } else {
              data = responseData.toString('utf-8')
            }

            resolve({
              statusCode,
              headers: responseHeaders,
              data,
            })
          })

          response.on('error', (error: Error) => {
            reject(error)
          })
        })

        request.on('error', (error: Error) => {
          reject(error)
        })

        // 发送请求体
        if (body) {
          request.write(body)
        }

        request.end()
      })
      .catch(reject)
  })
})

function createWindow() {
  // 统一使用 icon.png 作为所有平台的图标
  const iconPath = path.join(process.env.VITE_PUBLIC || '', 'icon.png')
  const icon = existsSync(iconPath) ? iconPath : undefined

  win = new BrowserWindow({
    ...(icon && { icon }),
    autoHideMenuBar: true,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // 隐藏菜单栏
  win.setMenuBarVisibility(false)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
