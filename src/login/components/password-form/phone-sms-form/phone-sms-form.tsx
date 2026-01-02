/**
 * 手机号验证码登录表单组件
 * 处理手机号+短信验证码登录
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

import { SmsCodeInput } from "./components/sms-code-input";

export interface PhoneSmsFormProps extends Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> {
  phoneCode: string;
  phone: string;
  onBack: () => void;
  onSubmit: (code: string) => void;
  onSwitchToPassword?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PhoneSmsForm({
  className,
  phoneCode,
  phone,
  onBack,
  onSubmit,
  onSwitchToPassword,
  isLoading = false,
  error,
  ...props
}: PhoneSmsFormProps) {
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const displayError = error || formError;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();

          if (!code.trim()) {
            setFormError("请输入验证码");
            return;
          }

          if (code.trim().length < 4) {
            setFormError("验证码格式不正确");
            return;
          }

          setFormError(null);
          onSubmit(code);
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
            <h1 className="text-xl font-bold">输入验证码</h1>
            <FieldDescription>
              手机号：{phoneCode} {phone}
            </FieldDescription>
          </div>

          <Tabs className="w-full">
            <SmsCodeInput
              value={code}
              onChange={setCode}
              phoneCode={phoneCode}
              phone={phone}
              hasError={!!formError && !code.trim()}
            />

            <FieldError className="text-center mt-4">{displayError}</FieldError>
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

          {onSwitchToPassword && (
            <Field>
              <Button
                type="button"
                variant="link"
                className="cursor-pointer text-muted-foreground"
                onClick={onSwitchToPassword}
                disabled={isLoading}
              >
                使用密码登录
              </Button>
            </Field>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
