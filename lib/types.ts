export type ListingStatus = "con_phong" | "hot" | "het_phong";

export type ListingType =
  | "phong_tro"
  | "studio"
  | "can_ho_mini"
  | "can_ho_dich_vu"
  | "nha_nguyen_can";

export interface Listing {
  id: string;
  code: string;
  title: string;
  district: string;
  ward: string | null;
  price_million: number;
  type: ListingType;
  area: number;
  amenities: string[];
  status: ListingStatus;
  image_url: string;
  image_urls: string[];
  description: string | null;
  updated_at: string;
  created_at: string;
}

export interface ListingFilters {
  district?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
}

export interface Lead {
  id?: string;
  phone: string;
  zalo?: string;
  district?: string;
  budget_million?: number;
  note?: string;
  created_at?: string;
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  phong_tro: "Phòng trọ",
  studio: "Studio",
  can_ho_mini: "Căn hộ mini",
  can_ho_dich_vu: "Căn hộ dịch vụ",
  nha_nguyen_can: "Nhà nguyên căn",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  con_phong: "Còn phòng",
  hot: "Hot",
  het_phong: "Hết phòng",
};

export const DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 4",
  "Quận 7",
  "Quận 10",
  "Bình Thạnh",
  "Phú Nhuận",
  "Gò Vấp",
  "Tân Bình",
  "Thủ Đức",
] as const;
