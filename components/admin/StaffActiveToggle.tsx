"use client";

import { useTransition } from "react";
import { toggleStaffActiveAction } from "@/app/admin/(dashboard)/staff/actions";

export default function StaffActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleStaffActiveAction(id, !active))}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
        active ? "bg-status-available/10 text-status-available" : "bg-muted text-muted-foreground"
      }`}
    >
      {active ? "Đang làm việc" : "Đã nghỉ"}
    </button>
  );
}
