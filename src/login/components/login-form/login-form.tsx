/**
 * 登录表单组件
 * 支持邮箱和手机号登录，包含分步输入和第三方登录选项
 */

import { useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";
import logo from "@/assets/images/logo.png";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  Field,
  FieldSeparator,
} from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailPasswordForm } from "@/login/components/password-form/email-password-form/email-password-form";
import { PhonePasswordForm } from "@/login/components/password-form/phone-password-form/phone-password-form";
import { EmailInput } from "./email-input/email-input";
import { PhoneInput } from "./phone-input/phone-input";
import { loginWithEmail } from "@/services/auth";
import { loginWithPhone } from "@/services/phone-auth";

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
  const [phoneCode, setPhoneCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

      // 检查手机号是否只包含数字
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(phone.trim())) {
        setFormError("手机号只能包含数字");
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

  const handlePasswordSubmit = async (password: string, captcha?: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      if (loginType === "email") {
        const response = await loginWithEmail({
          email,
          password,
        });

        if (response.status === 200) {
          onLoginSuccess();
        } else {
          setLoginError(response.msg || "登录失败，请重试");
        }
      } else {
        // 手机号登录
        const response = await loginWithPhone({
          phone_code: phoneCode,
          phone,
          password,
          captcha,
        });

        if (response.status === 200) {
          onLoginSuccess();
        } else {
          setLoginError(response.msg || "登录失败，请重试");
        }
      }
    } catch {
      setLoginError("网络错误，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  // 密码输入步骤
  if (step === "password") {
    if (loginType === "email") {
      return (
        <EmailPasswordForm
          {...props}
          className={className}
          email={email}
          onBack={handleBack}
          onSubmit={handlePasswordSubmit}
          isLoading={isLoading}
          error={loginError}
        />
      );
    }

    return (
      <PhonePasswordForm
        {...props}
        className={className}
        phoneCode={phoneCode}
        phone={phone}
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
                <img src={logo} alt="豪得云 - 客户端" className="size-6 aspect-square object-contain" />
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
              <EmailInput
                value={email}
                onChange={setEmail}
                hasError={loginType === "email" && !!formError}
              />
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                phoneCode={phoneCode}
                onPhoneCodeChange={setPhoneCode}
                hasError={loginType === "phone" && !!formError}
              />
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
