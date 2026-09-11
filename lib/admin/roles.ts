import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "admin" | "member";

/**
 * Role lưu trong app_metadata của Supabase Auth user — chỉ set được qua
 * Admin API (service role), user không tự nâng quyền được dù chiếm được
 * session (app_metadata khác user_metadata, user không tự sửa được).
 *
 * Tài khoản KHÔNG có role (tạo trước khi có tính năng này, hoặc tạo thủ công
 * qua Supabase Dashboard) mặc định coi là "admin" — để không khoá bạn ra
 * khỏi chính hệ thống của mình khi tính năng này mới triển khai. Tài khoản
 * tạo mới qua /admin/accounts luôn phải chọn role rõ ràng.
 */
export async function getCurrentRole(): Promise<AdminRole> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;
  return role === "member" ? "member" : "admin";
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "admin";
}

/** Dùng ở đầu các trang chỉ-admin (accounts, staff, security) — 404 nếu không phải admin. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isCurrentUserAdmin())) notFound();
}
