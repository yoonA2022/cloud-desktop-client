/**
 * 验证码相关 API 服务
 */

import { api } from "@/services/api";

/**
 * 获取图形验证码 URL
 * @param name - 验证码名称标识
 * @returns 验证码图片 URL
 */
export function getCaptchaUrl(name: string): string {
  // 添加时间戳避免缓存
  const timestamp = Date.now().toString();
  const url = api.getUrl("/verify", {
    name,
    t: timestamp,
  });

  return url;
}

/**
 * 刷新验证码
 * @param name - 验证码名称标识
 * @returns 新的验证码图片 URL
 */
export function refreshCaptcha(name: string): string {
  return getCaptchaUrl(name);
}

/**
 * 通过 fetch 获取验证码图片（保持 session 一致）
 * @param name - 验证码名称标识
 * @returns 验证码图片的 Data URL
 */
export async function fetchCaptchaImage(name: string): Promise<string> {
  const url = getCaptchaUrl(name);
  const isElectron = typeof window !== 'undefined' && window.electronHttp !== undefined;

  // 在生产环境的 Electron 中使用主进程请求
  if (isElectron && !import.meta.env.DEV) {
    const response = await window.electronHttp!.request({
      url,
      method: "GET",
    });

    if (response.statusCode !== 200) {
      throw new Error(`HTTP error! status: ${response.statusCode}`);
    }

    // response.data 已经是 base64 格式的 data URL
    const dataUrl = response.data as string;

    return dataUrl;
  }

  // 开发环境或浏览器环境使用 fetch
  const response = await fetch(url, {
    method: "GET",
    credentials: "include", // 携带 cookie 保持 session
    mode: "cors", // 允许跨域
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
