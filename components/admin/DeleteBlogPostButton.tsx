"use client";

import { useTransition } from "react";
import { deleteBlogPostAction } from "@/app/admin/(dashboard)/blog/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

export default function DeleteBlogPostButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();

  async function handleClick() {
    const ok = await confirm({
      title: `Xoá bài viết "${slug}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang xoá bài viết...");
      try {
        await deleteBlogPostAction(slug);
        toast.success("Đã xoá bài viết.");
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
