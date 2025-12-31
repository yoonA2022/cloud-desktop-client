import { useState, useEffect } from "react";
import { Mail, Phone, User, Shield, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getUserInfo } from "@/services/auth";
import type { UserInfo, ClientGroup } from "@/types/auth";
import userAvatar from "@/assets/images/user.jpg";

export function HomeContent() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [clientGroup, setClientGroup] = useState<ClientGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await getUserInfo();
        if (response.status === 200 && response.user) {
          setUser(response.user);
          setClientGroup(response.client_group || null);
        }
      } catch {
        // 错误处理
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  const getCertifiStatus = (status?: number) => {
    switch (status) {
      case 1:
        return { text: "已认证", color: "text-green-600" };
      case 2:
        return { text: "未通过", color: "text-red-600" };
      case 3:
        return { text: "待审核", color: "text-yellow-600" };
      case 4:
        return { text: "已提交", color: "text-blue-600" };
      default:
        return { text: "未认证", color: "text-muted-foreground" };
    }
  };

  const certifiStatus = getCertifiStatus(user?.certifi?.status);

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === "未绑定") return phone;
    if (showFullPhone) return phone;
    // 显示前2位和后2位，中间用*替代
    if (phone.length >= 4) {
      return `${phone.slice(0, 2)}${"*".repeat(phone.length - 4)}${phone.slice(-2)}`;
    }
    return phone;
  };

  const formatEmail = (email: string) => {
    if (!email || email === "未绑定") return email;
    if (showFullEmail) return email;
    // 显示前2位和@后面的域名，中间用*替代
    const atIndex = email.indexOf("@");
    if (atIndex > 2) {
      return `${email.slice(0, 2)}${"*".repeat(atIndex - 2)}${email.slice(atIndex)}`;
    }
    return email;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">欢迎使用豪得云</h2>
      <p className="text-muted-foreground">这里是首页内容区域</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : user ? (
        <Card className="w-full">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Avatar className="size-20 sm:size-24 border-4 border-background shadow-lg">
                <AvatarImage src={userAvatar} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold">{user.username}</h3>
                  {user.certifi?.status === 1 && (
                    <BadgeCheck className="size-5 text-green-600" />
                  )}
                </div>
                {clientGroup && (
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: clientGroup.group_colour + "20",
                      color: clientGroup.group_colour,
                    }}
                  >
                    {clientGroup.group_name}
                  </span>
                )}
                <p className="text-sm text-muted-foreground">
                  用户ID: {user.id}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center size-10 rounded-full bg-background">
                  <Mail className="size-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">邮箱</span>
                  <button
                    onClick={() => setShowFullEmail(!showFullEmail)}
                    className="text-sm font-medium truncate text-left cursor-pointer hover:text-primary transition-colors"
                  >
                    {formatEmail(user.email || "未绑定")}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center size-10 rounded-full bg-background">
                  <Phone className="size-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">手机号</span>
                  <button
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    className="text-sm font-medium truncate text-left cursor-pointer hover:text-primary transition-colors"
                  >
                    {formatPhoneNumber(user.phonenumber || "未绑定")}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center size-10 rounded-full bg-background">
                  <User className="size-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">认证姓名</span>
                  <span className="text-sm font-medium truncate">
                    {user.certifi?.name || "未填写"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center size-10 rounded-full bg-background">
                  <Shield className="size-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">实名认证</span>
                  <span className={`text-sm font-medium ${certifiStatus.color}`}>
                    {certifiStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full p-8">
          <p className="text-center text-muted-foreground">无法获取用户信息</p>
        </Card>
      )}
    </div>
  );
}
