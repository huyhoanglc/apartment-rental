"use client";

import { useState, useTransition } from "react";
import { updateAccountRoleAction } from "@/app/admin/(dashboard)/accounts/actions";
import type { AdminRole } from "@/lib/admin/roles";

export default function AccountRoleSelect({
  id,
  role,
  isSelf,
}: {
  id: string;
  role: AdminRole;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return (
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        {role === "admin" ? "Admin" : "Cá nhân"} (bạn)
      </span>
    );
  }

  return (
    <div>
      <select
        value={role}
        disabled={isPending}
        onChange={(e) => {
          setError(null);
          const newRole = e.target.value as AdminRole;
          startTransition(async () => {
            const result = await updateAccountRoleAction(id, newRole);
            if (result.error) setError(result.error);
          });
        }}
        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
          role === "admin"
            ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
            : "border-border bg-muted text-muted-foreground"
        }`}
      >
        <option value="member">Cá nhân</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
