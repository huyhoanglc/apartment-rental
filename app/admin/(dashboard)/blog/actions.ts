"use server";

import { revalidatePath } from "next/cache";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostBySlugAdmin,
  updateBlogPost,
  updateBlogPostPublished,
} from "@/lib/admin/blog";
import { uploadBlogImage } from "@/lib/admin/storage";
import { slugify } from "@/lib/slugify";
import type { BlogPostInput } from "@/lib/types";

export interface SaveBlogPostState {
  error?: string;
  success?: boolean;
}

export async function saveBlogPost(
  existingSlug: string | null,
  _prevState: SaveBlogPostState,
  formData: FormData
): Promise<SaveBlogPostState> {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const metaTitle = String(formData.get("meta_title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const published = formData.get("published") === "on";
  const coverFile = formData.get("cover_image");

  if (!title || !content) {
    return { error: "Vui lòng nhập tiêu đề và nội dung." };
  }

  const slug = slugify(slugRaw || title);
  if (!slug) {
    return { error: "Slug không hợp lệ." };
  }

  const isCreate = existingSlug === null;

  if (isCreate || slug !== existingSlug) {
    const duplicate = await getBlogPostBySlugAdmin(slug);
    if (duplicate) {
      return { error: `Slug "${slug}" đã tồn tại, vui lòng chọn slug khác.` };
    }
  }

  let cover_image_url: string | undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      cover_image_url = await uploadBlogImage(coverFile);
    } catch {
      return { error: "Upload ảnh cover thất bại, vui lòng thử lại." };
    }
  }

  const baseFields: Omit<BlogPostInput, "cover_image_url"> = {
    slug,
    title,
    excerpt: excerpt || null,
    content,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
    published,
  };

  try {
    if (isCreate) {
      await createBlogPost({ ...baseFields, cover_image_url });
    } else {
      const updateFields: Partial<BlogPostInput> & { publishedChanged: boolean } = {
        ...baseFields,
        publishedChanged: true,
      };
      if (cover_image_url) updateFields.cover_image_url = cover_image_url;
      await updateBlogPost(existingSlug, updateFields);
    }
  } catch (err) {
    console.error("[saveBlogPost]", err);
    return { error: "Lưu bài viết thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogPostAction(slug: string): Promise<void> {
  await deleteBlogPost(slug);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePublishedAction(slug: string, published: boolean): Promise<void> {
  await updateBlogPostPublished(slug, published);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
