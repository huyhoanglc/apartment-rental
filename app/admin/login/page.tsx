import GoogleLoginButton from "@/components/admin/GoogleLoginButton";
import { login } from "./actions";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        <div className="p-6">
          <div className="flex items-center gap-2 text-lg font-bold text-primary-700 dark:text-primary-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-sm">
              TT
            </span>
            Đăng nhập quản trị
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Dành cho quản trị viên Tổ Thuê TP.HCM.</p>

          <div className="mt-6">
            <GoogleLoginButton />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            hoặc dùng email/mật khẩu
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={login} className="space-y-4">
            <div>
              <label className={LABEL}>Email</label>
              <input type="email" name="email" required className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Mật khẩu</label>
              <input type="password" name="password" required className={FIELD} />
            </div>

            {searchParams.error === "config" && (
              <p className="text-sm text-rose-600">
                Chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY trong .env.local.
              </p>
            )}
            {searchParams.error === "1" && (
              <p className="text-sm text-rose-600">Đăng nhập thất bại, vui lòng thử lại.</p>
            )}
            {searchParams.error === "not_allowed" && (
              <p className="text-sm text-rose-600">
                Tài khoản Google này chưa được cấp quyền admin. Liên hệ quản trị viên để thêm vào
                danh sách cho phép.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
