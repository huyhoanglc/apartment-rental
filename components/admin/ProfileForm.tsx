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
  dateOfBirth: string | null;
  position: string | null;
  employmentType: string | null;
  startDate: string | null;
  listingsCount: number;
}

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10";
const FIELD_READONLY = "mt-1.5 w-full rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-muted-foreground";

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

export default function ProfileForm({
  email,
  fullName,
  avatarUrl,
  dateOfBirth,
  position,
  employmentType,
  startDate,
  listingsCount,
}: ProfileFormProps) {
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
    <form action={formAction} className="flex flex-col gap-5 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
        <Avatar name={fullName || email} avatarUrl={avatarUrl} className="h-16 w-16 text-lg" />
        <p className="whitespace-nowrap text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{listingsCount}</span> phòng đã đăng
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Họ và tên *</label>
          <input name="full_name" required defaultValue={fullName} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input value={email} readOnly disabled className={FIELD_READONLY} />
        </div>
        <div>
          <label className={LABEL}>Ngày sinh</label>
          <input type="date" name="date_of_birth" defaultValue={dateOfBirth ?? ""} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Chức vụ</label>
          <input
            name="position"
            defaultValue={position ?? ""}
            placeholder="Vd: Tư vấn viên, Quản lý..."
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>Hình thức làm việc</label>
          <select name="employment_type" defaultValue={employmentType ?? ""} className={FIELD}>
            <option value="">Chưa chọn</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Ngày vào làm</label>
          <input type="date" name="start_date" defaultValue={startDate ?? ""} className={FIELD} />
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
