import LinkGoogleButton from "@/components/admin/LinkGoogleButton";
import ProfileForm from "@/components/admin/ProfileForm";
import SignOutOthersButton from "@/components/admin/SignOutOthersButton";
import { createClient } from "@/lib/supabase/server";
import { getLoginEvents, parseUserAgent } from "@/lib/admin/security";

// Không chặn theo role: trang này chỉ hiện thông tin của CHÍNH tài khoản
// đang đăng nhập (hồ sơ, lịch sử đăng nhập, phương thức liên kết) — không
// phải quản trị người khác, nên cả Admin lẫn Cá nhân đều tự quản lý được.
// Menu "Hồ sơ" và "Cài đặt" ở dropdown tài khoản đều dẫn về đây.
const PROVIDER_LABELS: Record<string, string> = {
  email: "Email/mật khẩu",
  google: "Google",
};

export default async function AdminSecurityPage() {
  const supabase = createClient();
  const [
    {
      data: { user },
    },
    events,
    identitiesResult,
  ] = await Promise.all([supabase.auth.getUser(), getLoginEvents(), supabase.auth.getUserIdentities()]);

  const email = user?.email ?? "";
  const fullName =
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    email;
  const avatarUrl =
    (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ??
    (typeof user?.user_metadata?.picture === "string" ? user.user_metadata.picture : null);

  const linkedProviders = (identitiesResult.data?.identities ?? []).map((i) => i.provider);
  const hasGoogle = linkedProviders.includes("google");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tài khoản của tôi</h1>
        <SignOutOthersButton />
      </div>

      <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Hồ sơ</h2>
        <div className="mt-3">
          <ProfileForm email={email} fullName={fullName} avatarUrl={avatarUrl} />
        </div>
      </div>

      <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Phương thức đăng nhập</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tài khoản của bạn đang đăng nhập được bằng:{" "}
          {linkedProviders.map((p) => PROVIDER_LABELS[p] ?? p).join(", ")}.
        </p>
        {!hasGoogle && (
          <div className="mt-3">
            <LinkGoogleButton />
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Lịch sử đăng nhập</h2>
        <p className="mt-1 text-sm text-muted-foreground">20 lần đăng nhập gần nhất của tài khoản bạn đang dùng.</p>
      </div>

      <div className="mt-2 overflow-x-auto rounded-xl2 border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Thiết bị</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {new Date(event.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-foreground">{parseUserAgent(event.user_agent)}</td>
                <td className="px-4 py-3 text-muted-foreground">{event.ip_address ?? "—"}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có lịch sử đăng nhập.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
