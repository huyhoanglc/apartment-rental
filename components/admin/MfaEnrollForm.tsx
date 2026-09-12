"use client";

import { useState } from "react";
import { enrollMfaAction, verifyMfaEnrollAction } from "@/app/admin/mfa/actions";

interface MfaEnrollFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

/** Enroll TOTP: bấm bắt đầu -> hiện QR + secret -> nhập mã 6 số để xác nhận. */
export default function MfaEnrollForm({ onSuccess, onCancel }: MfaEnrollFormProps) {
  const [factor, setFactor] = useState<{ factorId: string; qrCode: string; secret: string } | null>(
    null
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleStart() {
    setError(null);
    setPending(true);
    try {
      const result = await enrollMfaAction();
      if (result.error || !result.factorId || !result.qrCode || !result.secret) {
        setError(result.error ?? "Không khởi tạo được MFA, vui lòng thử lại.");
        return;
      }
      setFactor({ factorId: result.factorId, qrCode: result.qrCode, secret: result.secret });
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factor) return;
    setError(null);
    setPending(true);
    try {
      const result = await verifyMfaEnrollAction(factor.factorId, code);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess();
    } finally {
      setPending(false);
    }
  }

  if (!factor) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Cài app xác thực (Google Authenticator, Authy...) trước khi bắt đầu — bước tiếp theo sẽ
          hiện mã QR để quét.
        </p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={pending}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {pending ? "Đang tạo..." : "Bắt đầu bật MFA"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Huỷ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quét mã QR bằng app authenticator, hoặc nhập tay mã bí mật bên dưới.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={factor.qrCode} alt="Mã QR xác thực 2 lớp" className="h-40 w-40 rounded-lg border border-border bg-white p-2" />
      <p className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
        {factor.secret}
      </p>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mã 6 số từ app authenticator
        </label>
        <input
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1.5 w-full max-w-[10rem] rounded-lg border border-border bg-background px-3.5 py-2.5 text-center text-lg tracking-widest text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Đang xác nhận..." : "Xác nhận & bật MFA"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
