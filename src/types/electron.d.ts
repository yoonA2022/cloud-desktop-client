/**
 * Electron API 类型定义
 */

export interface ElectronHttpResponse {
  statusCode: number
  headers: Record<string, string | string[]>
  data: unknown
}

export interface ElectronHttpRequest {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
}

declare global {
  interface Window {
    electronHttp?: {
      request: (options: ElectronHttpRequest) => Promise<ElectronHttpResponse>
    }
  }
}
