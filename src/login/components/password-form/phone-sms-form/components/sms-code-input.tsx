/**
 * 短信验证码输入组件
 * 包含图形验证码、发送按钮和短信验证码输入
 */

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { sendLoginSms } from "@/services/sms";
import { fetchCaptchaImage } from "@/services/captcha";
import { getCommonList } from "@/services/common";

interface SmsCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  phoneCode: string;
  phone: string;
  hasError?: boolean;
}

export function SmsCodeInput({
  value,
  onChange,
  phoneCode,
  phone,
  hasError,
}: SmsCodeInputProps) {
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);

  // 图形验证码相关
  const [captcha, setCaptcha] = useState("");
  const [captchaDataUrl, setCaptchaDataUrl] = useState("");
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

  // mk 令牌（从 /common_list 获取）
  const [mk, setMk] = useState("");

  // 根据文档，图形验证码名称应该是 allow_login_code_captcha
  const captchaName = "allow_login_code_captcha";

  // 获取 mk 令牌
  const loadMk = useCallback(async () => {
    try {
      const response = await getCommonList();
      if (response.status === 200 && response.data?.msfntk) {
        setMk(response.data.msfntk);
      }
    } catch (error) {
      console.error("获取 mk 令牌失败:", error);
    }
  }, []);

  // 加载图形验证码
  const loadCaptcha = useCallback(async () => {
    setIsLoadingCaptcha(true);
    try {
      const dataUrl = await fetchCaptchaImage(captchaName);
      setCaptchaDataUrl(dataUrl);
    } catch (error) {
      console.error("加载验证码失败:", error);
    } finally {
      setIsLoadingCaptcha(false);
    }
  }, []);

  // 初始加载 mk 令牌和图形验证码
  useEffect(() => {
    loadMk();
    loadCaptcha();
  }, [loadMk, loadCaptcha]);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 刷新图形验证码
  const handleRefreshCaptcha = useCallback(() => {
    setCaptcha("");
    loadCaptcha();
  }, [loadCaptcha]);

  // 发送短信验证码
  const handleSendSms = useCallback(async () => {
    if (countdown > 0 || isSending) return;

    if (!captcha.trim()) {
      setSendError("请输入图形验证码");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendLoginSms({
        phone_code: phoneCode,
        phone: phone,
        captcha: captcha,
        mk: mk, // 携带 mk 令牌
      });

      if (response.status === 200) {
        // 发送成功，开始倒计时
        setCountdown(60);
        setSmsSent(true);
        setSendError(null);
      } else {
        setSendError(response.msg || "发送失败");
        // 刷新图形验证码
        handleRefreshCaptcha();
      }
    } catch {
      setSendError("网络错误，请重试");
      handleRefreshCaptcha();
    } finally {
      setIsSending(false);
    }
  }, [phoneCode, phone, captcha, mk, countdown, isSending, handleRefreshCaptcha]);

  const canSend = countdown === 0 && !isSending && captcha.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* 图形验证码 */}
      <Field>
        <FieldLabel htmlFor="captcha">图形验证码</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="captcha"
            name="captcha"
            type="text"
            placeholder="请输入图形验证码"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
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
                onClick={handleRefreshCaptcha}
                title="点击刷新验证码"
              />
            )}
            <button
              type="button"
              onClick={handleRefreshCaptcha}
              disabled={isLoadingCaptcha}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-colors cursor-pointer"
              )}
              title="刷新验证码"
            >
              <RefreshCw
                className={cn("size-4", isLoadingCaptcha && "animate-spin")}
              />
            </button>
          </div>
        </div>
      </Field>

      {/* 发送短信按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={handleSendSms}
        disabled={!canSend}
        className={cn(
          "w-full cursor-pointer",
          !canSend && "cursor-not-allowed"
        )}
      >
        {isSending ? (
          <>
            <Spinner className="size-4 mr-2" />
            发送中...
          </>
        ) : countdown > 0 ? (
          `重新发送 (${countdown}s)`
        ) : smsSent ? (
          "重新发送验证码"
        ) : (
          "发送短信验证码"
        )}
      </Button>

      {/* 错误提示 */}
      {sendError && (
        <p className="text-sm text-destructive text-center">{sendError}</p>
      )}

      {/* 短信验证码输入 - 使用 InputOTP */}
      {smsSent && (
        <Field>
          <FieldLabel>短信验证码</FieldLabel>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={value}
              onChange={onChange}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className={hasError ? "border-destructive" : ""} />
                <InputOTPSlot index={1} className={hasError ? "border-destructive" : ""} />
                <InputOTPSlot index={2} className={hasError ? "border-destructive" : ""} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className={hasError ? "border-destructive" : ""} />
                <InputOTPSlot index={4} className={hasError ? "border-destructive" : ""} />
                <InputOTPSlot index={5} className={hasError ? "border-destructive" : ""} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </Field>
      )}
    </div>
  );
}
