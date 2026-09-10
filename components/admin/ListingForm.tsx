"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
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
}

const TYPE_OPTIONS = Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][];
const STATUS_OPTIONS = Object.entries(LISTING_STATUS_LABELS) as [ListingStatus, string][];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu tin"}
    </button>
  );
}

export default function ListingForm({ action, projects, initialListing }: ListingFormProps) {
  const [state, formAction] = useFormState<SaveListingState, FormData>(action, {});
  const [amenities, setAmenities] = useState<string[]>(initialListing?.amenities ?? []);
  const [amenityInput, setAmenityInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialListing?.image_url ?? null);

  const isEdit = Boolean(initialListing);

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
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Mã căn *</label>
          <input
            name="code"
            required
            disabled={isEdit}
            defaultValue={initialListing?.code}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-60 focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Trạng thái *</label>
          <select
            name="status"
            required
            defaultValue={initialListing?.status ?? "con_phong"}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
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
        <label className="text-sm font-medium text-foreground">Tiêu đề *</label>
        <input
          name="title"
          required
          defaultValue={initialListing?.title}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Dự án *</label>
        <select
          name="project_id"
          required
          defaultValue={initialListing?.project_id ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
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
        <p className="mt-1 text-xs text-muted-foreground">
          Chưa thấy dự án cần tìm? Vào{" "}
          <a href="/admin/projects/new" className="text-primary-700 hover:underline dark:text-primary-300">
            Dự án → Thêm dự án mới
          </a>{" "}
          trước.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Giá (triệu) *</label>
          <input
            type="number"
            name="price_million"
            required
            min={0}
            step={0.1}
            defaultValue={initialListing?.price_million}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Diện tích (m²) *</label>
          <input
            type="number"
            name="area"
            required
            min={0}
            step={0.1}
            defaultValue={initialListing?.area}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Loại hình *</label>
          <select
            name="type"
            required
            defaultValue={initialListing?.type ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          >
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

      <div>
        <label className="text-sm font-medium text-foreground">Tiện ích</label>
        <div className="mt-1 flex gap-2">
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
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Thêm
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {a}
              <input type="hidden" name="amenities" value={a} />
              <button
                type="button"
                onClick={() => removeAmenity(a)}
                className="ml-1 text-muted-foreground hover:text-rose-600"
                aria-label={`Xoá ${a}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Mô tả</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialListing?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Ảnh {isEdit ? "(để trống nếu giữ ảnh cũ)" : "*"}
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 w-full text-sm text-foreground"
        />
        {previewUrl && (
          <div className="relative mt-3 h-40 w-56 overflow-hidden rounded-lg border border-border">
            <Image src={previewUrl} alt="Xem trước ảnh" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
