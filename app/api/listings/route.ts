import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/listings";
import type { ListingFilters, ListingStatus, ListingType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: ListingFilters = {
    district: searchParams.get("district") || undefined,
    type: (searchParams.get("type") as ListingType) || undefined,
    status: (searchParams.get("status") as ListingStatus) || undefined,
    minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
  };

  try {
    const listings = await getListings(filters);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("[GET /api/listings]", error);
    return NextResponse.json({ error: "Không tải được danh sách tin thuê" }, { status: 500 });
  }
}
