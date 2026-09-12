import { createClient } from "@/lib/supabase/server";
import type { ListingInput, ListingStatus } from "@/lib/types";

export async function createListing(input: ListingInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("listings").insert(input);
  if (error) throw error;
}

export async function updateListing(code: string, input: Partial<ListingInput>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update(input).eq("code", code);
  if (error) throw error;
}

export async function deleteListing(code: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("listings").delete().eq("code", code);
  if (error) throw error;
}

export async function updateListingStatus(code: string, status: ListingStatus): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update({ status }).eq("code", code);
  if (error) throw error;
}

/** Số phòng do 1 tài khoản tự tạo — hiện ở "Hồ sơ" (/admin/security) như 1 thành tích nhỏ. */
export async function countListingsCreatedBy(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId);
  if (error) throw error;
  return count ?? 0;
}
