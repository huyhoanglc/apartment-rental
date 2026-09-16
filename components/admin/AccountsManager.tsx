"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountLockToggle from "@/components/admin/AccountLockToggle";
import AccountRoleSelect from "@/components/admin/AccountRoleSelect";
import CreateAccountForm from "@/components/admin/CreateAccountForm";
import DeleteAccountButton from "@/components/admin/DeleteAccountButton";
import FormModal from "@/components/admin/FormModal";
import Pagination from "@/components/admin/Pagination";
import PermissionsMatrixEditor from "@/components/admin/PermissionsMatrixEditor";
import ResetMfaButton from "@/components/admin/ResetMfaButton";
import ResetPasswordButton from "@/components/admin/ResetPasswordButton";
import { useToast } from "@/components/admin/Toast";
import { formatVNDateTime } from "@/lib/formatDate";
import type { AdminAccount } from "@/lib/admin/accounts";
import type { AdminRole } from "@/lib/admin/roles";
import type { AdminRoleDef } from "@/lib/admin/rolePermissions";

interface AccountsManagerProps {
  accounts: AdminAccount[];
  total: number;
  page: number;
  pageSize: number;
  currentUserId: string | undefined;
  roles: AdminRoleDef[];
  permissions: Record<AdminRole, string[]>;
}

export default function AccountsManager({
  accounts,
  total,
  page,
  pageSize,
  currentUserId,
  roles,
  permissions,
}: AccountsManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  function handleSuccess() {
    setModalOpen(false);
    toast.success("Đã tạo tài khoản — gửi email/mật khẩu cho người dùng để họ đăng nhập.");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tài khoản đăng nhập ({total})</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quản lý ai đăng nhập được vào trang quản trị. Vai trò <strong>Admin</strong> luôn thấy
            toàn bộ mục quản trị; vai trò khác xem được trang nào do bảng phân quyền bên dưới quyết
            định.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm tài khoản
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Họ và tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">MFA</th>
              <th className="px-4 py-3">Đăng nhập gần nhất</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isSelf = account.id === currentUserId;
              return (
                <tr key={account.id} className="border-b border-border transition last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{account.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <AccountRoleSelect
                      id={account.id}
                      email={account.email}
                      role={account.role}
                      roles={roles}
                      isSelf={isSelf}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        account.locked
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          : "bg-status-available/10 text-status-available"
                      }`}
                    >
                      {account.locked ? "Đã khoá" : "Đang hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        account.has_mfa
                          ? "bg-status-available/10 text-status-available"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {account.has_mfa ? "Đã bật" : "Chưa bật"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.last_sign_in_at
                      ? formatVNDateTime(account.last_sign_in_at)
                      : "Chưa đăng nhập"}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex items-center gap-3">
                        <AccountLockToggle id={account.id} email={account.email} locked={account.locked} />
                        <ResetPasswordButton id={account.id} email={account.email} phone={account.phone} />
                        {account.has_mfa && <ResetMfaButton id={account.id} email={account.email} />}
                        <DeleteAccountButton id={account.id} email={account.email} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có tài khoản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/accounts" />
      </div>

      <PermissionsMatrixEditor roles={roles} permissions={permissions} />

      {modalOpen && (
        <FormModal title="Thêm tài khoản đăng nhập mới" onClose={() => setModalOpen(false)}>
          <CreateAccountForm roles={roles} onCancel={() => setModalOpen(false)} onSuccess={handleSuccess} />
        </FormModal>
      )}
    </div>
  );
}
