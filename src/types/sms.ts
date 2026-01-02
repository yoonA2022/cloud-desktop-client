/**
 * 发送短信验证码相关类型定义
 */

/**
 * 发送短信验证码请求参数
 */
export interface SendSmsRequest {
  /** 国际手机区号，如 86 */
  phone_code: string;
  /** 手机号 */
  phone: string;
  /** 图形验证码 */
  captcha?: string;
  /** token (从 common_list 接口获取的 msfntk) */
  mk?: string;
}

/**
 * 发送短信验证码响应
 */
export interface SendSmsResponse {
  /** 状态码：200成功，其他失败 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** 其他数据 */
  data?: Record<string, unknown>;
}
