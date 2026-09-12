"use client";

import { useState } from "react";
import { verifyMfaChallengeAction } from "@/app/admin/mfa/actions";

/** Step-up: nhập lại mã TOTP khi session ở aal1 nhưng đã có factor verified. */
export default function MfaChallengeForm({
  factorId,
  onSuccess,
}: {
  factorId: string;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await verifyMfaChallengeAction(factorId, code);
      if (result.error) {
        setError(result.error);
        setCode("");
        return;
      }
      onSuccess();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mã 6 số từ app authenticator
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
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Đang xác nhận..." : "Xác nhận"}
      </button>
    </form>
  );
}
