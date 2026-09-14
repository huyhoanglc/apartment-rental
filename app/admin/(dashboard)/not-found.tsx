"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl2 border border-border bg-card p-10 text-center shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">404</p>
      <h1 className="mt-3 text-xl font-bold text-foreground">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Trang này không tồn tại, hoặc vai trò hiện tại chưa được cấp xem.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Quay lại trang trước
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Về trang chủ quản trị
        </Link>
      </div>
    </div>
  );
}
