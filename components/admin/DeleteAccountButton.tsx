"use client";

import { useTransition } from "react";
import { deleteAccountAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function DeleteAccountButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: `Xoá tài khoản "${email}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang xoá tài khoản...");
      try {
        const result = await deleteAccountAction(id);
        if (result.error) toast.error(result.error);
        else toast.success("Đã xoá tài khoản.");
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
      className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
    >
      Xoá
    </button>
  );
}
