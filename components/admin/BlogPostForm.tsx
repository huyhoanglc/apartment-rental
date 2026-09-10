"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { slugify } from "@/lib/slugify";
import type { BlogPost } from "@/lib/types";
import type { SaveBlogPostState } from "@/app/admin/(dashboard)/blog/actions";

interface BlogPostFormProps {
  action: (state: SaveBlogPostState, formData: FormData) => Promise<SaveBlogPostState>;
  initialPost?: BlogPost;
}

const META_TITLE_LIMIT = 60;
const META_DESCRIPTION_LIMIT = 160;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu bài viết"}
    </button>
  );
}

export default function BlogPostForm({ action, initialPost }: BlogPostFormProps) {
  const [state, formAction] = useFormState<SaveBlogPostState, FormData>(action, {});
  const isEdit = Boolean(initialPost);

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
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Tiêu đề *</label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
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
          placeholder="tự tạo từ tiêu đề nếu để trống"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">URL: /blog/{slugify(slug || title)}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Tóm tắt</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={initialPost?.excerpt ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Nội dung (Markdown) *</label>
        <textarea
          name="content"
          required
          rows={14}
          defaultValue={initialPost?.content ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
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

      <div>
        <label className="text-sm font-medium text-foreground">
          Meta title (SEO){" "}
          <span className={metaTitle.length > META_TITLE_LIMIT ? "text-rose-600" : "text-muted-foreground"}>
            {metaTitle.length}/{META_TITLE_LIMIT}
          </span>
        </label>
        <input
          name="meta_title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="Để trống dùng tiêu đề bài viết"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Meta description (SEO){" "}
          <span
            className={
              metaDescription.length > META_DESCRIPTION_LIMIT ? "text-rose-600" : "text-muted-foreground"
            }
          >
            {metaDescription.length}/{META_DESCRIPTION_LIMIT}
          </span>
        </label>
        <textarea
          name="meta_description"
          rows={2}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Để trống dùng tóm tắt bài viết"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
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

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
