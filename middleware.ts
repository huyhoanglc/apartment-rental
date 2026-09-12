import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const { response, user, hasVerifiedMfaFactor, needsMfaChallenge } = await updateSession(request);
    const isLoginPage = pathname === "/admin/login";
    const isMfaSetupPage = pathname === "/admin/mfa-setup";
    const isMfaChallengePage = pathname === "/admin/mfa-challenge";

    if (!user && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (user && !isMfaSetupPage && !isMfaChallengePage) {
      const role = user.app_metadata?.role === "member" ? "member" : "admin";

      // Đã có factor verified nhưng session hiện tại mới ở aal1 (vừa đăng nhập
      // lại) — bắt xác thực lại mã TOTP trước khi vào bất kỳ trang admin nào.
      if (needsMfaChallenge) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/mfa-challenge";
        return NextResponse.redirect(url);
      }

      // Role admin bắt buộc có MFA — chưa enroll thì chặn hết, chỉ cho vào
      // trang bật MFA.
      if (role === "admin" && !hasVerifiedMfaFactor) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/mfa-setup";
        return NextResponse.redirect(url);
      }
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
