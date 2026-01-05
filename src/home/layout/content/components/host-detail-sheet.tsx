/**
 * 主机详情组件
 * 显示云电脑的详细信息
 */

import { useState, useEffect } from "react";
import {
  Monitor,
  Calendar,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Server,
  CreditCard,
  Settings,
  Wifi,
  Play,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getHostDetail } from "@/services/host-detail";
import type { HostDetailData } from "@/types/host-detail";

/**
 * 格式化时间戳
 */
function formatDate(timestamp: number): string {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 计算剩余天数
 */
function getDaysRemaining(timestamp: number): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!timestamp) return { text: "-", variant: "secondary" };
  const now = new Date();
  const expireDate = new Date(timestamp * 1000);
  const diffTime = expireDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `已过期${Math.abs(diffDays)}天`, variant: "destructive" };
  } else if (diffDays <= 7) {
    return { text: `${diffDays}天后到期`, variant: "destructive" };
  } else if (diffDays <= 30) {
    return { text: `${diffDays}天后到期`, variant: "outline" };
  } else {
    return { text: `${diffDays}天后到期`, variant: "secondary" };
  }
}

/**
 * 获取状态样式
 */
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Active: "default",
    Pending: "secondary",
    Suspended: "outline",
    Terminated: "destructive",
    Cancelled: "secondary",
  };
  return map[status] || "secondary";
}

/**
 * 可复制文本组件
 */
function CopyableText({ value, secret = false }: { value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [showValue, setShowValue] = useState(!secret);

  const handleCopy = async () => {
    if (!value || value === "-") return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="font-medium truncate">
        {secret && !showValue ? "••••••••" : value || "-"}
      </span>
      {secret && value && value !== "-" && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 cursor-pointer"
          onClick={() => setShowValue(!showValue)}
        >
          {showValue ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
        </Button>
      )}
      {value && value !== "-" && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 cursor-pointer"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
        </Button>
      )}
    </div>
  );
}

/**
 * 信息卡片组件
 */
function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        <div className="space-y-2 text-sm">{children}</div>
      </CardContent>
    </Card>
  );
}

/**
 * 信息行组件
 */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

interface HostDetailSheetProps {
  hostId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function HostDetailSheet({
  hostId,
  open,
  onOpenChange,
  isConnected = false,
  onConnect,
  onDisconnect,
}: HostDetailSheetProps) {
  const [detail, setDetail] = useState<HostDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hostId || !open) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getHostDetail(hostId);
        if (response.status === 200) {
          setDetail(response.data);
        } else {
          setError(response.msg || "获取详情失败");
        }
      } catch {
        setError("网络错误，请检查网络连接");
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [hostId, open]);

  const hostData = detail?.host_data;
  const daysRemaining = hostData ? getDaysRemaining(hostData.nextduedate) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 custom-scrollbar">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Monitor className="size-5" />
            云电脑详情
          </SheetTitle>
          <SheetDescription>查看云电脑实例的详细信息</SheetDescription>
        </SheetHeader>

        <div className="p-6 pt-4">
          {/* 加载状态 */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          )}

          {/* 错误提示 */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* 详情内容 */}
          {hostData && !isLoading && (
            <div className="space-y-4">
              {/* 头部信息 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/50">
                <div>
                  <h3 className="font-semibold text-lg">{hostData.productname}</h3>
                  <p className="text-sm text-muted-foreground">{hostData.domain}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusVariant(hostData.domainstatus)}>
                    {hostData.domainstatus_desc}
                  </Badge>
                  {daysRemaining && (
                    <Badge variant={daysRemaining.variant}>{daysRemaining.text}</Badge>
                  )}
                </div>
              </div>

              {/* 远程连接按钮 */}
              {hostData.domainstatus === "Active" && (
                <div className="space-y-2">
                  {isConnected ? (
                    <>
                      <Badge variant="default" className="bg-green-600 w-full justify-center py-2">
                        已连接
                      </Badge>
                      <Button
                        variant="destructive"
                        className="w-full cursor-pointer"
                        size="lg"
                        onClick={onDisconnect}
                      >
                        <Play className="size-4 mr-2" />
                        断开连接
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full cursor-pointer"
                      size="lg"
                      onClick={onConnect}
                    >
                      <Play className="size-4 mr-2" />
                      远程连接
                    </Button>
                  )}
                </div>
              )}

              {/* 连接信息 */}
              <InfoCard icon={Wifi} title="连接信息">
                <InfoRow label="IP地址">
                  <CopyableText value={hostData.dedicatedip} />
                </InfoRow>
                <InfoRow label="端口">
                  <CopyableText value={hostData.port || "-"} />
                </InfoRow>
                <InfoRow label="远程地址">
                  <CopyableText value={detail?.["dcimcloud.nat_acl"] || "-"} />
                </InfoRow>
              </InfoCard>

              {/* 登录凭证 */}
              <InfoCard icon={Key} title="登录凭证">
                <InfoRow label="用户名">
                  <CopyableText value={hostData.username} />
                </InfoRow>
                <InfoRow label="密码">
                  <CopyableText value={hostData.password} secret />
                </InfoRow>
              </InfoCard>

              {/* 系统信息 */}
              <InfoCard icon={Server} title="系统信息">
                <InfoRow label="操作系统">
                  <span className="font-medium">{hostData.os || "-"}</span>
                </InfoRow>
                <InfoRow label="产品组">
                  <span className="font-medium">{hostData.groupname || "-"}</span>
                </InfoRow>
              </InfoCard>

              {/* 时间信息 */}
              <InfoCard icon={Calendar} title="时间信息">
                <InfoRow label="开通时间">
                  <span className="font-medium">{formatDate(hostData.regdate)}</span>
                </InfoRow>
                <InfoRow label="到期时间">
                  <span className="font-medium">{formatDate(hostData.nextduedate)}</span>
                </InfoRow>
              </InfoCard>

              {/* 费用信息 */}
              <InfoCard icon={CreditCard} title="费用信息">
                <InfoRow label="付款周期">
                  <span className="font-medium">{hostData.billingcycle_desc || "-"}</span>
                </InfoRow>
                <InfoRow label="续费金额">
                  <span className="font-medium text-primary">{hostData.amount_desc || "-"}</span>
                </InfoRow>
              </InfoCard>

              {/* 配置选项 */}
              {detail?.config_options && detail.config_options.length > 0 && (
                <InfoCard icon={Settings} title="配置信息">
                  {detail.config_options.map((option, index) => (
                    <InfoRow key={index} label={option.name}>
                      <span className="font-medium">{option.sub_name}</span>
                    </InfoRow>
                  ))}
                </InfoCard>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
