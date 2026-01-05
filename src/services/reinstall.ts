/**
 * 重装系统服务
 * 处理云电脑重装系统相关操作
 */

import { api } from "@/services/api";
import type { ReinstallRequest, ReinstallResponse } from "@/types/reinstall";

/**
 * 重装系统
 * @param params - 重装系统参数
 * @returns 重装系统响应
 */
export async function reinstallSystem(params: ReinstallRequest): Promise<ReinstallResponse> {
  // 确保 id 是数字类型（API 需要数字）
  const hostId = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;
  // 确保 os 也转换为数字
  const osId = typeof params.os === 'string' ? parseInt(params.os, 10) : params.os;

  // 根据主机类型选择不同的 API 路径和参数
  let apiPath: string;
  const requestData: Record<string, string> = {
    id: hostId.toString(),
    os: osId.toString(),
    password: params.password,
  };

  // 根据主机类型构建请求
  if (params.hostType === 'cloud') {
    // Cloud 类型：使用 /provision/default，需要 func 参数
    apiPath = '/provision/default';
    requestData.func = 'reinstall';
    if (params.port !== undefined) {
      requestData.port = params.port.toString();
    }
  } else if (params.hostType === 'dcimcloud') {
    // DCIM Cloud 类型：使用 /dcimcloud/reinstall
    apiPath = '/dcimcloud/reinstall';
    requestData.port = (params.port ?? 3389).toString();
  } else {
    // DCIM 类型：使用 /dcim/reinstall，包含完整参数
    apiPath = '/dcim/reinstall';
    requestData.port = (params.port ?? 3389).toString();
    requestData.action = params.action !== undefined ? params.action.toString() : '0';
    requestData.check_disk_size = params.check_disk_size !== undefined ? params.check_disk_size.toString() : '1';

    // 添加可选参数
    if (params.os_group !== undefined) {
      requestData.os_group = params.os_group.toString();
    }
    if (params.part_type !== undefined) {
      requestData.part_type = params.part_type.toString();
    }
    if (params.disk !== undefined) {
      requestData.disk = params.disk.toString();
    }
    if (params.mcon) {
      requestData.mcon = params.mcon;
    }
    if (params.code) {
      requestData.code = params.code;
    }
  }

  // 使用对应的 API 路径
  const response = await api.postForm<ReinstallResponse>(apiPath, requestData);

  return response;
}
