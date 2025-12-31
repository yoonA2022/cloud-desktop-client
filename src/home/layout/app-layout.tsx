/**
 * 应用布局组件
 * 提供包含侧边栏和头部的整体页面布局结构
 */

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/home/layout/components/app-sidebar";
import { AppHeader } from "@/home/layout/components/app-header";
import type { PageType } from "@/home/home-page";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout: () => void;
}

export function AppLayout({ children, currentPage, onPageChange, onLogout }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar currentPage={currentPage} onPageChange={onPageChange} />
      <SidebarInset>
        <AppHeader onLogout={onLogout} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
