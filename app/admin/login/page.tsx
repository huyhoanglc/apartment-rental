import GoogleLoginButton from "@/components/admin/GoogleLoginButton";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; email?: string };
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

          <LoginForm defaultEmail={searchParams.email ?? ""}>
            {searchParams.error === "config" && (
              <p className="text-sm text-rose-600">
                Chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY trong .env.local.
              </p>
            )}
            {searchParams.error === "wrong_email" && (
              <p className="text-sm text-rose-600">Email không tồn tại, vui lòng kiểm tra lại.</p>
            )}
            {searchParams.error === "wrong_password" && (
              <p className="text-sm text-rose-600">Sai mật khẩu, vui lòng thử lại.</p>
            )}
            {searchParams.error === "1" && (
              <p className="text-sm text-rose-600">Đăng nhập thất bại, vui lòng thử lại.</p>
            )}
            {searchParams.error === "oauth_failed" && (
              <p className="text-sm text-rose-600">Đăng nhập Google thất bại, vui lòng thử lại.</p>
            )}
            {searchParams.error === "not_allowed" && (
              <p className="text-sm text-rose-600">
                Tài khoản Google này chưa được cấp quyền admin. Liên hệ quản trị viên để thêm vào
                danh sách cho phép.
              </p>
            )}
            {searchParams.error === "locked" && (
              <p className="text-sm text-rose-600">
                Đã sai mật khẩu quá 5 lần liên tiếp — tài khoản tạm khoá đăng nhập 15 phút, vui
                lòng thử lại sau.
              </p>
            )}
          </LoginForm>
        </div>
      </div>
    </div>
  );
}
