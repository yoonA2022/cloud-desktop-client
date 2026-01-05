/**
 * 云电脑内容组件
 * 显示云电脑实例列表
 */

import { useState, useEffect } from "react";
import { RefreshCw, Monitor, Play, Info, MapPin, Calendar, RotateCw, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getHostList } from "@/services/host";
import { getHostDetail } from "@/services/host-detail";
import { reinstallSystem } from "@/services/reinstall";
import { resetPassword } from "@/services/reset-password";
import { HostDetailSheet } from "./components/host-detail-sheet";
import { ReinstallDialog } from "./components/reinstall-dialog";
import { ResetPasswordDialog } from "./components/reset-password-dialog";
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
  const [reinstallOpen, setReinstallOpen] = useState(false);
  const [reinstallHostId, setReinstallHostId] = useState<string | null>(null);
  const [cloudOsList, setCloudOsList] = useState<Array<{ id: string; name: string; group: string }>>([]);
  const [cloudOsGroups, setCloudOsGroups] = useState<Array<{ id: string; name: string }>>([]);
  // 记录已连接的主机ID集合
  const [connectedHostIds, setConnectedHostIds] = useState<Set<string>>(new Set());
  // 重置密码对话框状态
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordHostId, setResetPasswordHostId] = useState<string | null>(null);

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

  // 打开重装系统对话框
  const handleOpenReinstall = async (hostId: string) => {
    setReinstallHostId(hostId);

    // 获取主机详情以获取操作系统列表和主机类型
    try {
      const response = await getHostDetail(hostId);

      if (response.status === 200 && response.data) {
        setCloudOsList(response.data.cloud_os || []);
        setCloudOsGroups(response.data.cloud_os_group || []);
        setReinstallOpen(true);
      } else {
        setError("获取操作系统列表失败");
      }
    } catch (err) {
      console.error('获取主机详情失败:', err);
      setError("获取操作系统列表失败");
    }
  };

  // 执行重装系统
  const handleReinstall = async (params: {
    hostId: string;
    osId: string;
    osGroupId?: string;
    password: string;
  }) => {
    // 获取主机类型
    const host = hosts.find((h) => h.id === params.hostId);
    const hostType = host?.type || 'cloud'; // 默认为 cloud 类型

    try {
      const response = await reinstallSystem({
        id: params.hostId,
        hostType: hostType as 'cloud' | 'dcim' | 'dcimcloud',
        os: params.osId,
        os_group: params.osGroupId,
        password: params.password,
        port: 3389, // Windows默认端口3389
        action: 0, // 0默认分区
        part_type: 0, // Windows全盘格式化
        disk: 0, // 磁盘号从0开始
        check_disk_size: 1, // 验证磁盘大小
      });

      if (response.status === 200) {
        // 重装成功，刷新主机列表
        await loadHosts();
        setError(null);

        // 使用 Sonner 显示成功提示
        toast.success("重装系统成功", {
          description: "系统正在重装中，请稍后...",
          duration: 3000,
        });
      } else {
        // 重装失败，显示错误信息
        throw new Error(response.msg || "重装系统失败");
      }
    } catch (err) {
      console.error('重装系统异常:', err);
      const errorMessage = err instanceof Error ? err.message : "重装系统失败，请重试";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 打开重置密码对话框
  const handleOpenResetPassword = (hostId: string) => {
    setResetPasswordHostId(hostId);
    setResetPasswordOpen(true);
  };

  // 执行重置密码
  const handleResetPassword = async (params: {
    hostId: string;
    password: string;
  }) => {
    // 获取主机类型
    const host = hosts.find((h) => h.id === params.hostId);
    const hostType = host?.type || 'cloud'; // 默认为 cloud 类型

    try {
      const response = await resetPassword({
        id: params.hostId,
        hostType: hostType as 'cloud' | 'dcim' | 'dcimcloud',
        password: params.password,
      });

      if (response.status === 200 || response.status === 201 || response.status === 203 || response.status === 204) {
        // 重置成功
        toast.success("重置密码成功", {
          description: "密码已重置，请使用新密码连接",
          duration: 3000,
        });
      } else {
        // 重置失败
        throw new Error(response.msg || "重置密码失败");
      }
    } catch (err) {
      console.error('重置密码异常:', err);
      const errorMessage = err instanceof Error ? err.message : "重置密码失败，请重试";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
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
      } else if (result && result.success) {
        // 连接成功，添加到已连接列表
        setConnectedHostIds(prev => new Set(prev).add(host.id));
        toast.success("连接成功", {
          description: `已连接到 ${host.productname}`,
          duration: 2000,
        });
      }
    } catch {
      setError("连接失败，请重试");
    } finally {
      setConnectingId(null);
    }
  };

  // 断开连接
  const handleDisconnect = async (host: Host) => {
    try {
      // 获取主机详情以获取端口信息
      const response = await getHostDetail(host.id);
      const port = response.data?.host_data?.port;

      // 调用断开连接的 IPC
      const result = await window.ipcRenderer?.invoke("remote-desktop-disconnect", {
        ip: host.dedicatedip,
        port: port,
      }) as { success: boolean; error?: string } | undefined;

      if (result && result.success) {
        // 从已连接列表中移除
        setConnectedHostIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(host.id);
          return newSet;
        });
        toast.success("已断开连接", {
          description: `已断开与 ${host.productname} 的连接`,
          duration: 2000,
        });
      } else {
        setError(result?.error || "断开连接失败");
      }
    } catch {
      setError("断开连接失败，请重试");
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
            const isConnected = connectedHostIds.has(host.id);
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
                    <div className="flex flex-col gap-1 shrink-0">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      {isConnected && (
                        <Badge variant="default" className="bg-green-600">
                          已连接
                        </Badge>
                      )}
                    </div>
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

                <CardFooter className="pt-0 gap-2 flex-col">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer"
                      onClick={() => handleViewDetail(host.id)}
                    >
                      <Info className="size-4 mr-1" />
                      详情
                    </Button>
                    {isConnected ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 cursor-pointer"
                        onClick={() => handleDisconnect(host)}
                      >
                        <Play className="size-4 mr-1" />
                        断开
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 cursor-pointer"
                        disabled={!isActive || isConnecting}
                        onClick={() => handleRemoteConnect(host)}
                      >
                        <Play className="size-4 mr-1" />
                        {isConnecting ? "连接中..." : "连接"}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer"
                      disabled={!isActive}
                      onClick={() => handleOpenReinstall(host.id)}
                    >
                      <RotateCw className="size-4 mr-1" />
                      重装系统
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer"
                      disabled={!isActive}
                      onClick={() => handleOpenResetPassword(host.id)}
                    >
                      <KeyRound className="size-4 mr-1" />
                      重置密码
                    </Button>
                  </div>
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
        isConnected={selectedHostId ? connectedHostIds.has(selectedHostId) : false}
        onConnect={() => {
          const host = hosts.find(h => h.id === selectedHostId);
          if (host) handleRemoteConnect(host);
        }}
        onDisconnect={() => {
          const host = hosts.find(h => h.id === selectedHostId);
          if (host) handleDisconnect(host);
        }}
      />

      {/* 重装系统对话框 */}
      <ReinstallDialog
        open={reinstallOpen}
        onOpenChange={setReinstallOpen}
        hostId={reinstallHostId}
        hostName={hosts.find((h) => h.id === reinstallHostId)?.productname}
        cloudOsList={cloudOsList}
        cloudOsGroups={cloudOsGroups}
        onReinstall={handleReinstall}
      />

      {/* 重置密码对话框 */}
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        hostId={resetPasswordHostId}
        hostName={hosts.find((h) => h.id === resetPasswordHostId)?.productname}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
