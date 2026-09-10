"use client";

import { useTransition } from "react";
import { deleteStaffAction } from "@/app/admin/(dashboard)/staff/actions";

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Xoá nhân viên "${name}"? Hành động này không thể hoàn tác.`)) return;
    startTransition(() => {
      deleteStaffAction(id);
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
