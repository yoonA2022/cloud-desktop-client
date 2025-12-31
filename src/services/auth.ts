/**
 * 认证服务
 * 处理用户登录、登出和认证状态检查
 */

import { api } from "@/services/api";
import { setToken, removeToken } from "@/lib/storage";
import type { LoginRequest, LoginResponse, UserInfoResponse } from "@/types/auth";

// 邮箱+密码登录
export async function loginWithEmail(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/login_pass_email", data);

  if (response.status === 200 && response.jwt) {
    setToken(response.jwt);
  }

  return response;
}

// 获取用户信息（也用于检查登录状态）
export async function getUserInfo(): Promise<UserInfoResponse> {
  return api.get<UserInfoResponse>("/user_info");
}

// 检查是否已登录
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await getUserInfo();
    return response.status === 200;
  } catch {
    return false;
  }
}

// 登出
export function logout(): void {
  removeToken();
}
