import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase chạy trong browser (Client Component) — dùng cho Realtime
 * Presence (components/admin/PresenceIndicator.tsx). Khác với lib/supabase.ts
 * (client anon dùng ở Server Component) vì cần connect WebSocket từ trình
 * duyệt, nên bắt buộc dùng biến env có prefix NEXT_PUBLIC_ (mới lộ ra client
 * bundle được) — giá trị giống hệt SUPABASE_URL/SUPABASE_ANON_KEY, an toàn để
 * public vì đã có RLS bảo vệ.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
