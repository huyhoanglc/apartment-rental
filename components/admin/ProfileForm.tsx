"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import Avatar from "@/components/admin/Avatar";
import { useToast } from "@/components/admin/Toast";
import { updateProfileAction, type UpdateProfileState } from "@/app/admin/(dashboard)/security/actions";

interface ProfileFormProps {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu thay đổi"}
    </button>
  );
}

export default function ProfileForm({ email, fullName, avatarUrl }: ProfileFormProps) {
  const [state, formAction] = useFormState<UpdateProfileState, FormData>(updateProfileAction, {});
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (state.success) {
      toast.success("Đã cập nhật hồ sơ.");
      router.refresh();
    }
  }, [state.success, router, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <Avatar name={fullName || email} avatarUrl={avatarUrl} className="h-14 w-14 text-lg" />
      <div className="flex-1">
        <label className={LABEL}>Họ và tên</label>
        <input name="full_name" required defaultValue={fullName} className={FIELD} />
      </div>
      <div className="flex items-center gap-3">
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        <SubmitButton />
      </div>
    </form>
  );
}
