"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { verifyReauthMfaAction } from "@/app/admin/(dashboard)/actions";

interface ReauthOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
}

type ReauthFn = (options: ReauthOptions) => Promise<boolean>;

const ReauthContext = createContext<ReauthFn | null>(null);

/**
 * Popup yêu cầu nhập lại mã TOTP trước khi thực hiện 1 thao tác nhạy cảm
 * (xoá tài khoản, đổi vai trò, ép đăng xuất — xem plan bảo mật). Khác
 * ConfirmDialog.tsx (chỉ hỏi có/không): dialog này tự gọi
 * verifyReauthMfaAction ngay bên trong, sai mã thì báo lỗi và cho nhập lại
 * thay vì đóng popup, chỉ resolve(true) khi mã đúng.
 */
export function ReauthProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ReauthOptions | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const resolveRef = useRef<(value: boolean) => void>();

  const reauth = useCallback<ReauthFn>((opts) => {
    setOptions(opts);
    setCode("");
    setError(null);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function settle(value: boolean) {
    resolveRef.current?.(value);
    setOptions(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await verifyReauthMfaAction(code);
      if (!result.ok) {
        setError(result.error ?? "Mã xác thực không đúng.");
        setCode("");
        return;
      }
      settle(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <ReauthContext.Provider value={reauth}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => settle(false)} />
          <form
            onSubmit={handleSubmit}
            className="animate-dialog-in relative w-full max-w-sm rounded-xl2 border border-border bg-card p-6 shadow-xl"
          >
            <h2 className="text-base font-semibold text-foreground">{options.title}</h2>
            {options.description && (
              <p className="mt-2 text-sm text-muted-foreground">{options.description}</p>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mã xác thực 2 lớp (TOTP)
              </label>
              <input
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1.5 w-full max-w-[10rem] rounded-lg border border-border bg-background px-3.5 py-2.5 text-center text-lg tracking-widest text-foreground focus:border-primary-500 focus:outline-none"
              />
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={pending || code.length !== 6}
                autoFocus
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
              >
                {pending ? "Đang xác thực..." : options.confirmLabel ?? "Xác nhận"}
              </button>
            </div>
          </form>
        </div>
      )}
    </ReauthContext.Provider>
  );
}

export function useReauth(): ReauthFn {
  const ctx = useContext(ReauthContext);
  if (!ctx) throw new Error("useReauth phải dùng bên trong <ReauthProvider>.");
  return ctx;
}
