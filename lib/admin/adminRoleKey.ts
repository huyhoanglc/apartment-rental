/**
 * Hằng vai trò Admin, tách riêng khỏi lib/admin/roles.ts (file đó import
 * next/headers qua lib/supabase/server — chỉ dùng được ở server). Client
 * component cần giá trị "admin" (so sánh, hiển thị...) import từ đây để
 * không vô tình kéo next/headers vào bundle client.
 */
export const ADMIN_ROLE_KEY = "admin";
