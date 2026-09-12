"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unenrollMfaAction } from "@/app/admin/mfa/actions";
import MfaEnrollForm from "@/components/admin/MfaEnrollForm";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

interface MfaManagerProps {
  hasFactor: boolean;
  factorId: string | null;
  /** Admin bắt buộc bật MFA — không hiện nút tắt (middleware sẽ đưa họ về /admin/mfa-setup nếu tắt). */
  isAdmin: boolean;
}

export default function MfaManager({ hasFactor, factorId, isAdmin }: MfaManagerProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();

  async function handleDisable() {
    if (!factorId) return;
    const ok = await confirm({
      title: "Tắt xác thực 2 lớp?",
      description: "Tài khoản sẽ chỉ cần mật khẩu/Google để đăng nhập.",
      confirmLabel: "Tắt MFA",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await unenrollMfaAction(factorId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Đã tắt MFA.");
        router.refresh();
      }
    });
  }

  if (enrolling) {
    return (
      <MfaEnrollForm
        onSuccess={() => {
          setEnrolling(false);
          toast.success("Đã bật MFA.");
          router.refresh();
        }}
        onCancel={() => setEnrolling(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasFactor
              ? "bg-status-available/10 text-status-available"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {hasFactor ? "Đã bật" : "Chưa bật"}
        </span>
        {isAdmin && (
          <span className="text-xs text-muted-foreground">Bắt buộc với vai trò Admin</span>
        )}
      </div>

      {!hasFactor && (
        <button
          type="button"
          onClick={() => setEnrolling(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Bật MFA
        </button>
      )}
      {hasFactor && !isAdmin && (
        <button
          type="button"
          onClick={handleDisable}
          disabled={isPending}
          className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
        >
          Tắt MFA
        </button>
      )}
    </div>
  );
}
