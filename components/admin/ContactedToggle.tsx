"use client";

import { useTransition } from "react";
import { toggleLeadContactedAction } from "@/app/admin/(dashboard)/leads/actions";

export default function ContactedToggle({ id, contacted }: { id: string; contacted: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={contacted}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          toggleLeadContactedAction(id, e.target.checked);
        })
      }
      className="h-4 w-4 accent-primary-600 disabled:opacity-50"
    />
  );
}
