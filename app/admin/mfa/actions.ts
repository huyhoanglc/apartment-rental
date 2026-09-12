"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  enrollTotpFactor,
  unenrollTotpFactor,
  verifyTotpChallenge,
  verifyTotpEnrollment,
} from "@/lib/admin/mfa";
import { logSecurityEvent } from "@/lib/admin/security";

async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export interface EnrollMfaState {
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}

export async function enrollMfaAction(): Promise<EnrollMfaState> {
  try {
    const data = await enrollTotpFactor();
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  } catch (err) {
    console.error("[enrollMfaAction]", err);
    return { error: "Không khởi tạo được MFA, vui lòng thử lại." };
  }
}

export async function verifyMfaEnrollAction(
  factorId: string,
  code: string
): Promise<{ error?: string }> {
  const ok = await verifyTotpEnrollment(factorId, code);
  const user = await getCurrentUser();

  if (!ok) {
    return { error: "Mã xác thực không đúng, vui lòng thử lại." };
  }

  await logSecurityEvent("mfa_enrolled", {
    actorUserId: user?.id,
    actorEmail: user?.email,
    telegramNote: "Tài khoản vừa bật xác thực 2 lớp (TOTP).",
  });

  revalidatePath("/admin/security");
  return {};
}

export async function unenrollMfaAction(factorId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  const ok = await unenrollTotpFactor(factorId);

  if (!ok) {
    return { error: "Tắt MFA thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent("mfa_removed", {
    actorUserId: user?.id,
    actorEmail: user?.email,
    telegramNote: "Tài khoản vừa tắt xác thực 2 lớp (TOTP).",
  });

  revalidatePath("/admin/security");
  return {};
}

export async function verifyMfaChallengeAction(
  factorId: string,
  code: string
): Promise<{ error?: string }> {
  const ok = await verifyTotpChallenge(factorId, code);

  if (!ok) {
    const user = await getCurrentUser();
    await logSecurityEvent("mfa_challenge_failed", {
      actorUserId: user?.id,
      actorEmail: user?.email,
    });
    return { error: "Mã xác thực không đúng, vui lòng thử lại." };
  }

  return {};
}
