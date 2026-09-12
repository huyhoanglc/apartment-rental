import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { fileToGrid, findColumn, normalizeHeader, type UploadedFile } from "@/lib/admin/importShared";

export interface ImportProjectsResult {
  imported: number;
  skipped: number;
}

interface ParsedRow {
  code: string | null;
  houseNumber: string;
  street: string;
  address: string;
  ward: string | null;
  district: string;
  ownerName: string | null;
  ownerPhone: string | null;
}

// Khớp tên cột không phân biệt hoa/thường, khoảng trắng thừa. Số nhà + Tên
// đường được nối lại thành 1 địa chỉ — Phường/Quận/Tên chủ/SĐT chủ giữ
// riêng đúng theo cấu trúc cột trong file.
const HEADER_ALIASES = {
  code: ["mã nhà", "ma nha"],
  houseNumber: ["số nhà", "so nha"],
  street: ["tên đường", "ten duong"],
  ward: ["phường", "phuong"],
  district: ["quận", "quan"],
  ownerName: ["tên chủ", "ten chu"],
  ownerPhone: ["số điện thoại chủ", "so dien thoai chu", "sđt chủ", "sdt chu"],
};

// Viết tắt quận theo quy ước riêng (không phải cứ lấy chữ cái đầu — vd Bình
// Thạnh dùng "BTH" chứ không phải "BT" để khỏi trùng Bình Tân). Quận đánh số
// (Quận 1, Quận 3...) tự suy ra "Q" + số, không cần liệt kê từng quận.
const NAMED_DISTRICT_CODES: Record<string, string> = {
  "bình thạnh": "BTH",
  "tân bình": "TB",
  "tân phú": "TP",
  "bình tân": "BT",
  "gò vấp": "GV",
  "thủ đức": "TĐ",
  "phú nhuận": "PN",
};

/** Chữ cái đầu mỗi từ, in hoa, nối liền — vd "Nguyễn Hữu Cảnh" -> "NHC". */
function initials(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** "Quận 1" -> "Q1", "Bình Thạnh"/"Quận Bình Thạnh" -> "QBTH". */
function districtCode(district: string): string {
  const key = district.trim().toLowerCase().replace(/^quận\s*/, "");
  const numbered = key.match(/^(\d+)$/);
  if (numbered) return `Q${numbered[1]}`;
  return `Q${NAMED_DISTRICT_CODES[key] ?? initials(district)}`;
}

/** Mã nhà tự sinh khi để trống: "Số nhà.Viết tắt tên đường.Viết tắt quận" — vd "22.NHC.QBTH". */
function deriveProjectCode(houseNumber: string, street: string, district: string): string | null {
  if (!houseNumber && !street) return null;
  const parts = [houseNumber, initials(street), districtCode(district)].filter(Boolean);
  return parts.length > 0 ? parts.join(".") : null;
}

/** grid[0] là dòng tiêu đề, các dòng sau là dữ liệu. */
function gridToRows(grid: string[][]): { rows: ParsedRow[]; skipped: number } {
  if (grid.length < 2) return { rows: [], skipped: 0 };

  const headers = grid[0].map(normalizeHeader);
  const codeIdx = findColumn(headers, HEADER_ALIASES.code);
  const houseNumberIdx = findColumn(headers, HEADER_ALIASES.houseNumber);
  const streetIdx = findColumn(headers, HEADER_ALIASES.street);
  const wardIdx = findColumn(headers, HEADER_ALIASES.ward);
  const districtIdx = findColumn(headers, HEADER_ALIASES.district);
  const ownerNameIdx = findColumn(headers, HEADER_ALIASES.ownerName);
  const ownerPhoneIdx = findColumn(headers, HEADER_ALIASES.ownerPhone);

  if ((houseNumberIdx === -1 && streetIdx === -1) || districtIdx === -1) {
    throw new Error('File cần có cột "Số nhà"/"Tên đường" và "Quận" ở dòng tiêu đề đầu tiên.');
  }

  const rows: ParsedRow[] = [];
  let skipped = 0;

  for (const cells of grid.slice(1)) {
    const houseNumber = houseNumberIdx !== -1 ? (cells[houseNumberIdx] ?? "").trim() : "";
    const street = streetIdx !== -1 ? (cells[streetIdx] ?? "").trim() : "";
    const address = [houseNumber, street].filter(Boolean).join(" ");
    const district = (cells[districtIdx] ?? "").trim();

    if (!address || !district) {
      skipped++;
      continue;
    }

    rows.push({
      code: codeIdx !== -1 ? (cells[codeIdx] ?? "").trim() || null : null,
      houseNumber,
      street,
      address,
      ward: wardIdx !== -1 ? (cells[wardIdx] ?? "").trim() || null : null,
      district,
      ownerName: ownerNameIdx !== -1 ? (cells[ownerNameIdx] ?? "").trim() || null : null,
      ownerPhone: ownerPhoneIdx !== -1 ? (cells[ownerPhoneIdx] ?? "").trim() || null : null,
    });
  }

  return { rows, skipped };
}

/**
 * Import hàng loạt Dự án từ file Excel (.xlsx/.xls) hoặc CSV/TSV với cấu
 * trúc cột: Mã nhà, Số nhà, Tên đường, Phường, Quận, Tên chủ, Số điện thoại
 * chủ. "Mã nhà" để trống thì tự sinh theo công thức "Số nhà.Viết tắt tên
 * đường.Viết tắt quận" (xem deriveProjectCode) để Phòng import hàng loạt
 * tham chiếu đúng dự án — dòng nào có Mã nhà (nhập tay hoặc tự sinh) trùng
 * dự án đã có/dòng khác trong cùng file sẽ bị bỏ qua (không tự đổi mã, tránh
 * phá tham chiếu bên file Phòng).
 *
 * Tên dự án = Số nhà + Tên đường (file không có cột tên riêng) — sửa lại
 * sau nếu muốn.
 */
export async function importProjectsFromFile(file: UploadedFile): Promise<ImportProjectsResult> {
  const grid = await fileToGrid(file);
  const { rows, skipped: skippedMissingFields } = gridToRows(grid);
  if (rows.length === 0) return { imported: 0, skipped: skippedMissingFields };

  const supabase = createClient();
  const { data: existing, error: fetchError } = await supabase.from("projects").select("slug, code");
  if (fetchError) throw fetchError;

  const usedSlugs = new Set((existing ?? []).map((p: { slug: string }) => p.slug));
  const usedCodes = new Set(
    (existing ?? []).map((p: { code: string | null }) => p.code).filter((c): c is string => Boolean(c))
  );

  function uniqueSlug(base: string): string {
    let slug = base;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);
    return slug;
  }

  let skippedDuplicateCode = 0;
  const toInsert: Record<string, unknown>[] = [];

  for (const row of rows) {
    const code = row.code || deriveProjectCode(row.houseNumber, row.street, row.district);

    if (code && usedCodes.has(code)) {
      skippedDuplicateCode++;
      continue;
    }
    if (code) usedCodes.add(code);

    toInsert.push({
      slug: uniqueSlug(slugify(row.address) || "du-an"),
      code,
      name: row.address,
      district: row.district,
      ward: row.ward,
      address: row.address,
      owner_name: row.ownerName,
      owner_phone: row.ownerPhone,
    });
  }

  if (toInsert.length === 0) return { imported: 0, skipped: skippedMissingFields + skippedDuplicateCode };

  const { error: insertError } = await supabase.from("projects").insert(toInsert);
  if (insertError) throw insertError;

  return { imported: toInsert.length, skipped: skippedMissingFields + skippedDuplicateCode };
}
