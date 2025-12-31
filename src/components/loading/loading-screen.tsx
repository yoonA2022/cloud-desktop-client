/**
 * 加载屏幕组件
 * 显示加载状态和可选的文本信息
 */

import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = "加载中..." }: LoadingScreenProps) {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8" />
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  );
}
