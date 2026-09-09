import { demoListings } from "@/data/listings";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Listing, ListingFilters } from "@/lib/types";

function applyFiltersInMemory(listings: Listing[], filters: ListingFilters): Listing[] {
  return listings.filter((listing) => {
    if (filters.district && listing.district !== filters.district) return false;
    if (filters.type && listing.type !== filters.type) return false;
    if (filters.status && listing.status !== filters.status) return false;
    if (filters.minPrice != null && listing.price_million < filters.minPrice) return false;
    if (filters.maxPrice != null && listing.price_million > filters.maxPrice) return false;
    return true;
  });
}

/**
 * Lấy danh sách tin thuê theo bộ lọc.
 * Khi chưa cấu hình Supabase (SUPABASE_URL/SUPABASE_ANON_KEY), fallback về
 * data/listings.ts để app vẫn chạy được ở môi trường dev/demo.
 */
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  if (!isSupabaseConfigured || !supabase) {
    const sorted = [...demoListings].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return applyFiltersInMemory(sorted, filters);
  }

  let query = supabase.from("listings").select("*").order("updated_at", { ascending: false });

  if (filters.district) query = query.eq("district", filters.district);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.minPrice != null) query = query.gte("price_million", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price_million", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getListingByCode(code: string): Promise<Listing | null> {
  if (!isSupabaseConfigured || !supabase) {
    return demoListings.find((listing) => listing.code === code) ?? null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data;
}
