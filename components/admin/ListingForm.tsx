"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  LISTING_STATUS_LABELS,
  LISTING_TYPE_LABELS,
  type ListingStatus,
  type ListingType,
  type ListingWithProject,
  type Project,
} from "@/lib/types";
import type { SaveListingState } from "@/app/admin/(dashboard)/listings/actions";

interface ListingFormProps {
  action: (state: SaveListingState, formData: FormData) => Promise<SaveListingState>;
  projects: Project[];
  initialListing?: ListingWithProject;
  onCancel: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS = Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][];
const STATUS_OPTIONS = Object.entries(LISTING_STATUS_LABELS) as [ListingStatus, string][];

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60";
const SECTION = "space-y-4 p-6";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu phòng"}
    </button>
  );
}

export default function ListingForm({
  action,
  projects,
  initialListing,
  onCancel,
  onSuccess,
}: ListingFormProps) {
  const [state, formAction] = useFormState<SaveListingState, FormData>(action, {});
  const [amenities, setAmenities] = useState<string[]>(initialListing?.amenities ?? []);
  const [amenityInput, setAmenityInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialListing?.image_url ?? null);

  const isEdit = Boolean(initialListing);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  function addAmenity() {
    const value = amenityInput.trim();
    if (!value || amenities.includes(value)) return;
    setAmenities((prev) => [...prev, value]);
    setAmenityInput("");
  }

  function removeAmenity(value: string) {
    setAmenities((prev) => prev.filter((a) => a !== value));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="max-w-2xl overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
      <div className="divide-y divide-border">
        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Mã căn *</label>
              <input
                name="code"
                required
                disabled={isEdit}
                defaultValue={initialListing?.code}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Trạng thái *</label>
              <select
                name="status"
                required
                defaultValue={initialListing?.status ?? "con_phong"}
                className={FIELD}
              >
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>Tiêu đề *</label>
            <input name="title" required defaultValue={initialListing?.title} className={FIELD} />
          </div>

          <div>
            <label className={LABEL}>Dự án *</label>
            <select
              name="project_id"
              required
              defaultValue={initialListing?.project_id ?? ""}
              className={FIELD}
            >
              <option value="" disabled>
                Chọn dự án
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.district}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Chưa thấy dự án cần tìm? Vào{" "}
              <Link href="/admin/projects" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                trang Dự án
              </Link>{" "}
              tạo dự án mới trước.
            </p>
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Giá &amp; diện tích</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Giá (triệu) *</label>
              <input
                type="number"
                name="price_million"
                required
                min={0}
                step={0.1}
                defaultValue={initialListing?.price_million}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Diện tích (m²) *</label>
              <input
                type="number"
                name="area"
                required
                min={0}
                step={0.1}
                defaultValue={initialListing?.area}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Loại hình *</label>
              <select name="type" required defaultValue={initialListing?.type ?? ""} className={FIELD}>
                <option value="" disabled>
                  Chọn loại hình
                </option>
                {TYPE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Tiện ích &amp; mô tả</h2>
          <div>
            <label className={LABEL}>Tiện ích</label>
            <div className="mt-1.5 flex gap-2">
              <input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="Vd: Máy lạnh — nhấn Enter để thêm"
                className={FIELD + " mt-0 flex-1"}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="mt-1.5 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Thêm
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {a}
                  <input type="hidden" name="amenities" value={a} />
                  <button
                    type="button"
                    onClick={() => removeAmenity(a)}
                    className="text-muted-foreground hover:text-rose-600"
                    aria-label={`Xoá ${a}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL}>Mô tả</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialListing?.description ?? ""}
              className={FIELD}
            />
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Hình ảnh</h2>
          <label
            htmlFor="listing-image"
            className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border bg-background p-4 transition hover:border-primary-400 hover:bg-muted/50"
          >
            {previewUrl ? (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border">
                <Image src={previewUrl} alt="Xem trước ảnh" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18v18H3V3zm12.75 5.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-foreground">Chọn ảnh {isEdit ? "mới (tuỳ chọn)" : "*"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isEdit ? "Để trống nếu giữ ảnh cũ" : "PNG, JPG — nên vuông hoặc ngang"}
              </p>
            </div>
          </label>
          <input
            id="listing-image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
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
