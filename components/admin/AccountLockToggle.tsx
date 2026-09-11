"use client";

import { useTransition } from "react";
import { setAccountLockedAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function AccountLockToggle({
  id,
  email,
  locked,
}: {
  id: string;
  email: string;
  locked: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    if (!locked) {
      const ok = await confirm({
        title: `Khoá tài khoản "${email}"?`,
        description: "Tài khoản sẽ không đăng nhập được cho tới khi bạn mở khoá lại.",
        confirmLabel: "Khoá",
        danger: true,
      });
      if (!ok) return;
    }

    startTransition(async () => {
      loading.show(locked ? "Đang mở khoá..." : "Đang khoá tài khoản...");
      try {
        const result = await setAccountLockedAction(id, !locked);
        if (result.error) toast.error(result.error);
        else toast.success(locked ? "Đã mở khoá tài khoản." : "Đã khoá tài khoản.");
      } catch {
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        loading.hide();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
        locked
          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          : "bg-status-available/10 text-status-available"
      }`}
    >
      {locked ? "Đã khoá" : "Đang hoạt động"}
    </button>
  );
}
