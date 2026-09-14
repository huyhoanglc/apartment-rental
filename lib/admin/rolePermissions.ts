import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentRole, type AdminRole } from "@/lib/admin/roles";
import { ADMIN_PAGES, DEFAULT_MEMBER_PAGES } from "@/lib/admin/pages";

/**
 * Admin luôn toàn quyền — không lưu ở DB, không chỉnh được qua bảng phân
 * quyền (khoá cứng để không lỡ tay tự khoá Admin ra khỏi trang quản trị).
 * Role khác Admin (Staff, và role thêm sau này) mới có hàng riêng trong
 * admin_role_permissions; role chưa từng cấu hình dùng DEFAULT_MEMBER_PAGES.
 */
export async function getAllowedPages(role: AdminRole): Promise<string[]> {
  if (role === "admin") return ADMIN_PAGES.map((p) => p.href);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_role_permissions")
    .select("allowed_pages")
    .eq("role", role)
    .maybeSingle();
  if (error) throw error;

  return data?.allowed_pages ?? DEFAULT_MEMBER_PAGES;
}

/** Dùng cho bảng phân quyền ở /admin/accounts — map đủ mọi role hiện có. */
export async function getAllRolePermissions(): Promise<Record<AdminRole, string[]>> {
  return {
    admin: ADMIN_PAGES.map((p) => p.href),
    member: await getAllowedPages("member"),
  };
}

/**
 * Ghi đè danh sách trang 1 role (khác Admin) được xem. Gọi từ Server Action
 * ở app/admin/(dashboard)/accounts/actions.ts — nơi đã tự kiểm tra người gọi
 * là Admin trước khi tới đây, hàm này không tự kiểm tra lại quyền.
 */
export async function setAllowedPages(role: AdminRole, hrefs: string[]): Promise<void> {
  if (role === "admin") throw new Error("Admin luôn có toàn quyền, không chỉnh được.");

  const knownHrefs = new Set(ADMIN_PAGES.map((p) => p.href));
  const validHrefs = hrefs.filter((href) => knownHrefs.has(href));

  const admin = createAdminClient();
  const { error } = await admin
    .from("admin_role_permissions")
    .upsert({ role, allowed_pages: validHrefs, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Dùng ở đầu các trang phân quyền theo bảng admin_role_permissions (staff,
 * accounts, sessions, audit-log) — 404 nếu vai trò hiện tại không được cấp
 * xem trang này. Admin luôn qua (xem getAllowedPages). */
export async function requirePageAccess(href: string): Promise<void> {
  const role = await getCurrentRole();
  if (role === "admin") return;

  const allowed = await getAllowedPages(role);
  if (!allowed.includes(href)) notFound();
}
