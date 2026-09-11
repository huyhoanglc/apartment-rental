"use client";

import { useEffect, type ReactNode } from "react";

interface FormModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal bọc các form Thêm/Sửa (Phòng, Dự án, Blog, Nhân viên) ngay trên
 * trang danh sách — thay cho việc điều hướng sang /new hoặc /[id]/edit rồi
 * lại quay về. Form bên trong tự lo phần thân card (đã có border/shadow),
 * modal chỉ thêm tiêu đề + nút đóng + nền mờ + cuộn khi form dài.
 */
export default function FormModal({ title, onClose, children }: FormModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 py-8 sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-dialog-in relative w-full max-w-2xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
