import { useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";
import logo from "@/assets/images/logo.png";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PasswordForm } from "@/login/password-form";
import { loginWithEmail } from "@/services/auth";

const REGISTER_URL = "https://yun.haodeyun.cn/register";

function openExternal(url: string) {
  if (typeof window !== "undefined" && window.ipcRenderer?.invoke) {
    window.ipcRenderer.invoke("open-external", url);
    return;
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function Link({
  to,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "href"> & {
  to: string;
}) {
  return (
    <a
      {...props}
      href={to}
      onClick={(e) => {
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

type LoginStep = "account" | "password";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onLoginSuccess: () => void
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const [step, setStep] = useState<LoginStep>("account");
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const currentAccount = loginType === "email" ? email : phone;

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginType === "email") {
      if (!email.trim()) {
        setFormError("请输入邮箱");
        return;
      }
      // 邮箱格式检测
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setFormError("请输入有效的邮箱地址");
        return;
      }
    }

    if (loginType === "phone") {
      if (!phone.trim()) {
        setFormError("请输入手机号");
        return;
      }
    }

    setFormError(null);
    setStep("password");
  };

  const handleBack = () => {
    setStep("account");
    setLoginError(null);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (loginType !== "email") {
      setLoginError("暂不支持手机号登录");
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await loginWithEmail({
        email: currentAccount,
        password,
      });

      if (response.status === 200) {
        onLoginSuccess();
      } else {
        setLoginError(response.msg || "登录失败，请重试");
      }
    } catch {
      setLoginError("网络错误，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  // 密码输入步骤
  if (step === "password") {
    return (
      <PasswordForm
        {...props}
        className={className}
        loginType={loginType}
        account={currentAccount}
        onBack={handleBack}
        onSubmit={handlePasswordSubmit}
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  // 账号输入步骤
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form noValidate onSubmit={handleAccountSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <img src={logo} alt="豪得云 - 客户端" className="size-6" />
              </div>
              <span className="sr-only">豪得云 - 客户端</span>
            </a>
            <h1 className="text-xl font-bold">欢迎使用豪得云 - 客户端</h1>
            <FieldDescription>
              还没有账户？
              <Link
                to={REGISTER_URL}
                onClick={(e) => {
                  e.preventDefault();
                  openExternal(REGISTER_URL);
                }}
              >
                立即注册
              </Link>
            </FieldDescription>
          </div>

          <Tabs
            value={loginType}
            onValueChange={(value: string) =>
              setLoginType(value as "email" | "phone")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="cursor-pointer">
                邮箱登录
              </TabsTrigger>
              <TabsTrigger value="phone" className="cursor-pointer">
                手机号登录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <Field>
                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={loginType === "email" && !!formError}
                />
              </Field>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <Field>
                <FieldLabel htmlFor="phone">手机号</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={loginType === "phone" && !!formError}
                />
              </Field>
            </TabsContent>

            <FieldError className="text-center">{formError}</FieldError>
          </Tabs>

          <Field>
            <Button type="submit" className="cursor-pointer">
              继续
            </Button>
          </Field>
          <FieldSeparator>或</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <FaApple className="size-4" />
              使用 Apple 登录
            </Button>
            <Button variant="outline" type="button">
              <FaGoogle className="size-4" />
              使用 Google 登录
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        点击继续即表示您同意我们的 <a href="#">服务条款</a> 和{" "}
        <a href="#">隐私政策</a>。
      </FieldDescription>
    </div>
  );
}
