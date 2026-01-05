/**
 * 重置密码对话框组件
 */

import { useState, useEffect } from "react";
import { KeyRound, AlertTriangle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostId: string | null;
  hostName?: string;
  onResetPassword: (params: {
    hostId: string;
    password: string;
  }) => Promise<void>;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  hostId,
  hostName,
  onResetPassword,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置状态
  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  // 密码验证
  const validatePassword = (pwd: string): string | null => {
    // 长度验证：8-16位
    if (pwd.length < 8 || pwd.length > 16) {
      return "密码长度必须为8-16位";
    }

    // 必须包含大写字母
    if (!/[A-Z]/.test(pwd)) {
      return "密码必须包含大写字母";
    }

    // 必须包含小写字母
    if (!/[a-z]/.test(pwd)) {
      return "密码必须包含小写字母";
    }

    // 必须包含数字
    if (!/[0-9]/.test(pwd)) {
      return "密码必须包含数字";
    }

    // 必须包含特殊字符
    if (!/[~@#$%*_\-+=,.?[\]{}]/.test(pwd)) {
      return "密码必须包含特殊字符(~@#$%*_-+=,.?[]{})";
    }

    // 检查是否有3个及以上连续的数字
    if (/\d{3,}/.test(pwd)) {
      return "密码不能包含3个及以上连续的数字";
    }

    // 检查是否有3个及以上重复的数字
    if (/(\d)\1{2,}/.test(pwd)) {
      return "密码不能包含3个及以上重复的数字";
    }

    // 检查特殊字符数量（最多3个）
    const specialChars = pwd.match(/[~@#$%*_\-+=,.?[\]{}]/g);
    if (specialChars && specialChars.length > 3) {
      return "特殊字符最多不能超过3个";
    }

    return null;
  };

  // 生成随机密码
  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "~@#$%*_-+=,.?";

    let pwd = "";

    // 确保至少包含一个大写、小写、数字、特殊字符
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    // 填充剩余字符到12位（确保在8-16位范围内）
    const allChars = uppercase + lowercase;
    for (let i = 0; i < 8; i++) {
      pwd += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 打乱顺序
    pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');

    // 验证生成的密码是否符合规则，如果不符合则重新生成
    if (validatePassword(pwd) !== null) {
      return generatePassword();
    }

    setPassword(pwd);
    setConfirmPassword(pwd);
  };

  // 提交重置
  const handleSubmit = async () => {
    if (!hostId) {
      setError("主机ID不能为空");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onResetPassword({
        hostId,
        password,
      });
      // 重置成功，关闭对话框
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "重置密码失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar"
          )}
        >
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg leading-none font-semibold flex items-center gap-2">
              <KeyRound className="size-5" />
              重置密码
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground text-sm">
              {hostName && `正在为 ${hostName} 重置密码`}
            </DialogPrimitive.Description>
          </div>

          <div className="space-y-4 py-4">
            {/* 警告提示 */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="size-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">重要提示</p>
                <p className="text-yellow-700 dark:text-yellow-500">
                  重置密码后，需要使用新密码重新连接远程桌面。
                </p>
              </div>
            </div>

            {/* 设置密码 */}
            <div className="space-y-2">
              <Label htmlFor="password">设置新密码</Label>
              <p className="text-xs text-muted-foreground">
                8-16位，包含大小写字母、数字和特殊字符，不能有3个及以上连续或重复数字，特殊字符最多3个
              </p>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="cursor-pointer shrink-0"
                >
                  随机生成
                </Button>
              </div>
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input
                id="confirm-password"
                type="text"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!password || !confirmPassword || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  重置中...
                </>
              ) : (
                "确认重置"
              )}
            </Button>
          </div>

          <DialogPrimitive.Close
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
