import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { resolveAdminRedirect } from "./lib/admin/authGate";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const { response, user, hasVerifiedMfaFactor, needsMfaChallenge } = await updateSession(request);

    const roleClaim = user?.app_metadata?.role;
    const redirectPath = resolveAdminRedirect({
      pathname,
      isAuthenticated: Boolean(user),
      // Thiếu/rỗng role coi là Admin (an toàn) — role khác dùng nguyên chuỗi,
      // không còn ép về "admin" như trước (mọi role != "member" từng bị coi
      // là Admin, vô tình bắt buộc MFA cho cả role tuỳ ý mới thêm).
      role: typeof roleClaim === "string" && roleClaim ? roleClaim : "admin",
      hasVerifiedMfaFactor,
      needsMfaChallenge,
    });

    if (redirectPath) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      return NextResponse.redirect(url);
    }

    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // /auth/* (route callback OAuth) bỏ qua cả intl lẫn admin-guard — nó xử lý
  // xong tự redirect vào /admin, không phải trang cần bảo vệ hay đa ngôn ngữ.
  matcher: ["/((?!api|auth|_next|.*\\..*).*)"],
};
