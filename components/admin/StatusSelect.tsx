"use client";

import { useTransition } from "react";
import { updateListingStatusAction } from "@/app/admin/(dashboard)/listings/actions";
import { LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/types";

export default function StatusSelect({ code, status }: { code: string; status: ListingStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updateListingStatusAction(code, e.target.value as ListingStatus);
        })
      }
      className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground disabled:opacity-50"
    >
      {Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
