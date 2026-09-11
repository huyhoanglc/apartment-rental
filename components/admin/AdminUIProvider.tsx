"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/admin/Toast";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { LoadingOverlayProvider } from "@/components/admin/LoadingOverlay";

/** 1 điểm bọc duy nhất cho toast/popup xác nhận/popup loading dùng chung toàn trang admin. */
export default function AdminUIProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <LoadingOverlayProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </LoadingOverlayProvider>
    </ToastProvider>
  );
}
