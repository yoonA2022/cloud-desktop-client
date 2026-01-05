/**
 * 重置密码相关类型定义
 */

/**
 * 主机类型
 */
export type HostType = 'cloud' | 'dcim' | 'dcimcloud';

/**
 * 重置密码请求参数
 */
export interface ResetPasswordRequest {
  /** 服务器的 host ID */
  id: string | number;
  /** 主机类型（决定使用哪个 API 路径） */
  hostType?: HostType;
  /** 要设置的新密码 */
  password: string;
  /** 是否重置其他用户(0:不是, 1:是) */
  other_user?: number;
  /** 自定义需要重置的用户名(不能包含中文、空格、@符) */
  user?: string;
  /** 获取进度有crackPwd时选择用户后传chooseUser */
  action?: string;
}

/**
 * 重置密码响应
 */
export interface ResetPasswordResponse {
  /** 状态码: 200/201/203/204成功, 400/401/406失败 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** 响应数据 */
  data?: unknown;
}
