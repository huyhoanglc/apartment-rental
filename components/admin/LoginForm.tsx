"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/admin/login/actions";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </button>
  );
}

export default function LoginForm({
  defaultEmail,
  children,
}: {
  defaultEmail: string;
  children?: ReactNode;
}) {
  return (
    <form action={login} className="space-y-4">
      <div>
        <label className={LABEL}>Email</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={defaultEmail}
          className={FIELD}
        />
      </div>
      <div>
        <label className={LABEL}>Mật khẩu</label>
        <input type="password" name="password" required className={FIELD} />
      </div>

      {children}

      <SubmitButton />
    </form>
  );
}
