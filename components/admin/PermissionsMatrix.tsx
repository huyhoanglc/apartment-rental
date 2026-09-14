import { NAV_ITEMS, ALL_ROLES, ROLE_LABELS } from "@/components/admin/AdminNav";

/**
 * Đọc trực tiếp từ NAV_ITEMS (components/admin/AdminNav.tsx) — cùng nguồn dữ
 * liệu quyết định menu sidebar hiện gì. Sau này thêm role mới chỉ cần sửa ở
 * đó (xem comment cạnh ROLE_LABELS), bảng này tự có thêm cột, không phải
 * đụng vào file này.
 */
export default function PermissionsMatrix() {
  return (
    <div className="mt-4 rounded-xl2 border border-border bg-card p-6 shadow-card">
      <h2 className="text-sm font-semibold text-foreground">Bảng phân quyền</h2>
      <p className="mt-1 text-sm text-muted-foreground">Vai trò nào xem được trang nào trong khu quản trị.</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Trang</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="px-4 py-3 text-center">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NAV_ITEMS.map((item) => (
              <tr key={item.href} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{item.label}</td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="px-4 py-3 text-center">
                    {item.roles.includes(role) ? (
                      <span className="text-status-available" aria-label="Xem được">
                        ✓
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40" aria-label="Không xem được">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
