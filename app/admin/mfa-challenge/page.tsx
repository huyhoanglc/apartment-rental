import { redirect } from "next/navigation";
import { getVerifiedTotpFactor } from "@/lib/admin/mfa";
import MfaChallengeClient from "./MfaChallengeClient";

/**
 * Step-up: hiện khi session đang ở aal1 nhưng user đã có factor TOTP verified
 * (vd vừa đăng nhập lại bằng email/password hoặc Google) — middleware.ts đưa
 * về đây trước khi cho vào /admin.
 */
export default async function MfaChallengePage() {
  const factor = await getVerifiedTotpFactor();
  if (!factor) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl2 border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-lg font-bold text-primary-700 dark:text-primary-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-sm">
            TT
          </span>
          Xác thực 2 lớp
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập mã từ app authenticator để tiếp tục vào trang quản trị.
        </p>

        <div className="mt-6">
          <MfaChallengeClient factorId={factor.id} />
        </div>
      </div>
    </div>
  );
}
