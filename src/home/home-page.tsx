/**
 * 主页组件
 * 管理应用的页面导航和内容显示逻辑
 */

import { useState } from "react";
import { AppLayout } from "@/home/layout/app-layout";
import { HomeContent } from "@/home/layout/content/home-content";
import { SettingsContent } from "@/home/layout/content/settings-content";
import { CloudDesktopContent } from "@/home/layout/content/cloud-desktop-content";

export type PageType = "home" | "settings" | "cloud-desktop";

interface HomePageProps {
  onLogout: () => void;
}

export function HomePage({ onLogout }: HomePageProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={onLogout}>
      {currentPage === "home" && <HomeContent />}
      {currentPage === "settings" && <SettingsContent />}
      {currentPage === "cloud-desktop" && <CloudDesktopContent />}
    </AppLayout>
  );
}
