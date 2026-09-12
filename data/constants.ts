import type { ActivityLogEntry, ListingStatus, ListingType } from "@/lib/types";

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

export const ACTIVITY_TABLE_LABELS: Record<ActivityLogEntry["table_name"], string> = {
  listings: "Phòng",
  projects: "Dự án",
  blog_posts: "Blog",
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityLogEntry["action"], string> = {
  insert: "Tạo mới",
  update: "Chỉnh sửa",
  delete: "Xoá",
};
