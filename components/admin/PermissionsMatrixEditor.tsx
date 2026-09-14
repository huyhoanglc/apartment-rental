"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRoleAction, updateRolePermissionsAction } from "@/app/admin/(dashboard)/accounts/actions";
import { ADMIN_PAGES, ALWAYS_VISIBLE_PAGES } from "@/lib/admin/pages";
import { ADMIN_ROLE_KEY } from "@/lib/admin/adminRoleKey";
import type { AdminRole } from "@/lib/admin/roles";
import type { AdminRoleDef } from "@/lib/admin/rolePermissions";
import FormModal from "@/components/admin/FormModal";
import { useReauth } from "@/components/admin/ReauthDialog";
import { useToast } from "@/components/admin/Toast";

interface PermissionsMatrixEditorProps {
  roles: AdminRoleDef[];
  permissions: Record<AdminRole, string[]>;
}

const ALL_COLUMNS = [...ADMIN_PAGES, ...ALWAYS_VISIBLE_PAGES];
const ALWAYS_VISIBLE_HREFS = new Set(ALWAYS_VISIBLE_PAGES.map((p) => p.href));

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((href) => set.has(href));
}

export default function PermissionsMatrixEditor({ roles, permissions }: PermissionsMatrixEditorProps) {
  const [pending, setPending] = useState<Record<AdminRole, string[]>>(permissions);
  const [savingRole, setSavingRole] = useState<AdminRole | null>(null);
  const [addingRole, setAddingRole] = useState(false);
  const reauth = useReauth();
  const toast = useToast();
  const router = useRouter();

  // permissions đến từ Server Component (accounts/page.tsx) — router.refresh()
  // sau khi lưu/thêm role sẽ fetch lại và truyền prop mới xuống, đồng bộ lại
  // state cục bộ theo dữ liệu thật từ server.
  useEffect(() => {
    setPending(permissions);
  }, [permissions]);

  function toggle(role: AdminRole, href: string) {
    setPending((prev) => {
      const current = prev[role] ?? [];
      const next = current.includes(href) ? current.filter((h) => h !== href) : [...current, href];
      return { ...prev, [role]: next };
    });
  }

  const editableRoles = roles.filter((r) => r.key !== ADMIN_ROLE_KEY);
  const dirtyRoles = editableRoles.filter((r) => !sameSet(pending[r.key] ?? [], permissions[r.key] ?? []));

  async function handleSave(role: AdminRoleDef) {
    const ok = await reauth({
      title: `Đổi phân quyền vai trò "${role.label}"?`,
      description: "Nhập mã TOTP để xác nhận — thay đổi áp dụng cho mọi tài khoản mang vai trò này.",
      confirmLabel: "Lưu phân quyền",
    });
    if (!ok) return;

    setSavingRole(role.key);
    try {
      const result = await updateRolePermissionsAction(role.key, pending[role.key] ?? []);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Đã lưu phân quyền.");
        router.refresh();
      }
    } finally {
      setSavingRole(null);
    }
  }

  function handleReset(role: AdminRoleDef) {
    setPending((prev) => ({ ...prev, [role.key]: permissions[role.key] ?? [] }));
  }

  return (
    <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Bảng phân quyền</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vai trò nào xem được trang nào trong khu quản trị — tích/bỏ tích rồi bấm Lưu. Admin luôn
            toàn quyền, không chỉnh được.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddingRole(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm role
        </button>
      </div>

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
            {roles.map((role) => {
              const isAdminRow = role.key === ADMIN_ROLE_KEY;
              const isDirty = dirtyRoles.some((r) => r.key === role.key);
              return (
                <tr key={role.key} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{role.label}</td>
                  {ALL_COLUMNS.map((page) => {
                    const locked = isAdminRow || ALWAYS_VISIBLE_HREFS.has(page.href);
                    const checked = locked ? true : (pending[role.key] ?? []).includes(page.href);
                    return (
                      <td key={page.href} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={locked || savingRole === role.key}
                          onChange={() => toggle(role.key, page.href)}
                          className="h-4 w-4 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`${role.label} xem ${page.label}`}
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
                          disabled={savingRole === role.key}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          Huỷ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(role)}
                          disabled={savingRole === role.key}
                          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                        >
                          {savingRole === role.key ? "Đang lưu..." : "Lưu"}
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

      {addingRole && (
        <AddRoleModal
          onClose={() => setAddingRole(false)}
          onSuccess={() => {
            setAddingRole(false);
            toast.success("Đã thêm vai trò — mặc định chưa xem được trang nào, tích quyền rồi Lưu.");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddRoleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await createRoleAction(label);
      if (result.error) setError(result.error);
      else onSuccess();
    } finally {
      setPending(false);
    }
  }

  return (
    <FormModal title="Thêm vai trò mới" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tên vai trò *
            </label>
            <input
              autoFocus
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Vd: Kế toán"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Mặc định chưa xem được trang nào — tích quyền ở bảng phân quyền sau khi tạo.
            </p>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
          >
            {pending ? "Đang tạo..." : "Tạo vai trò"}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
