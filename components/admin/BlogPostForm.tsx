"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { slugify } from "@/lib/slugify";
import type { BlogPost } from "@/lib/types";
import type { SaveBlogPostState } from "@/app/admin/(dashboard)/blog/actions";

interface BlogPostFormProps {
  action: (state: SaveBlogPostState, formData: FormData) => Promise<SaveBlogPostState>;
  initialPost?: BlogPost;
  onCancel: () => void;
  onSuccess: () => void;
}

const META_TITLE_LIMIT = 60;
const META_DESCRIPTION_LIMIT = 160;

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
      {pending ? "Đang lưu..." : "Lưu bài viết"}
    </button>
  );
}

export default function BlogPostForm({ action, initialPost, onCancel, onSuccess }: BlogPostFormProps) {
  const [state, formAction] = useFormState<SaveBlogPostState, FormData>(action, {});
  const isEdit = Boolean(initialPost);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPost?.cover_image_url ?? null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form action={formAction}>
      <div className="divide-y divide-border">
        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Nội dung</h2>
          <div>
            <label className={LABEL}>Tiêu đề *</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
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
              placeholder="tự tạo từ tiêu đề nếu để trống"
              className={FIELD}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">URL: /blog/{slugify(slug || title)}</p>
          </div>

          <div>
            <label className={LABEL}>Tóm tắt</label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={initialPost?.excerpt ?? ""}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>Nội dung (Markdown) *</label>
            <textarea
              name="content"
              required
              rows={14}
              defaultValue={initialPost?.content ?? ""}
              className={FIELD + " font-mono"}
            />
          </div>
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">Ảnh cover</h2>
          <label
            htmlFor="blog-cover-image"
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
                {isEdit ? "Để trống nếu giữ ảnh cũ" : "PNG, JPG — hiển thị đầu bài viết"}
              </p>
            </div>
          </label>
          <input
            id="blog-cover-image"
            type="file"
            name="cover_image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-foreground">SEO</h2>
          <div>
            <label className={LABEL}>
              Meta title{" "}
              <span className={metaTitle.length > META_TITLE_LIMIT ? "text-rose-600" : ""}>
                {metaTitle.length}/{META_TITLE_LIMIT}
              </span>
            </label>
            <input
              name="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Để trống dùng tiêu đề bài viết"
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>
              Meta description{" "}
              <span className={metaDescription.length > META_DESCRIPTION_LIMIT ? "text-rose-600" : ""}>
                {metaDescription.length}/{META_DESCRIPTION_LIMIT}
              </span>
            </label>
            <textarea
              name="meta_description"
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Để trống dùng tóm tắt bài viết"
              className={FIELD}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initialPost?.published ?? false}
              className="h-4 w-4 accent-primary-600"
            />
            Xuất bản ngay
          </label>
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
