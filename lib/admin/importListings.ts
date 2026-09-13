import { createClient } from "@/lib/supabase/server";
import { fileToGrid, findColumn, normalizeHeader, type UploadedFile } from "@/lib/admin/importShared";
import { LISTING_STATUS_LABELS, LISTING_TYPE_LABELS, ROOM_TYPE_LABELS } from "@/data/constants";
import type { ListingStatus, ListingType, RoomType } from "@/lib/types";

export interface ImportListingsResult {
  imported: number;
  skipped: number;
}

interface ParsedRow {
  projectCode: string;
  code: string;
  /** null = chưa nhập, tự sinh sau khi biết tên dự án (xem buildAutoTitle). */
  title: string | null;
  priceMillion: number;
  area: number;
  type: ListingType;
  roomType: RoomType | null;
  status: ListingStatus;
  imageUrl: string;
  description: string | null;
}

const HEADER_ALIASES = {
  projectCode: ["mã nhà", "ma nha"],
  code: ["mã phòng", "ma phong"],
  title: ["tiêu đề", "tieu de"],
  price: ["giá (triệu)", "gia (trieu)", "giá", "gia"],
  area: ["diện tích (m²)", "dien tich (m2)", "diện tích", "dien tich"],
  type: ["loại căn hộ", "loai can ho", "loại hình", "loai hinh"],
  roomType: ["loại phòng", "loai phong"],
  status: ["trạng thái", "trang thai"],
  imageUrl: ["link ảnh", "link anh", "hình ảnh", "hinh anh"],
  description: ["mô tả", "mo ta"],
};

const TYPE_BY_LABEL = new Map<string, ListingType>(
  (Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][]).map(([value, label]) => [
    normalizeHeader(label),
    value,
  ])
);
const ROOM_TYPE_BY_LABEL = new Map<string, RoomType>(
  (Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][]).map(([value, label]) => [
    normalizeHeader(label),
    value,
  ])
);
const STATUS_BY_LABEL = new Map<string, ListingStatus>(
  (Object.entries(LISTING_STATUS_LABELS) as [ListingStatus, string][]).map(([value, label]) => [
    normalizeHeader(label),
    value,
  ])
);

/** Tiêu đề tự sinh khi cột "Tiêu đề" để trống — vd "Duplex - Căn hộ dịch vụ tại 22 Nguyễn Hữu Cảnh". */
function buildAutoTitle(type: ListingType, roomType: RoomType | null, projectName: string): string {
  const prefix = roomType ? `${ROOM_TYPE_LABELS[roomType]} - ` : "";
  return `${prefix}${LISTING_TYPE_LABELS[type]} tại ${projectName}`;
}

interface RowIssue {
  row: number;
  reason: string;
}

