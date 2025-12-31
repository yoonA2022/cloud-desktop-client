/**
 * 手机相关 API 服务
 * 提供手机区号获取等功能
 */

import { api } from "@/services/api";
import type { PhoneCodeResponse } from "@/types/phone";

/**
 * 获取国际手机区号列表
 */
export async function getPhoneCodes(): Promise<PhoneCodeResponse> {
  return api.get<PhoneCodeResponse>("/mobile_login_page");
}
