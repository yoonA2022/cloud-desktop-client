/**
 * 主页组件
 * 管理应用的页面导航和内容显示逻辑
 */

import { useState, useEffect } from "react";
import { AppLayout } from "@/home/layout/app-layout";
import { HomeContent } from "@/home/layout/content/home-content";
import { SettingsContent } from "@/home/layout/content/settings-content";
import { CloudDesktopContent } from "@/home/layout/content/cloud-desktop-content";

export type PageType = "home" | "settings" | "cloud-desktop";

const STORAGE_KEY = "currentPage";

/**
 * 从 localStorage 获取保存的页面
 */
function getSavedPage(): PageType {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["home", "settings", "cloud-desktop"].includes(saved)) {
      return saved as PageType;
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return "home";
}

/**
 * 保存当前页面到 localStorage
 */
function savePage(page: PageType) {
  try {
    localStorage.setItem(STORAGE_KEY, page);
  } catch {
    // localStorage 不可用时忽略
  }
}

interface HomePageProps {
  onLogout: () => void;
}

export function HomePage({ onLogout }: HomePageProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(getSavedPage);

  // 页面变化时保存到 localStorage
  useEffect(() => {
    savePage(currentPage);
  }, [currentPage]);

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={onLogout}>
      {currentPage === "home" && <HomeContent />}
      {currentPage === "settings" && <SettingsContent />}
      {currentPage === "cloud-desktop" && <CloudDesktopContent />}
    </AppLayout>
  );
}
