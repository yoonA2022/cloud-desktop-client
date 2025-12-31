/**
 * 云电脑主机服务
 * 提供主机列表获取等功能
 */

import { api } from "@/services/api";
import type { HostListRequest, HostListResponse } from "@/types/host";

/**
 * 获取主机列表
 * @param params - 请求参数
 * @returns 主机列表响应
 */
export async function getHostList(params?: HostListRequest): Promise<HostListResponse> {
  // 构建查询参数
  const queryParams: Record<string, string> = {};

  if (params?.groupid) queryParams.groupid = params.groupid;
  if (params?.dcim_area) queryParams.dcim_area = params.dcim_area;
  if (params?.domain_status) queryParams.domain_status = params.domain_status;
  if (params?.orderby) queryParams.orderby = params.orderby;
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.show_type) queryParams.show_type = params.show_type;

  return api.get<HostListResponse>("/host/list", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
}
