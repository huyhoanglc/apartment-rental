import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Refresh session Supabase trong middleware (pattern chuẩn @supabase/ssr cho
 * Next.js) và trả về user hiện tại (null nếu chưa đăng nhập) để middleware.ts
 * quyết định redirect vào /admin/login hay không.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    // Chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY — coi như chưa đăng nhập
    // thay vì crash, để middleware.ts redirect về /admin/login (nơi sẽ báo
    // lỗi rõ ràng hơn khi thực sự submit form).
    return { response, user: null };
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
