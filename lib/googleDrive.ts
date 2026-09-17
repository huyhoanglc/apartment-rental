import { Readable } from "node:stream";
import { google, drive_v3 } from "googleapis";

/**
 * Mirror ảnh sang Google Drive (tài khoản Gmail cá nhân của công ty, không
 * phải Workspace) để sale vào xem/tải trực tiếp trong Drive — song song với
 * ảnh chính vẫn lưu ở Supabase Storage (web dùng Supabase để hiển thị: có
 * CDN, không lo Google chặn hotlink).
 *
 * Thiếu bất kỳ biến env nào bên dưới thì tự tắt tính năng này (no-op), không
 * throw. Lỗi khi gọi Drive API cũng chỉ log ra console — mirror thất bại
 * không được làm hỏng luồng lưu tin chính (giống lib/telegram.ts).
 *
 * Cách lấy GOOGLE_DRIVE_REFRESH_TOKEN: chạy `npm run drive:auth` (xem
 * scripts/getGoogleDriveRefreshToken.ts), làm theo hướng dẫn trong .env.example.
 */
function getDriveClient(): { drive: drive_v3.Drive; rootFolderId: string } | null {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  return { drive: google.drive({ version: "v3", auth }), rootFolderId };
}

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  const escapedName = name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const { data } = await drive.files.list({
    q: `name = '${escapedName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    spaces: "drive",
  });

  const existingId = data.files?.[0]?.id;
  if (existingId) return existingId;

  const created = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id",
  });

  if (!created.data.id) throw new Error("Google Drive không trả về id folder vừa tạo");
  return created.data.id;
}

/**
 * Đẩy 1 ảnh vào Drive, dưới folder con `folderName` (tạo mới nếu chưa có)
 * nằm trong GOOGLE_DRIVE_ROOT_FOLDER_ID. Best-effort — luôn resolve, không
 * bao giờ reject.
 */
export async function mirrorImageToDrive(
  folderName: string,
  fileName: string,
  file: File
): Promise<void> {
  const client = getDriveClient();
  if (!client) return;

  try {
    const { drive, rootFolderId } = client;
    const folderId = await findOrCreateFolder(drive, folderName, rootFolderId);
    const buffer = Buffer.from(await file.arrayBuffer());

    await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: file.type || "application/octet-stream", body: Readable.from(buffer) },
      fields: "id",
    });
  } catch (error) {
    console.error("[googleDrive] mirror ảnh thất bại:", error);
  }
}
