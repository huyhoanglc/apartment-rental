import SignOutOthersButton from "@/components/admin/SignOutOthersButton";
import { getLoginEvents, parseUserAgent } from "@/lib/admin/security";

export default async function AdminSecurityPage() {
  const events = await getLoginEvents();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Bảo mật</h1>
        <SignOutOthersButton />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        20 lần đăng nhập gần nhất của tài khoản bạn đang dùng.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl2 bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
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
