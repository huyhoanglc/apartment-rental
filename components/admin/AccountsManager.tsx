"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountLockToggle from "@/components/admin/AccountLockToggle";
import AccountRoleSelect from "@/components/admin/AccountRoleSelect";
import CreateAccountForm from "@/components/admin/CreateAccountForm";
import DeleteAccountButton from "@/components/admin/DeleteAccountButton";
import FormModal from "@/components/admin/FormModal";
import ResetPasswordButton from "@/components/admin/ResetPasswordButton";
import { useToast } from "@/components/admin/Toast";
import { formatVNDateTime } from "@/lib/formatDate";
import type { AdminAccount } from "@/lib/admin/accounts";

interface AccountsManagerProps {
  accounts: AdminAccount[];
  currentUserId: string | undefined;
}

export default function AccountsManager({ accounts, currentUserId }: AccountsManagerProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tài khoản đăng nhập</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quản lý ai đăng nhập được vào trang quản trị. Vai trò <strong>Admin</strong> thấy toàn bộ
            mục quản trị; <strong>Cá nhân</strong> chỉ thấy Phòng, Dự án, Blog, Leads.
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

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Họ và tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
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
                    <AccountRoleSelect id={account.id} role={account.role} isSelf={isSelf} />
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.last_sign_in_at
                      ? formatVNDateTime(account.last_sign_in_at)
                      : "Chưa đăng nhập"}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex items-center gap-3">
                        <AccountLockToggle id={account.id} email={account.email} locked={account.locked} />
                        <ResetPasswordButton id={account.id} phone={account.phone} />
                        <DeleteAccountButton id={account.id} email={account.email} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có tài khoản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <FormModal title="Thêm tài khoản đăng nhập mới" onClose={() => setModalOpen(false)}>
          <CreateAccountForm onCancel={() => setModalOpen(false)} onSuccess={handleSuccess} />
        </FormModal>
      )}
    </div>
  );
}
