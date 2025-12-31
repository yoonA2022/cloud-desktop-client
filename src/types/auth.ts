/**
 * 认证相关类型定义
 * 定义登录、用户信息等接口的TypeScript类型
 */

// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
  code?: string;
}

// 登录响应
export interface LoginResponse {
  status: number;
  msg: string;
  jwt?: string;
}

// 用户认证信息
export interface UserCertifi {
  name: string;
  status: number;
  auth_fail: string;
  type: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  phonenumber: string;
  avatar?: string;
  status: number;
  certifi?: UserCertifi;
}

// 用户组信息
export interface ClientGroup {
  group_name: string;
  group_colour: string;
}

// 用户信息响应
export interface UserInfoResponse {
  status: number;
  msg: string;
  user?: UserInfo;
  client_group?: ClientGroup;
}
