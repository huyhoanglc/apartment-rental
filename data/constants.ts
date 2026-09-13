import type { ActivityLogEntry, ListingStatus, ListingType, RoomType } from "@/lib/types";

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

/** Loại Căn Hộ. */
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  phong_tro: "Phòng trọ",
  can_ho_dich_vu: "Căn hộ dịch vụ",
  chung_cu: "Chung cư",
  nha_nguyen_can: "Nhà nguyên căn",
};

/** Loại Phòng — độc lập với Loại Căn Hộ ở trên (vd 1 căn hộ dịch vụ có thể là Duplex hoặc Studio). */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  duplex: "Duplex",
  studio: "Studio",
  "1pn": "1 phòng ngủ",
  "2pn": "2 phòng ngủ",
  "3pn": "3 phòng ngủ",
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
