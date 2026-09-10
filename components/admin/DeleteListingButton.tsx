"use client";

import { useTransition } from "react";
import { deleteListingAction } from "@/app/admin/(dashboard)/listings/actions";

export default function DeleteListingButton({ code }: { code: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Xoá tin ${code}? Hành động này không thể hoàn tác.`)) return;
    startTransition(() => {
      deleteListingAction(code);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
    >
      Xoá
    </button>
  );
}
