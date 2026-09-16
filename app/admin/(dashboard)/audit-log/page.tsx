import Pagination from "@/components/admin/Pagination";
import { getSecurityAuditLog } from "@/lib/admin/security";
import { requirePageAccess } from "@/lib/admin/rolePermissions";
import { formatVNDateTime } from "@/lib/formatDate";

const PAGE_SIZE = 20;

const EVENT_LABELS: Record<string, string> = {
  login_blocked_rate_limit: "Chặn đăng nhập (rate limit)",
  login_blocked_not_allowed: "Chặn đăng nhập Google (không trong allowlist)",
  account_locked_auto: "Tự động tạm khoá đăng nhập",
  new_device: "Đăng nhập từ thiết bị mới",
  role_changed: "Đổi vai trò",
  session_revoked: "Ép đăng xuất",
  account_deleted: "Xoá tài khoản",
  mfa_enrolled: "Bật MFA",
  mfa_removed: "Tắt MFA",
  mfa_reset_by_admin: "Admin gỡ MFA tài khoản khác",
  mfa_challenge_failed: "Sai mã MFA",
  reauth_failed: "Xác thực lại thất bại",
  role_permissions_updated: "Đổi phân quyền trang",
  role_created: "Thêm vai trò mới",
};

/** Chỉ role được cấp xem (bảng phân quyền /admin/accounts) + RLS trên security_audit_log. */
export default async function SecurityLogPage({ searchParams }: { searchParams: { page?: string } }) {
  await requirePageAccess("/admin/audit-log");
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { entries, total } = await getSecurityAuditLog(page, PAGE_SIZE);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Nhật ký bảo mật ({total})</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chặn đăng nhập, khoá tự động, thiết bị mới, đổi vai trò, ép đăng xuất, MFA... Khác trang
        Lịch sử chỉnh sửa (chỉ ghi sửa dữ liệu Phòng/Dự án/Blog).
      </p>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Sự kiện</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Tài khoản liên quan</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatVNDateTime(entry.created_at)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {EVENT_LABELS[entry.event_type] ?? entry.event_type}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.actor_email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.target_email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.ip_address ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có sự kiện bảo mật nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/audit-log" />
      </div>
    </div>
  );
}
