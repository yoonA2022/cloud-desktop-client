/**
 * 应用侧边栏组件
 * 显示应用导航菜单和品牌标识，支持折叠功能
 */

import { Home, Settings, Monitor } from "lucide-react";
import logo from "@/assets/images/logo.png";
import type { PageType } from "@/home/home-page";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "首页",
    icon: Home,
    page: "home" as PageType,
  },
  {
    title: "云电脑管理",
    icon: Monitor,
    page: "cloud-desktop" as PageType,
  },
  {
    title: "设置",
    icon: Settings,
    page: "settings" as PageType,
  },
];

interface AppSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function AppSidebar({ currentPage, onPageChange }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src={logo} alt="豪得云" className="size-6 aspect-square object-contain" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">豪得云</span>
                  <span className="text-xs text-muted-foreground">客户端</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    tooltip={item.title}
                    onClick={() => onPageChange(item.page)}
                    className="cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
