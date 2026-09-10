export type ListingStatus = "con_phong" | "hot" | "het_phong";

export type ListingType =
  | "phong_tro"
  | "studio"
  | "can_ho_mini"
  | "can_ho_dich_vu"
  | "nha_nguyen_can";

export interface Project {
  id: string;
  slug: string;
  name: string;
  district: string;
  ward: string | null;
  address: string | null;
  description: string | null;
  cover_image_url: string | null;
  image_urls: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

/** Field admin nhập ở form thêm/sửa dự án. */
export type ProjectInput = Omit<
  Project,
  "id" | "created_at" | "updated_at" | "image_urls" | "cover_image_url"
> & { image_urls?: string[]; cover_image_url?: string };

/**
 * Nội dung phòng (title, amenities, description) hiện chỉ lưu 1 ngôn ngữ.
 * Muốn hỗ trợ đa ngôn ngữ cho nội dung phòng (khác với UI tĩnh đã dịch qua
 * next-intl) thì cần thêm cột title_en/title_zh, amenities_en/amenities_zh...
 * vào bảng `listings` — chưa làm ở giai đoạn này.
 */
export interface Listing {
  id: string;
  code: string;
  title: string;
  project_id: string;
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

/** Listing kèm dự án cha — kiểu trả về của mọi hàm đọc công khai (lib/listings.ts). */
export interface ListingWithProject extends Listing {
  project: Project;
}

/** Field admin nhập ở form thêm/sửa phòng (không gồm id/timestamps do DB tự sinh). */
export type ListingInput = Omit<Listing, "id" | "created_at" | "updated_at" | "image_urls">;

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

/** Lead đã lưu trong Supabase, đọc ở trang admin. */
export interface LeadRecord extends Required<Pick<Lead, "id" | "phone" | "created_at">> {
  zalo: string | null;
  district: string | null;
  budget_million: number | null;
  note: string | null;
  contacted: boolean;
}

export interface Staff {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Field admin nhập ở form thêm/sửa nhân viên. */
export type StaffInput = Omit<Staff, "id" | "created_at" | "updated_at">;

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

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Field admin nhập ở form thêm/sửa bài blog. */
export type BlogPostInput = Omit<
  BlogPost,
  "id" | "created_at" | "updated_at" | "published_at" | "cover_image_url"
> & { cover_image_url?: string };

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
