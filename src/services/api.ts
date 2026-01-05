/**
 * API服务工具
 * 提供统一的HTTP请求封装，包含认证和错误处理
 */

import { getToken } from "@/lib/storage";

// 开发环境使用代理路径，生产环境使用完整URL
const API_BASE_URL = import.meta.env.DEV ? "/api" : "https://yun.haodeyun.cn";

// 检测是否在 Electron 环境中
const isElectron = typeof window !== 'undefined' && window.electronHttp !== undefined;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = getToken();
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 合并自定义 headers
  const finalHeaders = { ...defaultHeaders };
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        finalHeaders[key] = value;
      }
    });
  }

  // 在生产环境的 Electron 中使用主进程请求
  if (isElectron && !import.meta.env.DEV) {
    const response = await window.electronHttp!.request({
      url,
      method: rest.method as string || "GET",
      headers: finalHeaders,
      body: rest.body as string,
    });

    return response.data as T;
  }

  // 开发环境或浏览器环境使用 fetch
  const response = await fetch(url, {
    ...rest,
    credentials: "include", // 携带cookie保持session
    mode: "cors", // 允许跨域
    headers: finalHeaders,
  });

  const data = await response.json();

  return data as T;
}

export const api = {
  /**
   * 获取完整的 API URL
   */
  getUrl(endpoint: string, params?: Record<string, string>): string {
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return url;
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * 发送表单数据（application/x-www-form-urlencoded）
   */
  postForm<T>(endpoint: string, body?: Record<string, string>, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options?.headers,
      },
      body: body ? new URLSearchParams(body).toString() : undefined,
    });
  },
};
