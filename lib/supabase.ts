import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Client dùng anon key, an toàn để dùng ở Server Component / Route Handler.
 * Chỉ khởi tạo khi đã có env — trước khi cấu hình Supabase, các hàm trong
 * lib/listings.ts sẽ fallback sang data/listings.ts thay vì gọi client này.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

const LISTING_IMAGES_BUCKET = "listing-images";

/**
 * Upload 1 ảnh lên bucket public "listing-images" và trả về URL public ổn định.
 * Dùng ở trang admin (giai đoạn sau) hoặc script seed dữ liệu ban đầu.
 */
export async function uploadListingImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  if (!supabase) {
    throw new Error(
      "Supabase chưa được cấu hình — thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env.local"
    );
  }

  const path = `${Date.now()}-${fileName}`;
  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
