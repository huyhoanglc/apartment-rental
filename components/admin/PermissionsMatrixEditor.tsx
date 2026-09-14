"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRolePermissionsAction } from "@/app/admin/(dashboard)/accounts/actions";
import { ADMIN_PAGES, ALWAYS_VISIBLE_PAGES } from "@/lib/admin/pages";
import { ALL_ROLES, ROLE_LABELS } from "@/components/admin/AdminNav";
import { useReauth } from "@/components/admin/ReauthDialog";
import { useToast } from "@/components/admin/Toast";
import type { AdminRole } from "@/lib/admin/roles";

interface PermissionsMatrixEditorProps {
  permissions: Record<AdminRole, string[]>;
}

const ALL_COLUMNS = [...ADMIN_PAGES, ...ALWAYS_VISIBLE_PAGES];
const ALWAYS_VISIBLE_HREFS = new Set(ALWAYS_VISIBLE_PAGES.map((p) => p.href));

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((href) => set.has(href));
}

export default function PermissionsMatrixEditor({ permissions }: PermissionsMatrixEditorProps) {
  const [pending, setPending] = useState<Record<AdminRole, string[]>>(permissions);
  const [savingRole, setSavingRole] = useState<AdminRole | null>(null);
  const reauth = useReauth();
  const toast = useToast();
  const router = useRouter();

  function toggle(role: AdminRole, href: string) {
    setPending((prev) => {
      const current = prev[role];
      const next = current.includes(href) ? current.filter((h) => h !== href) : [...current, href];
      return { ...prev, [role]: next };
    });
  }

  const dirtyRoles = ALL_ROLES.filter((role) => role !== "admin" && !sameSet(pending[role], permissions[role]));

  async function handleSave(role: AdminRole) {
    const ok = await reauth({
      title: `Đổi phân quyền vai trò "${ROLE_LABELS[role]}"?`,
      description: "Nhập mã TOTP để xác nhận — thay đổi áp dụng cho mọi tài khoản mang vai trò này.",
      confirmLabel: "Lưu phân quyền",
    });
    if (!ok) return;

    setSavingRole(role);
    try {
      const result = await updateRolePermissionsAction(role, pending[role]);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Đã lưu phân quyền.");
        router.refresh();
      }
    } finally {
      setSavingRole(null);
    }
  }

  function handleReset(role: AdminRole) {
    setPending((prev) => ({ ...prev, [role]: permissions[role] }));
  }

  return (
    <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
      <h2 className="text-sm font-semibold text-foreground">Bảng phân quyền</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Vai trò nào xem được trang nào trong khu quản trị — tích/bỏ tích rồi bấm Lưu. Admin luôn
        toàn quyền, không chỉnh được.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Vai trò</th>
              {ALL_COLUMNS.map((page) => (
                <th key={page.href} className="whitespace-nowrap px-4 py-3 text-center">
                  {page.label}
                </th>
              ))}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ALL_ROLES.map((role) => {
              const isAdminRow = role === "admin";
              const isDirty = dirtyRoles.includes(role);
              return (
                <tr key={role} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{ROLE_LABELS[role]}</td>
                  {ALL_COLUMNS.map((page) => {
                    const locked = isAdminRow || ALWAYS_VISIBLE_HREFS.has(page.href);
                    const checked = locked ? true : pending[role].includes(page.href);
                    return (
                      <td key={page.href} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={locked || savingRole === role}
                          onChange={() => toggle(role, page.href)}
                          className="h-4 w-4 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`${ROLE_LABELS[role]} xem ${page.label}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    {!isAdminRow && isDirty && (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleReset(role)}
                          disabled={savingRole === role}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          Huỷ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(role)}
                          disabled={savingRole === role}
                          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                        >
                          {savingRole === role ? "Đang lưu..." : "Lưu"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
