"use client";

import { useTransition } from "react";
import { togglePublishedAction } from "@/app/admin/(dashboard)/blog/actions";
import { useToast } from "@/components/admin/Toast";

export default function PublishedToggle({ slug, published }: { slug: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await togglePublishedAction(slug, !published);
      } catch {
        toast.error("Cập nhật trạng thái xuất bản thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
        published
          ? "bg-status-available/10 text-status-available"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {published ? "Đã xuất bản" : "Nháp"}
    </button>
  );
}
