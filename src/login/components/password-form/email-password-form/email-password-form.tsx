/**
 * 邮箱密码表单组件
 * 处理邮箱登录的密码输入和提交
 */

import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import logo from "@/assets/images/logo.png";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

import { EmailPasswordInput } from "./components/email-password-input";

const PASSWORD_RESET_URL = "https://yun.haodeyun.cn/pwreset";

function openExternal(url: string) {
  if (typeof window !== "undefined" && window.ipcRenderer?.invoke) {
    window.ipcRenderer.invoke("open-external", url);
    return;
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export interface EmailPasswordFormProps extends Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> {
  email: string;
  onBack: () => void;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function EmailPasswordForm({
  className,
  email,
  onBack,
  onSubmit,
  isLoading = false,
  error,
  ...props
}: EmailPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const displayError = error || formError;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();

          if (!password.trim()) {
            setFormError("请输入密码");
            return;
          }

          setFormError(null);
          onSubmit(password);
        }}
      >
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
            <h1 className="text-xl font-bold">输入密码</h1>
            <FieldDescription>
              邮箱：{email}
            </FieldDescription>
          </div>

          <Tabs className="w-full">
            <EmailPasswordInput
              value={password}
              onChange={setPassword}
              hasError={!!formError}
              autoFocus
            />

            <FieldError className="text-center">{displayError}</FieldError>
          </Tabs>

          <Field>
            <Button type="submit" className="cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner />
                  登录中
                </>
              ) : (
                "登录"
              )}
            </Button>
          </Field>

          <Field>
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              onClick={onBack}
              disabled={isLoading}
            >
              <IoArrowBack className="size-4" />
              返回上一步
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        忘记密码？
        <a
          href={PASSWORD_RESET_URL}
          onClick={(e) => {
            e.preventDefault();
            openExternal(PASSWORD_RESET_URL);
          }}
        >
          立即重置
        </a>
      </FieldDescription>
    </div>
  );
}
