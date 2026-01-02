/**
 * 手机号认证服务
 * 处理手机号+密码登录和手机号+验证码登录
 */

import { api } from "@/services/api";
import { setToken } from "@/lib/storage";
import type { PhoneLoginRequest, PhoneLoginResponse, PhoneSmsLoginRequest } from "@/types/phone-auth";

/**
 * 手机号+密码登录
 * @param data - 登录请求参数
 * @returns 登录响应
 */
export async function loginWithPhone(data: PhoneLoginRequest): Promise<PhoneLoginResponse> {
  // 构建表单参数（过滤undefined值）
  const formData: Record<string, string> = {
    phone_code: data.phone_code,
    phone: data.phone,
    password: data.password,
  };

  if (data.captcha) {
    formData.captcha = data.captcha;
  }

  const response = await api.postForm<PhoneLoginResponse>("/login_pass_phone", formData);

  // 登录成功时保存 JWT
  if (response.status === 200 && response.jwt) {
    setToken(response.jwt);
  }

  return response;
}

/**
 * 手机号+验证码登录
 * @param data - 登录请求参数
 * @returns 登录响应
 */
export async function loginWithPhoneSms(data: PhoneSmsLoginRequest): Promise<PhoneLoginResponse> {
  const formData: Record<string, string> = {
    phone_code: data.phone_code,
    phone: data.phone,
    code: data.code,
  };

  const response = await api.postForm<PhoneLoginResponse>("/mobile_login", formData);

  // 登录成功时保存 JWT
  if (response.status === 200 && response.jwt) {
    setToken(response.jwt);
  }

  return response;
}
