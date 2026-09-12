import { createClient } from "@/lib/supabase/server";

export interface MfaFactorSummary {
  id: string;
  status: "verified" | "unverified";
}

/**
 * Factor TOTP đã xác minh của user đang đăng nhập (session hiện tại), nếu có.
 * Mỗi user chỉ nên có 1 factor TOTP (UI enroll ở đây không cho tạo thêm khi
 * đã có 1 factor verified — xem MfaEnrollForm).
 */
export async function getVerifiedTotpFactor(): Promise<MfaFactorSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return null;

  const verified = data.totp.find((f) => f.status === "verified");
  return verified ? { id: verified.id, status: "verified" } : null;
}

export async function hasVerifiedMfa(): Promise<boolean> {
  return (await getVerifiedTotpFactor()) !== null;
}

/** Bắt đầu enroll — trả về QR (SVG data URI) + secret để nhập tay nếu cần. */
export async function enrollTotpFactor() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error) throw error;
  return data;
}

/** Xác nhận mã 6 số từ app authenticator để kích hoạt factor vừa enroll. */
export async function verifyTotpEnrollment(factorId: string, code: string): Promise<boolean> {
  const supabase = createClient();
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) return false;

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  return !verify.error;
}

export async function unenrollTotpFactor(factorId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return !error;
}

/** Step-up: xác thực lại mã TOTP của session hiện tại (dùng cho login step-up lẫn re-auth). */
export async function verifyTotpChallenge(factorId: string, code: string): Promise<boolean> {
  const supabase = createClient();
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) return false;

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  return !verify.error;
}
