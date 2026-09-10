"use client";

import { useTransition } from "react";
import { signOutOtherDevices } from "@/app/admin/(dashboard)/security/actions";

export default function SignOutOthersButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Đăng xuất khỏi tất cả thiết bị/trình duyệt khác?")) return;
    startTransition(() => {
      signOutOtherDevices();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
    >
      {isPending ? "Đang xử lý..." : "Đăng xuất khỏi tất cả thiết bị khác"}
    </button>
  );
}
