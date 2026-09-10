import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase gắn với session (cookie) của người dùng đăng nhập, dùng
 * trong Server Component/Server Action ở /admin/**. Khác với client anon
 * trong lib/supabase.ts (đọc công khai) — client này mang JWT của user nên
 * RLS coi request là `authenticated`.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Gọi từ Server Component thuần (không phải Server Action/Route Handler)
          // không cho phép set cookie — bỏ qua vì middleware đã tự refresh session.
        }
      },
    },
  });
}
