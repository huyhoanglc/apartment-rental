"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-status-available/30 bg-card text-foreground",
  error: "border-rose-300 bg-card text-foreground dark:border-rose-800",
  info: "border-border bg-card text-foreground",
};

const ICON_STYLES: Record<ToastType, string> = {
  success: "bg-status-available/10 text-status-available",
  error: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  info: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75h.008v.008H12V9.75Zm-.75 3v4.5h1.5v-4.5h-1.5ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

/**
 * Popup thông báo (toast) — thay cho việc im lặng nuốt lỗi/thành công ở các
 * Server Action fire-and-forget. Bọc 1 lần ở AdminUIProvider, gọi qua
 * useToast() ở bất kỳ client component nào bên trong.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => push("success", message), [push]);
  const error = useCallback((message: string) => push("error", message), [push]);
  const info = useCallback((message: string) => push("info", message), [push]);

  // QUAN TRỌNG: phải nhớ (useMemo) object context này — nếu tạo object literal
  // mới mỗi lần render, mọi component gọi useEffect phụ thuộc vào useToast()
  // sẽ bị re-run ngay khi có toast mới xuất hiện (vì push toast => re-render
  // ToastProvider => value đổi identity => effect chạy lại => push toast lần
  // nữa => lặp vô hạn). Đây chính là nguyên nhân bug "spam toast" đã gặp.
  const value = useMemo<ToastContextValue>(() => ({ success, error, info }), [success, error, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl2 border p-3.5 shadow-lg ${TYPE_STYLES[toast.type]}`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ICON_STYLES[toast.type]}`}>
              <ToastIcon type={toast.type} />
            </span>
            <p className="min-w-0 flex-1 whitespace-pre-line pt-0.5 text-sm text-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Đóng"
              className="shrink-0 text-muted-foreground transition hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải dùng bên trong <ToastProvider>.");
  return ctx;
}
