/**
 * 重置密码服务
 * 处理云电脑重置密码相关操作
 */

import { api } from "@/services/api";
import type { ResetPasswordRequest, ResetPasswordResponse } from "@/types/reset-password";

/**
 * 重置密码
 * @param params - 重置密码参数
 * @returns 重置密码响应
 */
export async function resetPassword(params: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  // 确保 id 是数字类型
  const hostId = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;

  const requestData: Record<string, string> = {
    id: hostId.toString(),
    password: params.password,
  };

  // 添加可选参数
  if (params.other_user !== undefined) {
    requestData.other_user = params.other_user.toString();
  }
  if (params.user) {
    requestData.user = params.user;
  }
  if (params.action) {
    requestData.action = params.action;
  }

  // 根据主机类型选择 API 路径
  // cloud 类型使用 /provision/default，dcim 类型使用 /dcim/crack_pass
  const apiPath = params.hostType === 'cloud'
    ? '/provision/default'
    : '/dcim/crack_pass';

  // 如果是 cloud 类型，需要添加 func 参数
  if (params.hostType === 'cloud') {
    requestData.func = 'crack_pass';
  }

  // 调用重置密码接口
  const response = await api.postForm<ResetPasswordResponse>(apiPath, requestData);

  return response;
}
