export interface AdminAuthState {
  pathname: string;
  isAuthenticated: boolean;
  role: "admin" | "member";
  /** true nếu user đã có 1 factor TOTP verified (bất kể session hiện đang ở aal1 hay aal2). */
  hasVerifiedMfaFactor: boolean;
  /** true nếu có factor verified nhưng session hiện tại mới ở aal1 — cần step-up. */
  needsMfaChallenge: boolean;
}

/**
 * Quyết định redirect cho middleware.ts khi vào /admin/**: chưa đăng nhập ->
 * login; đã đăng nhập nhưng session ở aal1 dù đã có factor verified -> step-up
 * (mfa-challenge); role admin bắt buộc có MFA -> mfa-setup nếu chưa enroll.
 * Trả về null nghĩa là cho request đi tiếp bình thường.
 *
 * Tách thành hàm thuần (không đụng NextRequest/NextResponse/Supabase) để
 * middleware.ts và test (authGate.test.ts) dùng chung logic — sai ở đây có
 * thể khoá hết admin ra ngoài hoặc mở toang trang quản trị, nên cố tình để
 * dễ test độc lập, không phải mock cả Next.js middleware.
 */
export function resolveAdminRedirect(state: AdminAuthState): string | null {
  const isLoginPage = state.pathname === "/admin/login";
  const isMfaSetupPage = state.pathname === "/admin/mfa-setup";
  const isMfaChallengePage = state.pathname === "/admin/mfa-challenge";

  if (!state.isAuthenticated) {
    return isLoginPage ? null : "/admin/login";
  }

  if (isLoginPage) return "/admin";

  if (isMfaSetupPage || isMfaChallengePage) return null;

  if (state.needsMfaChallenge) return "/admin/mfa-challenge";

  if (state.role === "admin" && !state.hasVerifiedMfaFactor) return "/admin/mfa-setup";

  return null;
}
