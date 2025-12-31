/**
 * 登录页面组件
 * 提供完整的登录界面布局，包含主题切换功能
 */

import { LoginForm } from "@/login/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <div className="bg-background relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  )
}

