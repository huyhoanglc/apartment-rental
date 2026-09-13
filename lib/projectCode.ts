import { DISTRICT_CODES } from "@/data/constants";

/** Chữ cái đầu mỗi từ, in hoa, nối liền — vd "Nguyễn Hữu Cảnh" -> "NHC". */
export function initials(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Khớp linh hoạt (không phân biệt hoa/thường, có/không tiền tố "Quận") với DISTRICT_CODES. */
export function districtCode(district: string): string {
  const key = district.trim().toLowerCase().replace(/^quận\s*/, "");
  const match = Object.entries(DISTRICT_CODES).find(
    ([name]) => name.toLowerCase().replace(/^quận\s*/, "") === key
  );
  return match ? match[1] : `Q${initials(district)}`;
}

/** Mã nhà tự sinh: "Số nhà.Viết tắt tên đường.Viết tắt quận" — vd "22.NHC.QBTH". */
export function deriveProjectCode(houseNumber: string, street: string, district: string): string | null {
  if (!houseNumber.trim() && !street.trim()) return null;
  const parts = [houseNumber.trim(), initials(street), districtCode(district)].filter(Boolean);
  return parts.length > 0 ? parts.join(".") : null;
}
