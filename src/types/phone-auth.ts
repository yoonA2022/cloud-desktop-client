/**
 * 手机号登录相关类型定义
 */

/**
 * 手机号+密码登录请求参数
 */
export interface PhoneLoginRequest {
  /** 国际手机区号，如 86 */
  phone_code: string;
  /** 手机号 */
  phone: string;
  /** 密码 */
  password: string;
  /** 图形验证码 */
  captcha?: string;
}

/**
 * 手机号登录响应
 */
export interface PhoneLoginResponse {
  /** 状态码：200成功，其他失败 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** JWT令牌（登录成功时返回） */
  jwt?: string;
  /** 其他数据 */
  data?: Record<string, unknown>;
}
