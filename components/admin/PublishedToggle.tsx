"use client";

import { useTransition } from "react";
import { togglePublishedAction } from "@/app/admin/(dashboard)/blog/actions";

export default function PublishedToggle({ slug, published }: { slug: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => togglePublishedAction(slug, !published))}
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
