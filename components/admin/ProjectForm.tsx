"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { slugify } from "@/lib/slugify";
import { DISTRICTS, type Project } from "@/lib/types";
import type { SaveProjectState } from "@/app/admin/(dashboard)/projects/actions";

interface ProjectFormProps {
  action: (state: SaveProjectState, formData: FormData) => Promise<SaveProjectState>;
  initialProject?: Project;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu dự án"}
    </button>
  );
}

export default function ProjectForm({ action, initialProject }: ProjectFormProps) {
  const [state, formAction] = useFormState<SaveProjectState, FormData>(action, {});
  const isEdit = Boolean(initialProject);

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
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Tên dự án *</label>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="tự tạo từ tên nếu để trống"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Quận *</label>
          <select
            name="district"
            required
            defaultValue={initialProject?.district ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          >
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
          <label className="text-sm font-medium text-foreground">Phường</label>
          <input
            name="ward"
            defaultValue={initialProject?.ward ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Địa chỉ</label>
        <input
          name="address"
          defaultValue={initialProject?.address ?? ""}
          placeholder="Số nhà, tên đường"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Mô tả</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialProject?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Tiện ích chung</label>
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
            placeholder="Vd: Hồ bơi — nhấn Enter để thêm"
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
        <label className="text-sm font-medium text-foreground">
          Ảnh cover {isEdit ? "(để trống nếu giữ ảnh cũ)" : ""}
        </label>
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 w-full text-sm text-foreground"
        />
        {previewUrl && (
          <div className="relative mt-3 h-40 w-72 overflow-hidden rounded-lg border border-border">
            <Image src={previewUrl} alt="Xem trước ảnh cover" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
