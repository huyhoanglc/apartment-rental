"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProject, deleteProject, updateProject } from "@/lib/admin/projects";
import { uploadProjectImage } from "@/lib/admin/storage";
import { getProjectBySlug } from "@/lib/projects";
import { slugify } from "@/lib/slugify";
import type { ProjectInput } from "@/lib/types";

export interface SaveProjectState {
  error?: string;
}

export async function saveProject(
  existingSlug: string | null,
  _prevState: SaveProjectState,
  formData: FormData
): Promise<SaveProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const ward = String(formData.get("ward") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amenities = formData.getAll("amenities").map(String).filter(Boolean);
  const coverFile = formData.get("cover_image");

  if (!name || !district) {
    return { error: "Vui lòng nhập tên dự án và quận." };
  }

  const slug = slugify(slugRaw || name);
  if (!slug) {
    return { error: "Slug không hợp lệ." };
  }

  const isCreate = existingSlug === null;

  if (isCreate || slug !== existingSlug) {
    const duplicate = await getProjectBySlug(slug);
    if (duplicate) {
      return { error: `Slug "${slug}" đã tồn tại, vui lòng chọn slug khác.` };
    }
  }

  let cover_image_url: string | undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      cover_image_url = await uploadProjectImage(coverFile);
    } catch {
      return { error: "Upload ảnh thất bại, vui lòng thử lại." };
    }
  }

  const baseFields: Omit<ProjectInput, "cover_image_url"> = {
    slug,
    name,
    district,
    ward: ward || null,
    address: address || null,
    description: description || null,
    amenities,
  };

  try {
    if (isCreate) {
      await createProject({ ...baseFields, cover_image_url });
    } else {
      const updateFields: Partial<ProjectInput> = { ...baseFields };
      if (cover_image_url) updateFields.cover_image_url = cover_image_url;
      await updateProject(existingSlug, updateFields);
    }
  } catch (err) {
    console.error("[saveProject]", err);
    return { error: "Lưu dự án thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/listings");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteProjectAction(slug: string): Promise<{ error?: string }> {
  try {
    await deleteProject(slug);
  } catch (err) {
    console.error("[deleteProjectAction]", err);
    const code23503 = typeof err === "object" && err && "code" in err && err.code === "23503";
    return {
      error: code23503
        ? "Không xoá được — dự án này vẫn còn phòng. Xoá hết phòng trong dự án trước."
        : "Xoá dự án thất bại, vui lòng thử lại.",
    };
  }
  revalidatePath("/admin/projects");
  return {};
}
