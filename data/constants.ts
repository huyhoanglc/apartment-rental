import type { ActivityLogEntry, ListingStatus, ListingType, RoomType } from "@/lib/types";

/**
 * Viết tắt quận dùng để tự sinh Mã nhà (xem lib/projectCode.ts) — vd
 * "Bình Thạnh" -> "QBTH" chứ không phải "QBT" để khỏi trùng Bình Tân. Đổi
 * quy ước viết tắt thì sửa ở đây, không cần đụng tới logic sinh mã.
 */
export const DISTRICT_CODES: Record<string, string> = {
  "Quận 1": "Q1",
  "Quận 3": "Q3",
  "Quận 4": "Q4",
  "Quận 5": "Q5",
  "Quận 6": "Q6",
  "Quận 7": "Q7",
  "Quận 8": "Q8",
  "Quận 10": "Q10",
  "Quận 11": "Q11",
  "Quận 12": "Q12",
  "Bình Tân": "QBT",
  "Bình Thạnh": "QBTH",
  "Gò Vấp": "QGV",
  "Phú Nhuận": "QPN",
  "Tân Bình": "QTB",
  "Tân Phú": "QTP",
  "Thủ Đức": "TD",
  "Bình Chánh": "BC",
  "Cần Giờ": "CG",
  "Củ Chi": "CC",
  "Hóc Môn": "HM",
  "Nhà Bè": "NB",
};

export const DISTRICTS = Object.keys(DISTRICT_CODES);

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
