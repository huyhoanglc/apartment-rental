"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true = nút xác nhận màu đỏ (dùng cho xoá/thoát phiên...). */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Popup xác nhận hành động — thay cho window.confirm() (không style được,
 * không đồng bộ với theme sáng/tối, trên 1 số trình duyệt còn bị chặn).
 * Trả về Promise<boolean> giống window.confirm nên chỉ cần thêm `await`
 * trước lời gọi useConfirm() là dùng được ngay ở chỗ đang gọi window.confirm.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(value: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function settle(value: boolean) {
    resolveRef.current?.(value);
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => settle(false)} />
          <div className="animate-dialog-in relative w-full max-w-sm rounded-xl2 border border-border bg-card p-6 shadow-xl">
            <h2 className="text-base font-semibold text-foreground">{options.title}</h2>
            {options.description && (
              <p className="mt-2 text-sm text-muted-foreground">{options.description}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {options.cancelLabel ?? "Huỷ"}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                autoFocus
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                  options.danger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {options.confirmLabel ?? "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm phải dùng bên trong <ConfirmProvider>.");
  return ctx;
}