/** grid[0] là dòng tiêu đề, các dòng sau là dữ liệu. */
function gridToRows(grid: string[][]): { rows: ParsedRow[]; issues: RowIssue[] } {
  if (grid.length < 2) return { rows: [], issues: [] };

  const headers = grid[0].map(normalizeHeader);
  const projectCodeIdx = findColumn(headers, HEADER_ALIASES.projectCode);
  const codeIdx = findColumn(headers, HEADER_ALIASES.code);
  const titleIdx = findColumn(headers, HEADER_ALIASES.title);
  const priceIdx = findColumn(headers, HEADER_ALIASES.price);
  const areaIdx = findColumn(headers, HEADER_ALIASES.area);
  const typeIdx = findColumn(headers, HEADER_ALIASES.type);
  const roomTypeIdx = findColumn(headers, HEADER_ALIASES.roomType);
  const statusIdx = findColumn(headers, HEADER_ALIASES.status);
  const imageUrlIdx = findColumn(headers, HEADER_ALIASES.imageUrl);
  const descriptionIdx = findColumn(headers, HEADER_ALIASES.description);

  if (projectCodeIdx === -1 || codeIdx === -1) {
    throw new Error('File cần có cột "Mã nhà" và "Mã phòng" ở dòng tiêu đề đầu tiên.');
  }

  const rows: ParsedRow[] = [];
  const issues: RowIssue[] = [];

  grid.slice(1).forEach((cells, i) => {
    const rowNumber = i + 2; // +1 bỏ header, +1 để đúng số dòng thấy trên Excel (dòng 1 là tiêu đề)
    const projectCode = (cells[projectCodeIdx] ?? "").trim();
    const code = (cells[codeIdx] ?? "").trim();
    const title = titleIdx !== -1 ? (cells[titleIdx] ?? "").trim() || null : null;
    const priceRaw = priceIdx !== -1 ? (cells[priceIdx] ?? "").trim() : "";
    const areaRaw = areaIdx !== -1 ? (cells[areaIdx] ?? "").trim() : "";
    const typeLabel = typeIdx !== -1 ? normalizeHeader(cells[typeIdx] ?? "") : "";
    const roomTypeLabel = roomTypeIdx !== -1 ? normalizeHeader(cells[roomTypeIdx] ?? "") : "";
    const statusLabel = statusIdx !== -1 ? normalizeHeader(cells[statusIdx] ?? "") : "";
    const imageUrl = imageUrlIdx !== -1 ? (cells[imageUrlIdx] ?? "").trim() : "";
    const description = descriptionIdx !== -1 ? (cells[descriptionIdx] ?? "").trim() || null : null;

    if (!projectCode && !code && !title) return; // dòng trống hoàn toàn, bỏ qua âm thầm

    if (!projectCode) return issues.push({ row: rowNumber, reason: "thiếu Mã nhà" });
    if (!code) return issues.push({ row: rowNumber, reason: "thiếu Mã phòng" });

    const priceMillion = Number(priceRaw.replace(",", "."));
    if (!Number.isFinite(priceMillion) || priceMillion <= 0) {
      return issues.push({ row: rowNumber, reason: "Giá không hợp lệ" });
    }

    const area = Number(areaRaw.replace(",", "."));
    if (!Number.isFinite(area) || area <= 0) {
      return issues.push({ row: rowNumber, reason: "Diện tích không hợp lệ" });
    }

    const type = TYPE_BY_LABEL.get(typeLabel);
    if (!type) {
      return issues.push({
        row: rowNumber,
        reason: `Loại Căn Hộ "${typeLabel}" không khớp (${Object.values(LISTING_TYPE_LABELS).join(", ")})`,
      });
    }

    let roomType: RoomType | null = null;
    if (roomTypeLabel) {
      const matched = ROOM_TYPE_BY_LABEL.get(roomTypeLabel);
      if (!matched) {
        return issues.push({
          row: rowNumber,
          reason: `Loại Phòng "${roomTypeLabel}" không khớp (${Object.values(ROOM_TYPE_LABELS).join(", ")})`,
        });
      }
      roomType = matched;
    }

    const status = STATUS_BY_LABEL.get(statusLabel) ?? "con_phong";

    if (!imageUrl) return issues.push({ row: rowNumber, reason: "thiếu Link ảnh" });

    rows.push({ projectCode, code, title, priceMillion, area, type, roomType, status, imageUrl, description });
  });

  return { rows, issues };
}

/**
 * Import hàng loạt Phòng từ file Excel (.xlsx/.xls) hoặc CSV/TSV với cấu
 * trúc cột: Mã nhà (tham chiếu Project.code), Mã phòng, Giá (triệu), Diện
 * tích (m²), Loại Căn Hộ (đúng nhãn hiển thị vd "Phòng trọ"), Loại Phòng
 * (tuỳ chọn, vd "Duplex"), Trạng thái (để trống = "Còn phòng"), Link ảnh,
 * Tiêu đề (tuỳ chọn — để trống thì tự sinh từ Loại Phòng/Loại Căn Hộ/tên dự
 * án, xem buildAutoTitle), Mô tả (tuỳ chọn).
 */
export async function importListingsFromFile(file: UploadedFile): Promise<ImportListingsResult> {
  const grid = await fileToGrid(file);
  const { rows, issues } = gridToRows(grid);
  if (rows.length === 0) return { imported: 0, skipped: issues.length };

  const supabase = createClient();
  const [{ data: projects, error: projectsError }, { data: existingListings, error: listingsError }] =
    await Promise.all([
      supabase.from("projects").select("id, code, name").not("code", "is", null),
      supabase.from("listings").select("code"),
    ]);
  if (projectsError) throw projectsError;
  if (listingsError) throw listingsError;

  const projectByCode = new Map(
    (projects ?? []).map((p: { id: string; code: string; name: string }) => [p.code, p])
  );
  const usedCodes = new Set((existingListings ?? []).map((l: { code: string }) => l.code));

  const toInsert: Record<string, unknown>[] = [];
  let skipped = issues.length;

  for (const row of rows) {
    const project = projectByCode.get(row.projectCode);
    if (!project) {
      skipped++;
      continue;
    }
    if (usedCodes.has(row.code)) {
      skipped++;
      continue;
    }
    usedCodes.add(row.code);

    toInsert.push({
      code: row.code,
      title: row.title ?? buildAutoTitle(row.type, row.roomType, project.name),
      project_id: project.id,
      price_million: row.priceMillion,
      area: row.area,
      type: row.type,
      room_type: row.roomType,
      status: row.status,
      image_url: row.imageUrl,
      description: row.description,
    });
  }

  if (toInsert.length === 0) return { imported: 0, skipped };

  const { error: insertError } = await supabase.from("listings").insert(toInsert);
  if (insertError) throw insertError;

  return { imported: toInsert.length, skipped };
}
