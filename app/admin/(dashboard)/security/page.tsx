import LinkGoogleButton from "@/components/admin/LinkGoogleButton";
import SignOutOthersButton from "@/components/admin/SignOutOthersButton";
import { createClient } from "@/lib/supabase/server";
import { getLoginEvents, parseUserAgent } from "@/lib/admin/security";
import { requireAdminPage } from "@/lib/admin/roles";

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email/mật khẩu",
  google: "Google",
};

export default async function AdminSecurityPage() {
  await requireAdminPage();
  const supabase = createClient();
  const [events, identitiesResult] = await Promise.all([
    getLoginEvents(),
    supabase.auth.getUserIdentities(),
  ]);

  const linkedProviders = (identitiesResult.data?.identities ?? []).map((i) => i.provider);
  const hasGoogle = linkedProviders.includes("google");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Bảo mật</h1>
        <SignOutOthersButton />
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

      <p className="mt-6 text-sm text-muted-foreground">20 lần đăng nhập gần nhất của tài khoản bạn đang dùng.</p>

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
