/// <reference types="vite/client" />

// Electron IPC Renderer type definition
interface Window {
  ipcRenderer?: {
    on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void
    off(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void
    send(channel: string, ...args: unknown[]): void
    invoke(channel: string, ...args: unknown[]): Promise<unknown>
  }
}