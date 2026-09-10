import { createClient } from "@/lib/supabase/server";

const LISTING_IMAGES_BUCKET = "listing-images";

/**
 * Upload ảnh tin thuê từ trang admin — dùng client authenticated (RLS storage
 * yêu cầu to authenticated), khác với uploadListingImage trong lib/supabase.ts
 * (client anon, dùng cho script seed chạy bằng service role).
 */
export async function uploadListingImage(file: File): Promise<string> {
  const supabase = createClient();
  const path = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
