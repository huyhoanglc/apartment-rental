"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { slugify } from "@/lib/slugify";
import { DISTRICTS, type Project } from "@/lib/types";
import type { SaveProjectState } from "@/app/admin/(dashboard)/projects/actions";

interface ProjectFormProps {
  action: (state: SaveProjectState, formData: FormData) => Promise<SaveProjectState>;
  initialProject?: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10";
const SECTION = "space-y-4 p-6";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu dự án"}
    </button>
  );
}

export default function ProjectForm({ action, initialProject, onCancel, onSuccess }: ProjectFormProps) {
  const [state, formAction] = useFormState<SaveProjectState, FormData>(action, {});
  const isEdit = Boolean(initialProject);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const [name, setName] = useState(initialProject?.name ?? "");
  const [slug, setSlug] = useState(initialProject?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [amenities, setAmenities] = useState<string[]>(initialProject?.amenities ?? []);
  const [amenityInput, setAmenityInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialProject?.cover_image_url ?? null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

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
    <form action={formAction}>
      <div className="divide-y divide-border">
        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Thông tin dự án</h2>
          <div>
            <label className={LABEL}>Tên dự án *</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="tự tạo từ tên nếu để trống"
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>Mã nhà (tuỳ chọn)</label>
            <input
              name="code"
              defaultValue={initialProject?.code ?? ""}
              placeholder="Vd: NH001 — để Phòng import Excel tham chiếu tới dự án này"
              className={FIELD}
            />
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Vị trí</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Quận *</label>
              <select name="district" required defaultValue={initialProject?.district ?? ""} className={FIELD}>
                <option value="" disabled>
                  Chọn quận
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Phường</label>
              <input name="ward" defaultValue={initialProject?.ward ?? ""} className={FIELD} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Địa chỉ</label>
            <input
              name="address"
              defaultValue={initialProject?.address ?? ""}
              placeholder="Số nhà, tên đường"
              className={FIELD}
            />
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Chủ nhà / Quản lý</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Tên chủ nhà / quản lý</label>
              <input name="owner_name" defaultValue={initialProject?.owner_name ?? ""} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Số điện thoại</label>
              <input name="owner_phone" defaultValue={initialProject?.owner_phone ?? ""} className={FIELD} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Tiện ích toà nhà</label>
            <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="elevator"
                  defaultChecked={initialProject?.elevator ?? false}
                  className="h-4 w-4 accent-primary-600"
                />
                Thang máy (bỏ chọn = thang bộ)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="has_security"
                  defaultChecked={initialProject?.has_security ?? false}
                  className="h-4 w-4 accent-primary-600"
                />
                Có bảo vệ
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="has_basement"
                  defaultChecked={initialProject?.has_basement ?? false}
                  className="h-4 w-4 accent-primary-600"
                />
                Có hầm xe
              </label>
            </div>
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Mô tả &amp; tiện ích chung</h2>
          <div>
            <label className={LABEL}>Mô tả</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialProject?.description ?? ""}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>Tiện ích chung</label>
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
                placeholder="Vd: Hồ bơi — nhấn Enter để thêm"
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
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Ảnh cover</h2>
          <label
            htmlFor="project-cover-image"
            className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border bg-background p-4 transition hover:border-primary-400 hover:bg-muted/50"
          >
            {previewUrl ? (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border">
                <Image src={previewUrl} alt="Xem trước ảnh cover" fill className="object-cover" unoptimized />
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
              <p className="font-medium text-foreground">Chọn ảnh {isEdit ? "mới (tuỳ chọn)" : ""}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isEdit ? "Để trống nếu giữ ảnh cũ" : "PNG, JPG — ảnh đại diện toà nhà"}
              </p>
            </div>
          </label>
          <input
            id="project-cover-image"
            type="file"
            name="cover_image"
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
