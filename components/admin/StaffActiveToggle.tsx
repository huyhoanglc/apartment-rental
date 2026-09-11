"use client";

import { useTransition } from "react";
import { toggleStaffActiveAction } from "@/app/admin/(dashboard)/staff/actions";
import { useToast } from "@/components/admin/Toast";

export default function StaffActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await toggleStaffActiveAction(id, !active);
      } catch {
        toast.error("Cập nhật trạng thái nhân viên thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
        active ? "bg-status-available/10 text-status-available" : "bg-muted text-muted-foreground"
      }`}
    >
      {active ? "Đang làm việc" : "Đã nghỉ"}
    </button>
  );
}
