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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

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

export interface PasswordFormProps extends Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> {
  loginType: "email" | "phone";
  account: string;
  onBack: () => void;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PasswordForm({
  className,
  loginType,
  account,
  onBack,
  onSubmit,
  isLoading = false,
  error,
  ...props
}: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const accountLabel = loginType === "email" ? "邮箱" : "手机号";
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
                <img src={logo} alt="豪得云 - 客户端" className="size-6" />
              </div>
              <span className="sr-only">豪得云 - 客户端</span>
            </a>
            <h1 className="text-xl font-bold">输入密码</h1>
            <FieldDescription>
              {accountLabel}：{account}
            </FieldDescription>
          </div>

          <Tabs className="w-full">
            <Field>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!formError}
                autoFocus
              />
            </Field>
  
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
