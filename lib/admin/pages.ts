export interface AdminPageDef {
  href: string;
  label: string;
}

/**
 * Trang trong khu quản trị có thể phân quyền theo vai trò (bảng phân quyền ở
 * /admin/accounts, lưu ở bảng admin_role_permissions). Đây là quyền XEM
 * TRANG — các thao tác nhạy cảm bên trong (tạo/xoá/đổi vai trò tài khoản, ép
 * đăng xuất...) vẫn luôn đòi role Admin thật ở tầng server action
 * (isCurrentUserAdmin), không bị nới theo bảng này dù trang có hiện ra.
 */
export const ADMIN_PAGES: AdminPageDef[] = [
  { href: "/admin", label: "Phòng" },
  { href: "/admin/projects", label: "Dự án" },
  { href: "/admin/leads", label: "Yêu cầu khách hàng" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/activity", label: "Lịch sử" },
  { href: "/admin/staff", label: "Nhân viên" },
  { href: "/admin/accounts", label: "Tài khoản và phân quyền" },
  { href: "/admin/sessions", label: "Phiên đăng nhập" },
  { href: "/admin/audit-log", label: "Nhật ký bảo mật" },
];

/** Không nằm trong bảng phân quyền — trang tự quản lý tài khoản CHÍNH MÌNH
 * (hồ sơ, MFA, lịch sử đăng nhập), không phải quản trị người khác nên luôn
 * xem được bất kể vai trò (xem comment ở app/admin/(dashboard)/security/page.tsx). */
export const ALWAYS_VISIBLE_PAGES: AdminPageDef[] = [{ href: "/admin/security", label: "Bảo mật" }];
