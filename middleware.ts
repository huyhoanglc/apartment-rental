import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const { response, user } = await updateSession(request);
    const isLoginPage = pathname === "/admin/login";

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

    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // /auth/* (route callback OAuth) bỏ qua cả intl lẫn admin-guard — nó xử lý
  // xong tự redirect vào /admin, không phải trang cần bảo vệ hay đa ngôn ngữ.
  matcher: ["/((?!api|auth|_next|.*\\..*).*)"],
};
