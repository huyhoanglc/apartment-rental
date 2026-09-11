"use client";

import { useTransition } from "react";
import { updateListingStatusAction } from "@/app/admin/(dashboard)/listings/actions";
import { useToast } from "@/components/admin/Toast";
import { LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/types";

const STATUS_STYLES: Record<ListingStatus, string> = {
  con_phong: "bg-status-available/10 text-status-available border-status-available/30",
  hot: "bg-status-hot/10 text-status-hot border-status-hot/30",
  het_phong: "bg-status-full/10 text-status-full border-status-full/30",
};

export default function StatusSelect({ code, status }: { code: string; status: ListingStatus }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleChange(newStatus: ListingStatus) {
    startTransition(async () => {
      try {
        await updateListingStatusAction(code, newStatus);
      } catch {
        toast.error("Cập nhật trạng thái thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as ListingStatus)}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${STATUS_STYLES[status]}`}
    >
      {Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value} className="bg-card text-foreground">
          {label}
        </option>
      ))}
    </select>
  );
}
