import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLE_KEY } from "@/lib/admin/adminRoleKey";

/** Trước đây union cứng "admin" | "member" — giờ role tuỳ ý (bảng admin_roles,
 * xem lib/admin/rolePermissions.ts) nên chỉ còn là string. "admin" vẫn luôn
 * là hằng đặc biệt, khoá cứng toàn quyền, không lưu ở admin_roles. */
export type AdminRole = string;

export { ADMIN_ROLE_KEY };

/**
 * Role lưu trong app_metadata của Supabase Auth user — chỉ set được qua
 * Admin API (service role), user không tự nâng quyền được dù chiếm được
 * session (app_metadata khác user_metadata, user không tự sửa được).
 *
 * Tài khoản KHÔNG có role (tạo trước khi có tính năng này, hoặc tạo thủ công
 * qua Supabase Dashboard) mặc định coi là "admin" — để không khoá bạn ra
 * khỏi chính hệ thống của mình khi tính năng này mới triển khai. Tài khoản
 * tạo mới qua /admin/accounts luôn phải chọn role rõ ràng (validate theo
 * danh sách role đang có — xem lib/admin/rolePermissions.ts getAllRoles).
 */
export async function getCurrentRole(): Promise<AdminRole> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;
  return typeof role === "string" && role ? role : ADMIN_ROLE_KEY;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === ADMIN_ROLE_KEY;
}
