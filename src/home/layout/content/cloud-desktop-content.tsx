/**
 * 云电脑内容组件
 * 显示云电脑实例列表
 */

import { useState, useEffect } from "react";
import { RefreshCw, Monitor, Play, Info, MapPin, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getHostList } from "@/services/host";
import { getHostDetail } from "@/services/host-detail";
import { HostDetailSheet } from "./components/host-detail-sheet";
import type { Host, HostStatus } from "@/types/host";

/**
 * 格式化到期时间
 * @param timestamp - 时间戳（秒）
 * @returns 格式化后的日期字符串
 */
function formatExpireDate(timestamp: string | number): string {
  if (!timestamp) return "-";

  const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(ts)) return "-";

  // 时间戳是秒，需要转换为毫秒
  const expireDate = new Date(ts * 1000);
  const now = new Date();

  // 格式化日期 YYYY-MM-DD
  const year = expireDate.getFullYear();
  const month = String(expireDate.getMonth() + 1).padStart(2, "0");
  const day = String(expireDate.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // 计算剩余天数
  const diffTime = expireDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${dateStr} (已过期${Math.abs(diffDays)}天)`;
  } else if (diffDays === 0) {
    return `${dateStr} (今天到期)`;
  } else if (diffDays <= 7) {
    return `${dateStr} (${diffDays}天后到期)`;
  } else if (diffDays <= 30) {
    return `${dateStr} (${diffDays}天后到期)`;
  } else {
    return `${dateStr} (${diffDays}天后到期)`;
  }
}

/**
 * 获取状态 Badge 变体
 */
function getStatusBadge(status: HostStatus): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const statusMap: Record<HostStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    Pending: { label: "待审核", variant: "secondary" },
    Active: { label: "运行中", variant: "default" },
    Suspended: { label: "已暂停", variant: "outline" },
    Terminated: { label: "已删除", variant: "destructive" },
    Cancelled: { label: "已取消", variant: "secondary" },
    Fraud: { label: "异常", variant: "destructive" },
    Completed: { label: "已完成", variant: "outline" },
  };
  return statusMap[status] || { label: status, variant: "secondary" };
}

/**
 * 云电脑内容组件
 */
export function CloudDesktopContent() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // 加载主机列表
  const loadHosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getHostList({ show_type: "list" });

      if (response.status === 200) {
        // 过滤只保留 Windows 系统的云电脑
        const windowsHosts = (response.data.list || []).filter(
          (host) => host.os_url?.toLowerCase() === "windows"
        );
        setHosts(windowsHosts);
      } else {
        setError(response.msg || "获取列表失败");
      }
    } catch {
      setError("网络错误，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadHosts();
  }, []);

  // 打开详情
  const handleViewDetail = (hostId: string) => {
    setSelectedHostId(hostId);
    setDetailOpen(true);
  };

  // 远程连接
  const handleRemoteConnect = async (host: Host) => {
    if (!host.dedicatedip) {
      return;
    }

    setConnectingId(host.id);
    try {
      // 先获取详情，拿到完整的登录凭据
      const response = await getHostDetail(host.id);
      if (response.status !== 200 || !response.data?.host_data) {
        setError("获取连接信息失败");
        return;
      }

      const hostData = response.data.host_data;
      const ip = hostData.dedicatedip;
      const port = hostData.port;
      const username = hostData.username;
      const password = hostData.password;

      if (!ip || !username || !password) {
        setError("缺少连接信息");
        return;
      }

      // 调用本地远程桌面工具连接
      const result = await window.ipcRenderer?.invoke("remote-desktop-connect", {
        ip,
        port,
        username,
        password,
      }) as { success: boolean; error?: string } | undefined;

      if (result && !result.success) {
        setError(result.error || "连接失败");
      }
    } catch {
      setError("连接失败，请重试");
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">云电脑管理</h2>
      <p className="text-muted-foreground">管理您的云电脑实例</p>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={loadHosts}
          disabled={isLoading}
          className="cursor-pointer"
        >
          <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && !isLoading && (
        <Card className="w-full p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadHosts} className="cursor-pointer">
              重试
            </Button>
          </div>
        </Card>
      )}

      {/* 空状态 */}
      {!isLoading && !error && hosts.length === 0 && (
        <Card className="w-full p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Monitor className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无云电脑实例</p>
          </div>
        </Card>
      )}

      {/* 主机卡片列表 */}
      {!isLoading && !error && hosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosts.map((host) => {
            const statusBadge = getStatusBadge(host.domainstatus);
            const isConnecting = connectingId === host.id;
            const isActive = host.domainstatus === "Active";

            return (
              <Card key={host.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                        <Monitor className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{host.productname}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {host.dedicatedip || "暂无IP"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusBadge.variant} className="shrink-0">
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      <span>{host.area_name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />
                      <span>{formatExpireDate(host.nextduedate)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleViewDetail(host.id)}
                  >
                    <Info className="size-4 mr-1" />
                    详情
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 cursor-pointer"
                    disabled={!isActive || isConnecting}
                    onClick={() => handleRemoteConnect(host)}
                  >
                    <Play className="size-4 mr-1" />
                    {isConnecting ? "连接中..." : "连接"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* 详情面板 */}
      <HostDetailSheet
        hostId={selectedHostId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
