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
  return api.getUrl("/verify", {
    name,
    t: Date.now().toString(),
  });
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
 * 通过 fetch 获取验证码图片（保持session一致）
 * @param name - 验证码名称标识
 * @returns 验证码图片的 Data URL
 */
export async function fetchCaptchaImage(name: string): Promise<string> {
  const url = getCaptchaUrl(name);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include", // 携带cookie保持session
  });

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
