"use client";

import { useTransition } from "react";
import { resetAccountPasswordAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function ResetPasswordButton({ id, phone }: { id: string; phone: string | null }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  if (!phone) {
    return (
      <span className="text-sm text-muted-foreground" title="Chưa có số điện thoại để đặt mật khẩu mặc định">
        Reset MK
      </span>
    );
  }

  const validPhone = phone;

  async function handleClick() {
    const ok = await confirm({
      title: "Đặt lại mật khẩu?",
      description: `Mật khẩu sẽ đổi về số điện thoại "${validPhone}". Gửi số này cho người dùng để họ đăng nhập lại.`,
      confirmLabel: "Đặt lại",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang đặt lại mật khẩu...");
      try {
        const result = await resetAccountPasswordAction(id, validPhone);
        if (result.error) toast.error(result.error);
        else toast.success(`Đã đặt lại mật khẩu về "${validPhone}".`);
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
      className="text-sm font-medium text-primary-700 hover:underline disabled:opacity-50 dark:text-primary-300"
    >
      Reset MK
    </button>
  );
}
