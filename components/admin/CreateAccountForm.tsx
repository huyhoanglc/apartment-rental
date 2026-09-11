"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createAccountAction, type CreateAccountState } from "@/app/admin/(dashboard)/accounts/actions";

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

export default function CreateAccountForm() {
  const [state, formAction] = useFormState<CreateAccountState, FormData>(createAccountAction, {});
  const [formKey, setFormKey] = useState(0);

  // Tạo xong thì reset input (remount form bằng key) thay vì để lại giá trị cũ.
  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1);
  }, [state.success]);

  return (
    <form key={formKey} action={formAction} className="max-w-md overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
      <div className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-foreground">Tạo tài khoản đăng nhập mới</h2>
        <div>
          <label className={LABEL}>Họ và tên *</label>
          <input type="text" name="full_name" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" name="email" required className={FIELD} />
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
        {state.success && (
          <p className="text-sm text-status-available">
            Đã tạo tài khoản — gửi email/mật khẩu này cho người dùng để họ đăng nhập.
          </p>
        )}
      </div>

      <div className="border-t border-border bg-muted/30 px-6 py-4">
        <SubmitButton />
      </div>
    </form>
  );
}
