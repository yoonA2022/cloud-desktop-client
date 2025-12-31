/**
 * 应用主组件
 * 管理应用的整体状态和路由逻辑，包括登录状态检查
 */

import { useState, useEffect } from "react"
import { LoginPage } from "@/login/login-page"
import { HomePage } from "@/home/home-page"
import { LoadingScreen } from "@/components/loading/loading-screen"
import { checkAuthStatus } from "@/services/auth"
import { hasToken } from "@/lib/storage"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // 如果本地没有 token，直接显示登录页
      if (!hasToken()) {
        setIsChecking(false)
        return
      }

      // 有 token 则验证是否有效
      const isValid = await checkAuthStatus()
      setIsLoggedIn(isValid)
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  // 检查登录状态时显示加载
  if (isChecking) {
    return <LoadingScreen />
  }

  return isLoggedIn ? (
    <HomePage onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
  )
}

export default App