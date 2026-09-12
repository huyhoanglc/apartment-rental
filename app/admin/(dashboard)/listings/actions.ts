"use server";

import { revalidatePath } from "next/cache";
import {
  createListing,
  deleteListing,
  updateListing,
  updateListingStatus,
} from "@/lib/admin/listings";
import { importListingsFromFile, type ImportListingsResult } from "@/lib/admin/importListings";
import { uploadListingImage } from "@/lib/admin/storage";
import { getListingByCode } from "@/lib/listings";
import type { ListingInput, ListingStatus, ListingType } from "@/lib/types";

export interface SaveListingState {
  error?: string;
  success?: boolean;
}

const LISTING_TYPES: ListingType[] = [
  "phong_tro",
  "studio",
  "can_ho_mini",
  "can_ho_dich_vu",
  "nha_nguyen_can",
];

const LISTING_STATUSES: ListingStatus[] = ["con_phong", "hot", "het_phong"];

export async function saveListing(
  existingCode: string | null,
  _prevState: SaveListingState,
  formData: FormData
): Promise<SaveListingState> {
  const code = String(formData.get("code") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const project_id = String(formData.get("project_id") ?? "").trim();
  const priceRaw = String(formData.get("price_million") ?? "");
  const type = String(formData.get("type") ?? "") as ListingType;
  const areaRaw = String(formData.get("area") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  const description = String(formData.get("description") ?? "").trim();
  const amenities = formData.getAll("amenities").map(String).filter(Boolean);
  const imageFile = formData.get("image");

  if (!code || !title || !project_id || !type || !status) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc." };
  }
  if (!LISTING_TYPES.includes(type)) {
    return { error: "Loại hình không hợp lệ." };
  }
  if (!LISTING_STATUSES.includes(status)) {
    return { error: "Trạng thái không hợp lệ." };
  }

  const price_million = Number(priceRaw);
  const area = Number(areaRaw);
  if (!Number.isFinite(price_million) || price_million <= 0) {
    return { error: "Giá thuê phải là số dương." };
  }
  if (!Number.isFinite(area) || area <= 0) {
    return { error: "Diện tích phải là số dương." };
  }

  const isCreate = existingCode === null;

  if (isCreate) {
    const duplicate = await getListingByCode(code);
    if (duplicate) {
      return { error: `Mã căn "${code}" đã tồn tại, vui lòng chọn mã khác.` };
    }
  }

  let image_url: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      image_url = await uploadListingImage(imageFile);
    } catch {
      return { error: "Upload ảnh thất bại, vui lòng thử lại." };
    }
  }

  if (isCreate && !image_url) {
    return { error: "Vui lòng chọn ảnh cho tin mới." };
  }

  const baseFields: Omit<ListingInput, "image_url"> = {
    code,
    title,
    project_id,
    price_million,
    type,
    area,
    amenities,
    status,
    description: description || null,
  };

  try {
    if (isCreate) {
      // image_url luôn có ở nhánh này (đã kiểm tra ở trên)
      await createListing({ ...baseFields, image_url: image_url! });
    } else {
      const updateFields: Partial<ListingInput> = { ...baseFields };
      if (image_url) updateFields.image_url = image_url;
      await updateListing(existingCode, updateFields);
    }
  } catch (err) {
    console.error("[saveListing]", err);
    const code23503 = typeof err === "object" && err && "code" in err && err.code === "23503";
    return {
      error: code23503
        ? "Dự án đã chọn không hợp lệ, vui lòng chọn lại."
        : "Lưu tin thất bại, vui lòng thử lại.",
    };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function importListingsAction(
  formData: FormData
): Promise<ImportListingsResult & { error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { imported: 0, skipped: 0, error: "Vui lòng chọn file." };
  }

  try {
    const result = await importListingsFromFile(file);
    revalidatePath("/admin");
    return result;
  } catch (err) {
    console.error("[importListingsAction]", err);
    return {
      imported: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : "Import thất bại, vui lòng thử lại.",
    };
  }
}

export async function deleteListingAction(code: string): Promise<void> {
  await deleteListing(code);
  revalidatePath("/admin");
}

export async function updateListingStatusAction(
  code: string,
  status: ListingStatus
): Promise<void> {
  await updateListingStatus(code, status);
  revalidatePath("/admin");
}
