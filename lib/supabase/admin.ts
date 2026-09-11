import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dùng SERVICE ROLE KEY — bỏ qua mọi RLS, chỉ dùng cho thao tác quản
 * lý tài khoản đăng nhập (tạo/xoá qua Supabase Auth Admin API) trong
 * app/admin/(dashboard)/accounts/. TUYỆT ĐỐI không import file này vào bất
 * kỳ đâu ngoài các Server Action đã tự kiểm tra người gọi đang đăng nhập —
 * không dùng cho đọc/ghi dữ liệu thông thường (đã có lib/supabase/server.ts
 * cho việc đó, tôn trọng RLS).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
