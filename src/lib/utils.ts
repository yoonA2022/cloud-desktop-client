/**
 * 工具函数库
 * 提供通用的工具函数，如CSS类名合并等
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
