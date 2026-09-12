"use client";

import { useTransition } from "react";
import { deleteAccountAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useReauth } from "@/components/admin/ReauthDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function DeleteAccountButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const reauth = useReauth();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await reauth({
      title: `Xoá tài khoản "${email}"?`,
      description: "Hành động này không thể hoàn tác — nhập mã TOTP để xác nhận.",
      confirmLabel: "Xoá",
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang xoá tài khoản...");
      try {
        const result = await deleteAccountAction(id, email);
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
