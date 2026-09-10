import { createClient } from "@/lib/supabase/server";

/**
 * Upload ảnh từ trang admin — dùng client authenticated (RLS storage yêu cầu
 * to authenticated), khác với uploadListingImage trong lib/supabase.ts (client
 * anon, dùng cho script seed chạy bằng service role).
 */
async function uploadImage(bucket: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadListingImage(file: File): Promise<string> {
  return uploadImage("listing-images", file);
}

export function uploadBlogImage(file: File): Promise<string> {
  return uploadImage("blog-images", file);
}
