"use client";

import { useTransition } from "react";
import { signOutOtherDevices } from "@/app/admin/(dashboard)/security/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function SignOutOthersButton() {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: "Đăng xuất khỏi tất cả thiết bị khác?",
      description: "Các phiên đăng nhập khác (trình duyệt/thiết bị khác) sẽ bị đăng xuất ngay.",
      confirmLabel: "Đăng xuất",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang đăng xuất các thiết bị khác...");
      try {
        await signOutOtherDevices();
        toast.success("Đã đăng xuất khỏi các thiết bị khác.");
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
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
    >
      {isPending ? "Đang xử lý..." : "Đăng xuất khỏi tất cả thiết bị khác"}
    </button>
  );
}
