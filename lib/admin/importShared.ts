import ExcelJS from "exceljs";

export interface UploadedFile {
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

export function findColumn(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h));
}

function detectDelimiter(headerLine: string): "\t" | "," {
  return headerLine.includes("\t") ? "\t" : ",";
}

/** Tách 1 dòng CSV/TSV — với dấu phẩy thì xử lý luôn field có ngoặc kép (CSV chuẩn, để không vỡ khi 1 ô chứa dấu phẩy). */
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

function parseDelimitedText(text: string): string[][] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  return lines.map((line) => splitLine(line, delimiter));
}

function cellValueToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text; // hyperlink
    if ("richText" in value) return value.richText.map((t) => t.text).join(""); // rich text
    if ("result" in value) return value.result == null ? "" : String(value.result); // formula
    return "";
  }
  return String(value);
}

async function parseXlsxBuffer(buffer: Buffer): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  // Type defs của exceljs khai Buffer theo shape cũ, không khớp Buffer<ArrayBufferLike>
  // của @types/node hiện tại — ép kiểu vì runtime vẫn là Buffer thật, chỉ lệch khai báo type.
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const grid: string[][] = [];
  sheet.eachRow((row) => {
    const values = row.values as ExcelJS.CellValue[]; // index 0 luôn rỗng (exceljs đánh số cột từ 1)
    grid.push(values.slice(1).map(cellValueToString));
  });
  return grid;
}

/** Đọc file Excel (.xlsx/.xls) hoặc CSV/TSV thành lưới ô [dòng][cột] — dòng 0 là tiêu đề. */
export async function fileToGrid(file: UploadedFile): Promise<string[][]> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  return isExcel ? await parseXlsxBuffer(buffer) : parseDelimitedText(buffer.toString("utf-8"));
}
