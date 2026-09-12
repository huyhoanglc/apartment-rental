"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importListingsAction } from "@/app/admin/(dashboard)/listings/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useGlobalLoading } from "@/components/admin/LoadingOverlay";

/**
 * Import hàng loạt Phòng từ file Excel (.xlsx/.xls) hoặc CSV/TSV, cấu trúc
 * cột: Mã nhà (tham chiếu Mã nhà của Dự án), Mã phòng, Tiêu đề, Giá (triệu),
 * Diện tích (m²), Loại hình, Trạng thái, Link ảnh, Mô tả. Dự án phải có sẵn
 * "Mã nhà" (đặt ở form Sửa dự án hoặc lúc import Dự án) thì Phòng mới nối
 * đúng — dòng nào không tìm thấy Mã nhà khớp sẽ bị bỏ qua.
 */
export default function ImportListingsButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const loading = useGlobalLoading();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ok = await confirm({
      title: "Import phòng từ file?",
      description:
        `Đọc cột "Mã nhà", "Mã phòng", "Tiêu đề", "Giá", "Diện tích", "Loại hình", "Trạng thái", ` +
        `"Link ảnh", "Mô tả" từ file "${file.name}" và tạo phòng mới cho mỗi dòng. Dòng nào có Mã ` +
        "nhà không khớp dự án nào, hoặc Mã phòng đã tồn tại, sẽ tự bị bỏ qua.",
      confirmLabel: "Import",
    });
    if (!ok) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      loading.show("Đang import...");
      try {
        const result = await importListingsAction(formData);
        if (result.error) {
          toast.error(result.error);
        } else if (result.imported === 0) {
          toast.error("Không import được dòng nào — kiểm tra lại Mã nhà, Mã phòng, Loại hình, Link ảnh.");
        } else {
          toast.success(
            `Đã tạo ${result.imported} phòng mới` +
              (result.skipped > 0 ? `, bỏ qua ${result.skipped} dòng lỗi/thiếu dữ liệu.` : ".")
          );
          router.refresh();
        }
      } catch {
        toast.error("Import thất bại, vui lòng thử lại.");
      } finally {
        loading.hide();
      }
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.tsv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Import Excel
      </button>
    </>
  );
}
