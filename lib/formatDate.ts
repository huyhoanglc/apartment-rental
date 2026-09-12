const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * `toLocaleString("vi-VN")` không tự đổi múi giờ — trên server (Vercel chạy
 * UTC) nó chỉ format giờ UTC theo kiểu Việt Nam chứ không cộng thêm 7 tiếng,
 * nên hiện sai giờ thực tế. Luôn chỉ định timeZone rõ ràng để đúng giờ VN dù
 * chạy ở server nào.
 */
export function formatVNDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("vi-VN", { timeZone: VN_TIME_ZONE });
}

export function formatVNDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("vi-VN", { timeZone: VN_TIME_ZONE });
}
