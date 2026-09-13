import { describe, expect, it } from "vitest";
import { resolveAdminRedirect, type AdminAuthState } from "./authGate";

const base: AdminAuthState = {
  pathname: "/admin",
  isAuthenticated: true,
  role: "admin",
  hasVerifiedMfaFactor: true,
  needsMfaChallenge: false,
};

describe("resolveAdminRedirect", () => {
  it("chưa đăng nhập -> /admin/login", () => {
    expect(resolveAdminRedirect({ ...base, isAuthenticated: false })).toBe("/admin/login");
  });

  it("chưa đăng nhập nhưng đang ở /admin/login -> không redirect (cho ở lại)", () => {
    expect(
      resolveAdminRedirect({ ...base, isAuthenticated: false, pathname: "/admin/login" })
    ).toBeNull();
  });

  it("đã đăng nhập mà vẫn ở /admin/login -> đưa về /admin", () => {
    expect(resolveAdminRedirect({ ...base, pathname: "/admin/login" })).toBe("/admin");
  });

  it("đang ở /admin/mfa-setup -> luôn cho qua dù chưa có MFA", () => {
    expect(
      resolveAdminRedirect({ ...base, pathname: "/admin/mfa-setup", hasVerifiedMfaFactor: false })
    ).toBeNull();
  });

  it("đang ở /admin/mfa-challenge -> luôn cho qua dù needsMfaChallenge=true", () => {
    expect(
      resolveAdminRedirect({ ...base, pathname: "/admin/mfa-challenge", needsMfaChallenge: true })
    ).toBeNull();
  });

  it("session aal1 nhưng đã có factor verified -> bắt step-up /admin/mfa-challenge", () => {
    expect(resolveAdminRedirect({ ...base, needsMfaChallenge: true })).toBe("/admin/mfa-challenge");
  });

  it("needsMfaChallenge được ưu tiên trước cả khi role=admin chưa có factor", () => {
    expect(
      resolveAdminRedirect({
        ...base,
        needsMfaChallenge: true,
        hasVerifiedMfaFactor: false,
      })
    ).toBe("/admin/mfa-challenge");
  });

  it("role admin chưa enroll MFA -> bắt buộc /admin/mfa-setup", () => {
    expect(resolveAdminRedirect({ ...base, hasVerifiedMfaFactor: false })).toBe("/admin/mfa-setup");
  });

  it("role member chưa enroll MFA -> KHÔNG bị bắt buộc, cho qua bình thường", () => {
    expect(
      resolveAdminRedirect({ ...base, role: "member", hasVerifiedMfaFactor: false })
    ).toBeNull();
  });

  it("role admin đã có MFA verified, session đã aal2 -> cho qua bình thường", () => {
    expect(resolveAdminRedirect(base)).toBeNull();
  });
});
