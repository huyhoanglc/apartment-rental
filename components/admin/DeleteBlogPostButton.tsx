"use client";

import { useTransition } from "react";
import { deleteBlogPostAction } from "@/app/admin/(dashboard)/blog/actions";

export default function DeleteBlogPostButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Xoá bài viết "${slug}"? Hành động này không thể hoàn tác.`)) return;
    startTransition(() => {
      deleteBlogPostAction(slug);
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
