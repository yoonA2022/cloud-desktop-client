/**
 * 重装系统对话框组件
 */

import { useState, useEffect } from "react";
import { RotateCw, AlertTriangle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

interface CloudOS {
  id: string;
  name: string;
  group: string;
}

interface CloudOSGroup {
  id: string;
  name: string;
}

interface ReinstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostId: string | null;
  hostName?: string;
  cloudOsList: CloudOS[];
  cloudOsGroups: CloudOSGroup[];
  onReinstall: (params: {
    hostId: string;
    osId: string;
    osGroupId?: string;
    password: string;
  }) => Promise<void>;
}

export function ReinstallDialog({
  open,
  onOpenChange,
  hostId,
  hostName,
  cloudOsList,
  cloudOsGroups,
  onReinstall,
}: ReinstallDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedOS, setSelectedOS] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置状态
  useEffect(() => {
    if (open) {
      setSelectedGroup("");
      setSelectedOS(null);
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  // 过滤当前分组的操作系统
  const filteredOSList = selectedGroup
    ? cloudOsList.filter((os) => os.group === selectedGroup)
    : [];

  // 密码验证
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return "密码长度至少6位";
    }
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (!hasUpper || !hasLower || !hasNumber) {
      return "密码必须包含大小写字母和数字";
    }
    return null;
  };

  // 提交重装
  const handleSubmit = async () => {
    if (!hostId || !selectedOS) {
      setError("请选择操作系统");
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
      await onReinstall({
        hostId,
        osId: selectedOS,
        osGroupId: selectedGroup || undefined,
        password,
      });
      // 重装成功，关闭对话框
      onOpenChange(false);
    } catch (err) {
      console.error('重装失败:', err);
      setError(err instanceof Error ? err.message : "重装失败，请重试");
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
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-150 max-h-[90vh] overflow-y-auto custom-scrollbar"
          )}
        >
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg leading-none font-semibold flex items-center gap-2">
              <RotateCw className="size-5" />
              重装系统
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground text-sm">
              {hostName && `正在为 ${hostName} 重装系统`}
            </DialogPrimitive.Description>
          </div>

        <div className="space-y-4 py-4">
          {/* 警告提示 */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive mb-1">重要提示</p>
              <p className="text-muted-foreground">
                重装系统将清空所有数据，请确保已备份重要文件。此操作不可恢复。
              </p>
            </div>
          </div>

          {/* 选择操作系统分组 */}
          <div className="space-y-2">
            <Label>选择操作系统类型</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cloudOsGroups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setSelectedOS(null);
                  }}
                >
                  {group.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 选择具体操作系统 */}
          {selectedGroup && (
            <div className="space-y-2">
              <Label>选择系统版本</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredOSList.map((os) => (
                  <Button
                    key={os.id}
                    variant={selectedOS === os.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedOS(os.id)}
                  >
                    {os.name}
                  </Button>
                ))}
              </div>
              {filteredOSList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  该分组下暂无可用系统
                </p>
              )}
            </div>
          )}

          {/* 设置密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">设置新密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少6位，包含大小写字母和数字"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 确认密码 */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
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

          {/* 当前选择摘要 */}
          {selectedOS && password && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">重装配置</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">操作系统:</span>
                <Badge>
                  {cloudOsList.find((os) => os.id === selectedOS)?.name}
                </Badge>
              </div>
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
            disabled={!selectedOS || !password || !confirmPassword || isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-4 mr-2" />
                重装中...
              </>
            ) : (
              "确认重装"
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
