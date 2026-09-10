import { demoListings } from "@/data/listings";
import { demoProjects } from "@/data/projects";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Listing, ListingFilters, ListingWithProject, Project } from "@/lib/types";

function attachDemoProject(listing: Listing): ListingWithProject | null {
  const project = demoProjects.find((p) => p.id === listing.project_id);
  if (!project) return null;
  return { ...listing, project };
}

function applyFiltersInMemory(
  listings: ListingWithProject[],
  filters: ListingFilters
): ListingWithProject[] {
  return listings.filter((listing) => {
    if (filters.district && listing.project.district !== filters.district) return false;
    if (filters.type && listing.type !== filters.type) return false;
    if (filters.status && listing.status !== filters.status) return false;
    if (filters.minPrice != null && listing.price_million < filters.minPrice) return false;
    if (filters.maxPrice != null && listing.price_million > filters.maxPrice) return false;
    return true;
  });
}

/**
 * Lấy danh sách phòng theo bộ lọc, kèm dự án cha (project_id not null nên
 * luôn join được). Khi chưa cấu hình Supabase, fallback về data/listings.ts +
 * data/projects.ts để app vẫn chạy được ở môi trường dev/demo.
 */
export async function getListings(filters: ListingFilters = {}): Promise<ListingWithProject[]> {
  if (!isSupabaseConfigured || !supabase) {
    const sorted = [...demoListings].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const withProject = sorted
      .map(attachDemoProject)
      .filter((l): l is ListingWithProject => l !== null);
    return applyFiltersInMemory(withProject, filters);
  }

  // !inner để có thể lọc theo project.district (PostgREST chỉ cho filter trên
  // embedded resource khi join là inner join).
  let query = supabase
    .from("listings")
    .select("*, project:projects!inner(*)")
    .order("updated_at", { ascending: false });

  if (filters.district) query = query.eq("project.district", filters.district);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.minPrice != null) query = query.gte("price_million", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price_million", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ListingWithProject[] | null) ?? [];
}

export async function getListingByCode(code: string): Promise<ListingWithProject | null> {
  if (!isSupabaseConfigured || !supabase) {
    const listing = demoListings.find((l) => l.code === code);
    return listing ? attachDemoProject(listing) : null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*, project:projects!inner(*)")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data as ListingWithProject | null;
}

/** Các phòng khác cùng 1 dự án — dùng cho mục "Phòng khác cùng dự án" ở trang chi tiết. */
export async function getListingsByProject(
  project: Project,
  excludeCode: string
): Promise<ListingWithProject[]> {
  if (!isSupabaseConfigured || !supabase) {
    return demoListings
      .filter((l) => l.project_id === project.id && l.code !== excludeCode)
      .map((l) => ({ ...l, project }));
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*, project:projects!inner(*)")
    .eq("project_id", project.id)
    .neq("code", excludeCode);

  if (error) throw error;
  return (data as ListingWithProject[] | null) ?? [];
}
