import { redirect } from "next/navigation";
import { hasVerifiedMfa } from "@/lib/admin/mfa";
import { logout } from "@/app/admin/(dashboard)/actions";
import MfaSetupClient from "./MfaSetupClient";

/**
 * Bắt buộc bật MFA cho role Admin (không có nút bỏ qua) — middleware.ts đưa
 * admin chưa có factor verified về đây trước khi cho vào /admin. Member tự
 * bật MFA (tuỳ chọn) qua card trong /admin/security, không qua trang này.
 */
export default async function MfaSetupPage() {
  if (await hasVerifiedMfa()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl2 border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-lg font-bold text-primary-700 dark:text-primary-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-sm">
            TT
          </span>
          Bật xác thực 2 lớp
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Tài khoản Admin bắt buộc bật xác thực 2 lớp (TOTP) trước khi vào được trang quản trị.
        </p>

        <div className="mt-6">
          <MfaSetupClient />
        </div>

        <form action={logout} className="mt-4 border-t border-border pt-4">
          <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Đăng xuất, đăng nhập lại tài khoản khác
          </button>
        </form>
      </div>
    </div>
  );
}
