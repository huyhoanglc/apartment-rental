"use client";

import { useTransition } from "react";
import { toggleLeadContactedAction } from "@/app/admin/(dashboard)/leads/actions";
import { useToast } from "@/components/admin/Toast";

export default function ContactedToggle({ id, contacted }: { id: string; contacted: boolean }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      try {
        await toggleLeadContactedAction(id, checked);
      } catch {
        toast.error("Cập nhật trạng thái liên hệ thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <input
      type="checkbox"
      checked={contacted}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.checked)}
      className="h-4 w-4 accent-primary-600 disabled:opacity-50"
    />
  );
}
