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

    const redirectPath = resolveAdminRedirect({
      pathname,
      isAuthenticated: Boolean(user),
      role: user?.app_metadata?.role === "member" ? "member" : "admin",
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
