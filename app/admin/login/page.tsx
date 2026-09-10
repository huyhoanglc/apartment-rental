import { login } from "./actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl2 bg-card p-6 shadow-card">
        <h1 className="text-xl font-bold text-foreground">Đăng nhập quản trị</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dành cho quản trị viên Tổ Thuê TP.HCM.
        </p>

        <form action={login} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
            />
          </div>

          {searchParams.error === "config" && (
            <p className="text-sm text-rose-600">
              Chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY trong .env.local.
            </p>
          )}
          {searchParams.error === "1" && (
            <p className="text-sm text-rose-600">Email hoặc mật khẩu không đúng.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
