/**
 * 通用配置服务
 * 获取系统配置信息
 */

import { api } from "@/services/api";

/**
 * 通用配置响应
 */
export interface CommonListResponse {
  status: number;
  msg?: string;
  data?: {
    /** 发送短信时必须携带的 mk 参数 */
    msfntk?: string;
    /** 是否开启图形验证码（1=开启） */
    is_captcha?: number;
    /** 短信登录是否需要图形验证码（1=需要） */
    allow_login_code_captcha?: number;
  };
}

/**
 * 获取通用配置（包含 mk 令牌）
 * @returns 配置信息
 */
export async function getCommonList(): Promise<CommonListResponse> {
  return api.get<CommonListResponse>("/common_list");
}
