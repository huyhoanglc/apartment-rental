"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Staff } from "@/lib/types";
import type { SaveStaffState } from "@/app/admin/(dashboard)/staff/actions";

interface StaffFormProps {
  action: (state: SaveStaffState, formData: FormData) => Promise<SaveStaffState>;
  initialStaff?: Staff;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu nhân viên"}
    </button>
  );
}

export default function StaffForm({ action, initialStaff }: StaffFormProps) {
  const [state, formAction] = useFormState<SaveStaffState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Họ tên *</label>
        <input
          name="full_name"
          required
          defaultValue={initialStaff?.full_name}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Số điện thoại</label>
          <input
            name="phone"
            defaultValue={initialStaff?.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={initialStaff?.email ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Chức vụ</label>
        <input
          name="role"
          defaultValue={initialStaff?.role ?? ""}
          placeholder="Vd: Tư vấn viên, Quản lý..."
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initialStaff?.active ?? true}
          className="h-4 w-4 accent-primary-600"
        />
        Đang làm việc
      </label>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
