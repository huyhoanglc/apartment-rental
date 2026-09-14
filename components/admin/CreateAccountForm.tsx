"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createAccountAction, type CreateAccountState } from "@/app/admin/(dashboard)/accounts/actions";
import { ADMIN_ROLE_KEY } from "@/lib/admin/adminRoleKey";
import type { AdminRoleDef } from "@/lib/admin/rolePermissions";

interface CreateAccountFormProps {
  roles: AdminRoleDef[];
  onCancel: () => void;
  onSuccess: () => void;
}

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang tạo..." : "Tạo tài khoản"}
    </button>
  );
}

export default function CreateAccountForm({ roles, onCancel, onSuccess }: CreateAccountFormProps) {
  const [state, formAction] = useFormState<CreateAccountState, FormData>(createAccountAction, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  // Admin luôn để cuối danh sách — vai trò mặc định chọn sẵn nên là 1 vai trò
  // hạn chế hơn (member/role tự thêm), không phải Admin.
  const nonAdminRoles = roles.filter((r) => r.key !== ADMIN_ROLE_KEY);
  const adminRole = roles.find((r) => r.key === ADMIN_ROLE_KEY);
  const orderedRoles = [...nonAdminRoles, ...(adminRole ? [adminRole] : [])];
  const defaultRole = nonAdminRoles[0]?.key ?? ADMIN_ROLE_KEY;

  return (
    <form action={formAction}>
      <div className="space-y-4 p-6">
        <div>
          <label className={LABEL}>Họ và tên *</label>
          <input type="text" name="full_name" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" name="email" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Số điện thoại *</label>
          <input type="tel" name="phone" required className={FIELD} />
          <p className="mt-1.5 text-xs text-muted-foreground">Dùng làm mật khẩu mặc định khi cần &quot;Reset mật khẩu&quot;.</p>
        </div>
        <div>
          <label className={LABEL}>Mật khẩu *</label>
          <input type="password" name="password" required minLength={8} className={FIELD} />
          <p className="mt-1.5 text-xs text-muted-foreground">Ít nhất 8 ký tự.</p>
        </div>
        <div>
          <label className={LABEL}>Vai trò *</label>
          <select name="role" required defaultValue={defaultRole} className={FIELD}>
            {orderedRoles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.key === ADMIN_ROLE_KEY ? `${r.label} — toàn quyền` : r.label}
              </option>
            ))}
          </select>
        </div>

        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Huỷ
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
