"use client";

import ForceLogoutButton from "@/components/admin/ForceLogoutButton";
import { formatVNDateTime } from "@/lib/formatDate";
import type { AdminAccount } from "@/lib/admin/accounts";

interface SessionsManagerProps {
  accounts: AdminAccount[];
  currentUserId: string | undefined;
}

export default function SessionsManager({ accounts, currentUserId }: SessionsManagerProps) {
  return (
    <div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Phiên đăng nhập</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Theo dõi lần đăng nhập gần nhất của từng tài khoản và ép đăng xuất phiên đang hoạt động khi cần.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Họ và tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Đăng nhập gần nhất</th>
              <th className="px-4 py-3">Trạng thái tài khoản</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isSelf = account.id === currentUserId;
              const hasActiveSession = Boolean(account.last_sign_in_at) && !account.locked;
              return (
                <tr key={account.id} className="border-b border-border transition last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{account.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.last_sign_in_at ? formatVNDateTime(account.last_sign_in_at) : "Chưa đăng nhập"}
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
                    {!isSelf && hasActiveSession && <ForceLogoutButton id={account.id} email={account.email} />}
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có tài khoản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
