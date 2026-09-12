import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export interface ImportProjectsResult {
  imported: number;
  skipped: number;
}

interface ParsedRow {
  address: string;
  district: string;
  ownerPhone: string | null;
}

// Khớp tên cột không phân biệt hoa/thường, khoảng trắng thừa (file thật có
// header "Quận " thừa 1 dấu cách). Các cột khác (Người Cập Nhật, Hệ Thống,
// Tên Chủ Nhà, Link tổng...) cố ý không đọc tới — theo đúng yêu cầu chỉ lấy
// Địa chỉ/Quận/Số chủ, còn lại bỏ qua hoàn toàn.
const HEADER_ALIASES: Record<"address" | "district" | "ownerPhone", string[]> = {
  address: ["địa chỉ", "dia chi", "address"],
  district: ["quận", "quan", "district"],
  ownerPhone: ["số chủ", "so chu", "sđt chủ", "sdt chu"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function detectDelimiter(headerLine: string): "\t" | "," {
  return headerLine.includes("\t") ? "\t" : ",";
}

/** Tách 1 dòng theo delimiter — với dấu phẩy thì xử lý luôn field có ngoặc kép (CSV chuẩn, để không vỡ khi địa chỉ chứa dấu phẩy). */
function splitLine(line: string, delimiter: "\t" | ","): string[] {
  if (delimiter === "\t") return line.split("\t");

  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseRows(text: string): { rows: ParsedRow[]; skipped: number } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return { rows: [], skipped: 0 };

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map(normalizeHeader);

  const addressIdx = headers.findIndex((h) => HEADER_ALIASES.address.includes(h));
  const districtIdx = headers.findIndex((h) => HEADER_ALIASES.district.includes(h));
  const ownerPhoneIdx = headers.findIndex((h) => HEADER_ALIASES.ownerPhone.includes(h));

  if (addressIdx === -1 || districtIdx === -1) {
    throw new Error('File cần có cột "Địa chỉ" và "Quận" ở dòng tiêu đề đầu tiên.');
  }

  const rows: ParsedRow[] = [];
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cells = splitLine(line, delimiter);
    const address = (cells[addressIdx] ?? "").trim();
    const district = (cells[districtIdx] ?? "").trim();

    if (!address || !district) {
      skipped++;
      continue;
    }

    const ownerPhone = ownerPhoneIdx !== -1 ? (cells[ownerPhoneIdx] ?? "").trim() || null : null;
    rows.push({ address, district, ownerPhone });
  }

  return { rows, skipped };
}

/**
 * Import hàng loạt Dự án từ file CSV/TSV xuất ra từ Excel. Chỉ đọc 3 cột
 * (Địa chỉ, Quận, Số chủ) — các cột khác trong file (Người Cập Nhật, Hệ
 * Thống, Tên Chủ Nhà, Link tổng...) bị bỏ qua theo đúng yêu cầu.
 *
 * Tên dự án = chính địa chỉ (file không có cột tên riêng) — sửa lại tên sau
 * nếu muốn. "Số chủ" hiện đang lẫn cả tên lẫn SĐT chủ nhà trong 1 ô nên lưu
 * nguyên văn vào owner_phone, tách tay sau qua form sửa dự án.
 */
export async function importProjectsFromText(text: string): Promise<ImportProjectsResult> {
  const { rows, skipped } = parseRows(text);
  if (rows.length === 0) return { imported: 0, skipped };

  const supabase = createClient();
  const { data: existing, error: fetchError } = await supabase.from("projects").select("slug");
  if (fetchError) throw fetchError;

  const usedSlugs = new Set((existing ?? []).map((p: { slug: string }) => p.slug));

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

  const toInsert = rows.map((row) => ({
    slug: uniqueSlug(slugify(row.address) || "du-an"),
    name: row.address,
    district: row.district,
    address: row.address,
    owner_phone: row.ownerPhone,
  }));

  const { error: insertError } = await supabase.from("projects").insert(toInsert);
  if (insertError) throw insertError;

  return { imported: toInsert.length, skipped };
}
