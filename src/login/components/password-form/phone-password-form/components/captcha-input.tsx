/**
 * 图形验证码输入组件
 * 包含验证码图片显示和输入框
 */

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fetchCaptchaImage } from "@/services/captcha";

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  hasError?: boolean;
}

export function CaptchaInput({
  value,
  onChange,
  name,
  hasError,
}: CaptchaInputProps) {
  const [captchaDataUrl, setCaptchaDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 加载验证码图片
  const loadCaptcha = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataUrl = await fetchCaptchaImage(name);
      setCaptchaDataUrl(dataUrl);
    } catch (error) {
      console.error("加载验证码失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [name]);

  // 初始加载
  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  // 刷新验证码
  const handleRefresh = () => {
    onChange(""); // 清空验证码输入
    loadCaptcha();
  };

  return (
    <Field>
      <FieldLabel htmlFor="captcha">图形验证码</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="captcha"
          name="captcha"
          type="text"
          placeholder="请输入验证码"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError}
          className="flex-1"
          maxLength={6}
          autoComplete="off"
        />
        <div className="flex items-center gap-1">
          {captchaDataUrl && (
            <img
              src={captchaDataUrl}
              alt="图形验证码"
              className="h-9 min-w-20 rounded-md border cursor-pointer"
              onClick={handleRefresh}
              title="点击刷新验证码"
            />
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors"
            )}
            title="刷新验证码"
          >
            <RefreshCw
              className={cn("size-4", isLoading && "animate-spin")}
            />
          </button>
        </div>
      </div>
    </Field>
  );
}
