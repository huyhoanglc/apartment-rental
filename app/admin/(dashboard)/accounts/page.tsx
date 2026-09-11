import AccountRoleSelect from "@/components/admin/AccountRoleSelect";
import CreateAccountForm from "@/components/admin/CreateAccountForm";
import DeleteAccountButton from "@/components/admin/DeleteAccountButton";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requireAdminPage } from "@/lib/admin/roles";
import { createClient } from "@/lib/supabase/server";

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email/mật khẩu",
  google: "Google",
};

export default async function AdminAccountsPage() {
  await requireAdminPage();

  const supabase = createClient();
  const [accounts, { data: { user: currentUser } }] = await Promise.all([
    getAdminAccounts(),
    supabase.auth.getUser(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Tài khoản đăng nhập</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Quản lý ai đăng nhập được vào trang quản trị. Vai trò <strong>Admin</strong> thấy toàn bộ
        mục quản trị; <strong>Cá nhân</strong> chỉ thấy Phòng, Dự án, Blog, Leads.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Cách đăng nhập</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Đăng nhập gần nhất</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-border transition last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{account.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.providers.map((p) => PROVIDER_LABELS[p] ?? p).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AccountRoleSelect
                      id={account.id}
                      role={account.role}
                      isSelf={account.id === currentUser?.id}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.last_sign_in_at
                      ? new Date(account.last_sign_in_at).toLocaleString("vi-VN")
                      : "Chưa đăng nhập"}
                  </td>
                  <td className="px-4 py-3">
                    {account.id !== currentUser?.id && (
                      <DeleteAccountButton id={account.id} email={account.email} />
                    )}
                  </td>
                </tr>
              ))}
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

        <CreateAccountForm />
      </div>
    </div>
  );
}
