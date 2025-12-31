/**
 * 云电脑主机详情服务
 * 获取主机详细信息
 */

import { api } from "@/services/api";
import type { HostDetailResponse } from "@/types/host-detail";

/**
 * 获取主机详情
 * @param hostId - 主机ID
 * @returns 主机详情响应
 */
export async function getHostDetail(hostId: string): Promise<HostDetailResponse> {
  return api.get<HostDetailResponse>("/host/dedicatedserver", {
    params: { host_id: hostId },
  });
}
