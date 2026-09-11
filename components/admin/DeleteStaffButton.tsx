"use client";

import { useTransition } from "react";
import { deleteStaffAction } from "@/app/admin/(dashboard)/staff/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: `Xoá nhân viên "${name}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang xoá nhân viên...");
      try {
        await deleteStaffAction(id);
        toast.success("Đã xoá nhân viên.");
      } catch {
        toast.error("Xoá thất bại, vui lòng thử lại.");
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
      className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
    >
      Xoá
    </button>
  );
}
