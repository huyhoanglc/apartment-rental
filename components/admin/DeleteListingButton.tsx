"use client";

import { useTransition } from "react";
import { deleteListingAction } from "@/app/admin/(dashboard)/listings/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function DeleteListingButton({ code }: { code: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: `Xoá tin ${code}?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang xoá tin...");
      try {
        await deleteListingAction(code);
        toast.success("Đã xoá tin.");
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
