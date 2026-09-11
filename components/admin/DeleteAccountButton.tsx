"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/admin/(dashboard)/accounts/actions";

export default function DeleteAccountButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Xoá tài khoản "${email}"? Hành động này không thể hoàn tác.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
      >
        Xoá
      </button>
      {error && <p className="mt-1 max-w-xs text-xs text-rose-600">{error}</p>}
    </div>
  );
}
