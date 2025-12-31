/**
 * 云电脑内容组件
 * 显示云电脑实例列表
 */

import { useState, useEffect } from "react";
import { RefreshCw, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getHostList } from "@/services/host";
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
  const handleRowClick = (hostId: string) => {
    setSelectedHostId(hostId);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">云电脑管理</h2>
      <p className="text-muted-foreground">管理您的云电脑实例</p>

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

      {/* 主机列表 */}
      {!isLoading && !error && hosts.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="size-5 text-primary" />
                <span className="font-medium">实例列表</span>
                <span className="text-sm text-muted-foreground">({hosts.length})</span>
              </div>
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
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>操作系统</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>到期时间</TableHead>
                    <TableHead className="text-right">价格</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hosts.map((host) => {
                    const statusBadge = getStatusBadge(host.domainstatus);
                    return (
                      <TableRow
                        key={host.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(host.id)}
                      >
                        <TableCell className="font-medium">{host.productname}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell>{host.dedicatedip || "-"}</TableCell>
                        <TableCell>{host.os || "-"}</TableCell>
                        <TableCell>{host.area_name || "-"}</TableCell>
                        <TableCell>{formatExpireDate(host.nextduedate)}</TableCell>
                        <TableCell className="text-right">{host.price_desc || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
