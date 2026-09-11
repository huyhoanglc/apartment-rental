"use client";

import { useTransition } from "react";
import { updateAccountRoleAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";
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
  const toast = useToast();
  const loading = useGlobalLoading();

  if (isSelf) {
    return (
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        {role === "admin" ? "Admin" : "Cá nhân"} (bạn)
      </span>
    );
  }

  function handleChange(newRole: AdminRole) {
    startTransition(async () => {
      loading.show("Đang đổi vai trò...");
      try {
        const result = await updateAccountRoleAction(id, newRole);
        if (result.error) toast.error(result.error);
        else toast.success("Đã đổi vai trò.");
      } catch {
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        loading.hide();
      }
    });
  }

  return (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as AdminRole)}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
        role === "admin"
          ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      <option value="member">Cá nhân</option>
      <option value="admin">Admin</option>
    </select>
  );
}
