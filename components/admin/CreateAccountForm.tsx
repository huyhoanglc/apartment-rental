"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createAccountAction, type CreateAccountState } from "@/app/admin/(dashboard)/accounts/actions";

interface CreateAccountFormProps {
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
      {pending ? "Đang tạo..." : "Tạo tài khoản"}
    </button>
  );
}

export default function CreateAccountForm({ onCancel, onSuccess }: CreateAccountFormProps) {
  const [state, formAction] = useFormState<CreateAccountState, FormData>(createAccountAction, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction}>
      <div className="space-y-4 p-6">
        <div>
          <label className={LABEL}>Họ và tên *</label>
          <input type="text" name="full_name" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" name="email" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Số điện thoại *</label>
          <input type="tel" name="phone" required className={FIELD} />
          <p className="mt-1.5 text-xs text-muted-foreground">Dùng làm mật khẩu mặc định khi cần &quot;Reset mật khẩu&quot;.</p>
        </div>
        <div>
          <label className={LABEL}>Mật khẩu *</label>
          <input type="password" name="password" required minLength={8} className={FIELD} />
          <p className="mt-1.5 text-xs text-muted-foreground">Ít nhất 8 ký tự.</p>
        </div>
        <div>
          <label className={LABEL}>Vai trò *</label>
          <select name="role" required defaultValue="member" className={FIELD}>
            <option value="member">Cá nhân — chỉ Phòng, Dự án, Blog, Leads</option>
            <option value="admin">Admin — toàn quyền</option>
          </select>
        </div>

        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Huỷ
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
