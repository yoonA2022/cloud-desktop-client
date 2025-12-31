/**
 * 手机相关类型定义
 * 定义手机区号等接口的 TypeScript 类型
 */

// 手机区号信息
export interface PhoneCode {
  phone_code: string;
  link: string;
}

// 获取手机区号响应
export interface PhoneCodeResponse {
  status: number;
  msg: string;
  data: PhoneCode[];
  is_aff?: string;
}
