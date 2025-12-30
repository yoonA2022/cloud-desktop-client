import { LoginPage } from "@/login/login-page"
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle"

function App() {
  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <LoginPage />
    </>
  )
}

export default App