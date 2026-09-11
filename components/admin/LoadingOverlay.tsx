"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface LoadingOverlayContextValue {
  show: (message?: string) => void;
  hide: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

/**
 * Popup loading toàn màn hình — dùng cho các hành động không có UI pending
 * riêng theo từng dòng/nút (vd hành động ảnh hưởng cả phiên đăng nhập), để
 * người dùng biết hệ thống đang xử lý chứ không phải bị đứng/lag.
 */
export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg?: string) => setMessage(msg ?? "Đang xử lý..."), []);
  const hide = useCallback(() => setMessage(null), []);

  return (
    <LoadingOverlayContext.Provider value={{ show, hide }}>
      {children}
      {message && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4">
          <div className="animate-dialog-in flex items-center gap-3 rounded-xl2 border border-border bg-card px-5 py-4 shadow-xl">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-primary-600" />
            <p className="text-sm font-medium text-foreground">{message}</p>
          </div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}

export function useGlobalLoading(): LoadingOverlayContextValue {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) throw new Error("useGlobalLoading phải dùng bên trong <LoadingOverlayProvider>.");
  return ctx;
}
