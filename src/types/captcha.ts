/**
 * 验证码相关类型定义
 */

// 验证码响应
export interface CaptchaResponse {
  status: number;
  msg: string;
  data?: {
    captcha?: string; // 验证码图片 base64 或 URL
  };
}
