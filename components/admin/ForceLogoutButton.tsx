"use client";

import { useTransition } from "react";
import { forceLogoutAction } from "@/app/admin/(dashboard)/sessions/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function ForceLogoutButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: `Ép đăng xuất "${email}"?`,
      description:
        "Phiên đăng nhập hiện tại của người này sẽ bị vô hiệu ngay — họ cần đăng nhập lại ở lần thao tác/tải trang tiếp theo. Tài khoản không bị khoá, vẫn đăng nhập lại được bình thường.",
      confirmLabel: "Ép đăng xuất",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang ép đăng xuất...");
      try {
        const result = await forceLogoutAction(id);
        if (result.error) toast.error(result.error);
        else toast.success("Đã ép đăng xuất — phiên hiện tại của họ đã bị vô hiệu.");
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
      className="text-sm font-medium text-rose-600 hover:underline disabled:cursor-wait disabled:opacity-50"
    >
      Ép đăng xuất
    </button>
  );
}
