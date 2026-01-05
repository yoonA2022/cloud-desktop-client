/**
 * 短信验证码服务
 * 处理短信验证码发送
 */

import { api } from "@/services/api";
import type { SendSmsRequest, SendSmsResponse } from "@/types/sms";

/**
 * 发送登录短信验证码
 * @param data - 发送请求参数
 * @returns 发送响应
 */
export async function sendLoginSms(data: SendSmsRequest): Promise<SendSmsResponse> {
  const formData: Record<string, string> = {
    phone_code: data.phone_code,
    phone: data.phone,
  };

  // 图形验证码作为 captcha 参数传递
  if (data.captcha) {
    formData.captcha = data.captcha;
  }

  // mk token 参数
  if (data.mk) {
    formData.mk = data.mk;
  }

  const response = await api.postForm<SendSmsResponse>("/login_send", formData);
  return response;
}
