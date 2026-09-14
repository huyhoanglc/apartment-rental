import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { getCurrentRole, ADMIN_ROLE_KEY, type AdminRole } from "@/lib/admin/roles";
import { ADMIN_PAGES } from "@/lib/admin/pages";

export interface AdminRoleDef {
  key: string;
  label: string;
}

/**
 * Toàn bộ role hiện có, Admin luôn đứng đầu (hằng đặc biệt, không lưu ở
 * admin_roles) — các role còn lại (Staff + role tự thêm qua bảng phân quyền)
 * đọc từ admin_roles, theo đúng thứ tự tạo.
 */
export async function getAllRoles(): Promise<AdminRoleDef[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("admin_roles").select("key, label").order("created_at");
  if (error) throw error;

  return [{ key: ADMIN_ROLE_KEY, label: "Admin" }, ...(data ?? [])];
}

/**
 * Thêm 1 role mới — key tự sinh từ label (slugify), lỗi nếu trùng "admin"
 * hoặc role đã có. Tạo kèm 1 hàng admin_role_permissions rỗng (role mới mặc
 * định KHÔNG xem được trang nào — admin phải chủ động tích ở bảng phân
 * quyền, tránh vô tình cấp quyền rộng hơn dự tính).
 */
export async function createRole(label: string): Promise<AdminRoleDef> {
  const trimmedLabel = label.trim();
  const key = slugify(trimmedLabel);
  if (!trimmedLabel || !key) throw new Error("Tên vai trò không hợp lệ.");

  const existing = await getAllRoles();
  if (existing.some((r) => r.key === key)) {
    throw new Error(`Vai trò "${key}" đã tồn tại, đổi tên khác.`);
  }

  const admin = createAdminClient();
  const { error: roleError } = await admin.from("admin_roles").insert({ key, label: trimmedLabel });
  if (roleError) throw roleError;

  const { error: permissionsError } = await admin
    .from("admin_role_permissions")
    .insert({ role: key, allowed_pages: [] });
  if (permissionsError) throw permissionsError;

  return { key, label: trimmedLabel };
}

/**
 * Admin luôn toàn quyền — không lưu ở DB, không chỉnh được qua bảng phân
 * quyền (khoá cứng để không lỡ tay tự khoá Admin ra khỏi trang quản trị).
 * Role khác Admin mới có hàng riêng trong admin_role_permissions; role chưa
 * có hàng (vừa tạo lỗi giữa chừng, hoặc thêm thủ công ngoài app) coi như
 * chưa được cấp trang nào — least privilege, không suy đoán mặc định rộng.
 */
export async function getAllowedPages(role: AdminRole): Promise<string[]> {
  if (role === ADMIN_ROLE_KEY) return ADMIN_PAGES.map((p) => p.href);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_role_permissions")
    .select("allowed_pages")
    .eq("role", role)
    .maybeSingle();
  if (error) throw error;

  return data?.allowed_pages ?? [];
}

/** Dùng cho bảng phân quyền ở /admin/accounts — map đủ mọi role hiện có. */
export async function getAllRolePermissions(): Promise<Record<string, string[]>> {
  const roles = await getAllRoles();
  const entries = await Promise.all(roles.map(async (r) => [r.key, await getAllowedPages(r.key)] as const));
  return Object.fromEntries(entries);
}

/**
 * Ghi đè danh sách trang 1 role (khác Admin) được xem. Gọi từ Server Action
 * ở app/admin/(dashboard)/accounts/actions.ts — nơi đã tự kiểm tra người gọi
 * là Admin trước khi tới đây, hàm này không tự kiểm tra lại quyền.
 */
export async function setAllowedPages(role: AdminRole, hrefs: string[]): Promise<void> {
  if (role === ADMIN_ROLE_KEY) throw new Error("Admin luôn có toàn quyền, không chỉnh được.");

  const knownHrefs = new Set(ADMIN_PAGES.map((p) => p.href));
  const validHrefs = hrefs.filter((href) => knownHrefs.has(href));

  const admin = createAdminClient();
  const { error } = await admin
    .from("admin_role_permissions")
    .upsert({ role, allowed_pages: validHrefs, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Dùng ở đầu các trang phân quyền theo bảng admin_role_permissions (accounts,
 * sessions, audit-log) — 404 nếu vai trò hiện tại không được cấp xem trang
 * này. Admin luôn qua (xem getAllowedPages). */
export async function requirePageAccess(href: string): Promise<void> {
  const role = await getCurrentRole();
  if (role === ADMIN_ROLE_KEY) return;

  const allowed = await getAllowedPages(role);
  if (!allowed.includes(href)) notFound();
}
