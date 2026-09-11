"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Staff } from "@/lib/types";
import type { SaveStaffState } from "@/app/admin/(dashboard)/staff/actions";

interface StaffFormProps {
  action: (state: SaveStaffState, formData: FormData) => Promise<SaveStaffState>;
  initialStaff?: Staff;
  onCancel: () => void;
  onSuccess: () => void;
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
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu nhân viên"}
    </button>
  );
}

export default function StaffForm({ action, initialStaff, onCancel, onSuccess }: StaffFormProps) {
  const [state, formAction] = useFormState<SaveStaffState, FormData>(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="max-w-lg overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
      <div className="space-y-4 p-6">
        <div>
          <label className={LABEL}>Họ tên *</label>
          <input name="full_name" required defaultValue={initialStaff?.full_name} className={FIELD} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Số điện thoại</label>
            <input name="phone" defaultValue={initialStaff?.phone ?? ""} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input type="email" name="email" defaultValue={initialStaff?.email ?? ""} className={FIELD} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Chức vụ</label>
          <input
            name="role"
            defaultValue={initialStaff?.role ?? ""}
            placeholder="Vd: Tư vấn viên, Quản lý..."
            className={FIELD}
          />
        </div>

        <label className="flex items-center gap-2 pt-1 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initialStaff?.active ?? true}
            className="h-4 w-4 accent-primary-600"
          />
          Đang làm việc
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Huỷ
        </button>
        <div className="flex items-center gap-3">
          {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
