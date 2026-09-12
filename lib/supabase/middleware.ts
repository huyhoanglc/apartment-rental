import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export interface SessionInfo {
  response: NextResponse;
  user: User | null;
  /** true nếu user đã có 1 factor TOTP verified (bất kể session hiện đang ở aal1 hay aal2). */
  hasVerifiedMfaFactor: boolean;
  /** true nếu có factor verified nhưng session hiện tại mới ở aal1 — cần step-up trước khi vào /admin. */
  needsMfaChallenge: boolean;
}

/**
 * Refresh session Supabase trong middleware (pattern chuẩn @supabase/ssr cho
 * Next.js) và trả về user hiện tại (null nếu chưa đăng nhập) + trạng thái MFA
 * để middleware.ts quyết định redirect vào /admin/login, /admin/mfa-setup
 * hay /admin/mfa-challenge.
 */
export async function updateSession(request: NextRequest): Promise<SessionInfo> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    // Chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY — coi như chưa đăng nhập
    // thay vì crash, để middleware.ts redirect về /admin/login (nơi sẽ báo
    // lỗi rõ ràng hơn khi thực sự submit form).
    return { response, user: null, hasVerifiedMfaFactor: false, needsMfaChallenge: false };
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

  if (!user) {
    return { response, user: null, hasVerifiedMfaFactor: false, needsMfaChallenge: false };
  }

  // nextLevel chỉ đạt "aal2" khi user có ít nhất 1 factor verified (vd TOTP) — dùng để biết đã
  // từng enroll hay chưa, độc lập với currentLevel (aal của riêng session hiện tại).
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const hasVerifiedMfaFactor = aal?.nextLevel === "aal2";
  const needsMfaChallenge = aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2";

  return { response, user, hasVerifiedMfaFactor, needsMfaChallenge };
}
