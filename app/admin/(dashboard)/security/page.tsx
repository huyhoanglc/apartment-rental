import LinkGoogleButton from "@/components/admin/LinkGoogleButton";
import ProfileForm from "@/components/admin/ProfileForm";
import SignOutOthersButton from "@/components/admin/SignOutOthersButton";
import { createClient } from "@/lib/supabase/server";
import { getLoginEvents, parseUserAgent } from "@/lib/admin/security";
import { countListingsCreatedBy } from "@/lib/admin/listings";

// Không chặn theo role: trang này chỉ hiện thông tin của CHÍNH tài khoản
// đang đăng nhập (hồ sơ, lịch sử đăng nhập, phương thức liên kết) — không
// phải quản trị người khác, nên cả Admin lẫn Cá nhân đều tự quản lý được.
// Menu "Hồ sơ" và "Cài đặt" ở dropdown tài khoản đều dẫn về đây.

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect width="24" height="24" rx="6" fill="#0068FF" />
      <path
        fill="#fff"
        d="M6 8.25h5.4v1.2H7.9l3.6 4.05v1.2H6v-1.2h3.7L6 9.45V8.25Zm7.2 0h1.35v6.45H13.2V8.25Zm2.85 1.8c1.25 0 2.2.98 2.2 2.32 0 1.35-.95 2.33-2.2 2.33S16 13.72 16 12.37c0-1.34.95-2.32 2.05-2.32Zm0 1.13c-.6 0-1.02.5-1.02 1.19 0 .7.42 1.2 1.02 1.2s1.02-.5 1.02-1.2c0-.69-.42-1.19-1.02-1.19Z"
      />
    </svg>
  );
}

export default async function AdminSecurityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [events, identitiesResult, listingsCount] = await Promise.all([
    getLoginEvents(),
    supabase.auth.getUserIdentities(),
    user ? countListingsCreatedBy(user.id) : Promise.resolve(0),
  ]);

  const email = user?.email ?? "";
  const fullName =
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    email;
  const avatarUrl =
    (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ??
    (typeof user?.user_metadata?.picture === "string" ? user.user_metadata.picture : null);
  const dateOfBirth = typeof user?.user_metadata?.date_of_birth === "string" ? user.user_metadata.date_of_birth : null;
  const position = typeof user?.user_metadata?.position === "string" ? user.user_metadata.position : null;
  const employmentType =
    typeof user?.user_metadata?.employment_type === "string" ? user.user_metadata.employment_type : null;
  const startDate = typeof user?.user_metadata?.start_date === "string" ? user.user_metadata.start_date : null;

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
          <ProfileForm
            email={email}
            fullName={fullName}
            avatarUrl={avatarUrl}
            dateOfBirth={dateOfBirth}
            position={position}
            employmentType={employmentType}
            startDate={startDate}
            listingsCount={listingsCount}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Phương thức đăng nhập</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <GoogleIcon className="h-6 w-6 shrink-0" />
              <span className="text-sm font-medium text-foreground">Google</span>
            </div>
            {hasGoogle ? (
              <span className="text-xs font-semibold text-status-available">Đã kích hoạt</span>
            ) : (
              <LinkGoogleButton />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <ZaloIcon className="h-6 w-6 shrink-0" />
              <span className="text-sm font-medium text-foreground">Zalo</span>
            </div>
            <span className="text-xs text-muted-foreground">Tính năng đang cập nhật</span>
          </div>
        </div>
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
