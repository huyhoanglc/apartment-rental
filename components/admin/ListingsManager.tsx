"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DeleteListingButton from "@/components/admin/DeleteListingButton";
import StatusSelect from "@/components/admin/StatusSelect";
import FormModal from "@/components/admin/FormModal";
import ListingForm from "@/components/admin/ListingForm";
import ProjectForm from "@/components/admin/ProjectForm";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { saveListing } from "@/app/admin/(dashboard)/listings/actions";
import { saveProject } from "@/app/admin/(dashboard)/projects/actions";
import { LISTING_TYPE_LABELS, type ListingWithProject, type Project } from "@/lib/types";

interface ListingsManagerProps {
  listings: ListingWithProject[];
  projects: Project[];
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; listing: ListingWithProject }
  | { mode: "create-project" }
  | null;

export default function ListingsManager({ listings, projects }: ListingsManagerProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  // Sau khi tạo dự án ngay trong popup (từ chỗ "chưa có dự án"), tự mở tiếp
  // popup thêm phòng luôn — đỡ phải bấm "Thêm phòng mới" lại lần 2.
  const continueToAddListing = useRef(false);

  useEffect(() => {
    if (continueToAddListing.current && projects.length > 0) {
      continueToAddListing.current = false;
      setModal({ mode: "create" });
    }
  }, [projects]);

  function closeModal() {
    setModal(null);
  }

  function handleCancelCreateProject() {
    continueToAddListing.current = false;
    closeModal();
  }

  function handleSuccess(message: string) {
    closeModal();
    toast.success(message);
    router.refresh();
  }

  async function handleAddClick() {
    if (projects.length === 0) {
      const ok = await confirm({
        title: "Chưa có dự án nào",
        description: "Cần tạo ít nhất 1 dự án (tòa nhà/chung cư) trước khi thêm phòng. Bạn có muốn tạo dự án mới không?",
        confirmLabel: "Tạo dự án",
        cancelLabel: "Để sau",
      });
      if (ok) {
        continueToAddListing.current = true;
        setModal({ mode: "create-project" });
      }
      return;
    }
    setModal({ mode: "create" });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Phòng</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{listings.length} phòng đang quản lý</p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm phòng mới
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Chưa có phòng nào</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Bấm &quot;Thêm phòng mới&quot; để đăng phòng đầu tiên.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Dự án</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.code}
                  className="border-b border-border transition last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md ring-1 ring-border">
                      <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{listing.code}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-foreground">{listing.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p className="text-foreground">{listing.project.name}</p>
                    <p className="text-xs">{listing.project.district}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{LISTING_TYPE_LABELS[listing.type]}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{listing.price_million} triệu</td>
                  <td className="px-4 py-3">
                    <StatusSelect code={listing.code} status={listing.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", listing })}
                        className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                      >
                        Sửa
                      </button>
                      <DeleteListingButton code={listing.code} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && modal.mode !== "create-project" && (
        <FormModal
          title={modal.mode === "create" ? "Thêm phòng mới" : `Sửa phòng — ${modal.listing.code}`}
          onClose={closeModal}
        >
          <ListingForm
            key={modal.mode === "edit" ? modal.listing.code : "create"}
            action={saveListing.bind(null, modal.mode === "edit" ? modal.listing.code : null)}
            projects={projects}
            initialListing={modal.mode === "edit" ? modal.listing : undefined}
            onCancel={closeModal}
            onSuccess={() =>
              handleSuccess(modal.mode === "edit" ? "Đã cập nhật phòng." : "Đã thêm phòng mới.")
            }
          />
        </FormModal>
      )}

      {modal?.mode === "create-project" && (
        <FormModal title="Thêm dự án mới" onClose={handleCancelCreateProject}>
          <ProjectForm
            action={saveProject.bind(null, null)}
            onCancel={handleCancelCreateProject}
            onSuccess={() => handleSuccess("Đã thêm dự án mới — tiếp tục thêm phòng.")}
          />
        </FormModal>
      )}
    </div>
  );
}
