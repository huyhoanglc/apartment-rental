"use client";

import { useTransition } from "react";
import { resetAccountMfaAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useReauth } from "@/components/admin/ReauthDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

/** Gỡ MFA của tài khoản khác — dùng khi họ mất thiết bị authenticator, không tự đăng nhập được nữa. */
export default function ResetMfaButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const reauth = useReauth();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await reauth({
      title: `Gỡ MFA của "${email}"?`,
      description:
        "Họ sẽ phải enroll lại MFA từ đầu ở lần đăng nhập kế tiếp. Chỉ dùng khi họ mất thiết bị authenticator. Nhập mã TOTP để xác nhận.",
      confirmLabel: "Gỡ MFA",
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang gỡ MFA...");
      try {
        const result = await resetAccountMfaAction(id, email);
        if (result.error) toast.error(result.error);
        else toast.success("Đã gỡ MFA — họ sẽ bị bắt enroll lại ở lần đăng nhập kế tiếp.");
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
      className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:cursor-wait disabled:opacity-50"
    >
      Gỡ MFA
    </button>
  );
}
