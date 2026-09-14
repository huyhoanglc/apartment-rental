"use client";

import { useTransition } from "react";
import { updateAccountRoleAction } from "@/app/admin/(dashboard)/accounts/actions";
import { useReauth } from "@/components/admin/ReauthDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";
import { ADMIN_ROLE_KEY } from "@/lib/admin/adminRoleKey";
import type { AdminRole } from "@/lib/admin/roles";
import type { AdminRoleDef } from "@/lib/admin/rolePermissions";

export default function AccountRoleSelect({
  id,
  email,
  role,
  roles,
  isSelf,
}: {
  id: string;
  email: string;
  role: AdminRole;
  roles: AdminRoleDef[];
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const reauth = useReauth();
  const toast = useToast();
  const loading = useGlobalLoading();
  const label = (key: AdminRole) => roles.find((r) => r.key === key)?.label ?? key;

  if (isSelf) {
    return (
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
        {label(role)}
      </span>
    );
  }

  async function handleChange(newRole: AdminRole) {
    const ok = await reauth({
      title: `Đổi vai trò "${email}" thành ${label(newRole)}?`,
      description: "Nhập mã TOTP để xác nhận thay đổi quyền hạn.",
      confirmLabel: "Đổi vai trò",
    });
    if (!ok) return;

    startTransition(async () => {
      loading.show("Đang đổi vai trò...");
      try {
        const result = await updateAccountRoleAction(id, newRole, email);
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
      onChange={(e) => handleChange(e.target.value)}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold uppercase transition disabled:cursor-wait disabled:opacity-50 ${
        role === ADMIN_ROLE_KEY
          ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {roles.map((r) => (
        <option key={r.key} value={r.key}>
          {r.label}
        </option>
      ))}
    </select>
  );
}
