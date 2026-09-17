// Lấy GOOGLE_DRIVE_REFRESH_TOKEN — chỉ cần chạy 1 lần (mỗi khi refresh token bị
// thu hồi thì chạy lại). Xem hướng dẫn tạo GOOGLE_DRIVE_CLIENT_ID/SECRET trong
// .env.example trước khi chạy script này.
//
// Chạy: npm run drive:auth  (yêu cầu GOOGLE_DRIVE_CLIENT_ID và
// GOOGLE_DRIVE_CLIENT_SECRET trong .env.local)
//
// Script mở 1 server tạm ở http://127.0.0.1:53682, in ra 1 link — mở link đó,
// đăng nhập đúng tài khoản Gmail công ty dùng để lưu ảnh, bấm Allow. Trình
// duyệt sẽ redirect về server tạm, script tự lấy refresh token và in ra để
// copy vào .env.local.
import { config } from "dotenv";
config({ path: ".env.local" });

import { createServer } from "node:http";
import { google } from "googleapis";

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;

const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Thiếu GOOGLE_DRIVE_CLIENT_ID hoặc GOOGLE_DRIVE_CLIENT_SECRET trong .env.local — xem .env.example"
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // bắt buộc để Google luôn trả refresh_token (không chỉ lần đầu)
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth2callback")) {
    res.writeHead(404).end();
    return;
  }

  const code = new URL(req.url, REDIRECT_URI).searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Thiếu tham số code.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Xong! Đóng tab này và quay lại terminal.</h2>");

    console.log("\nGOOGLE_DRIVE_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    console.log("Copy dòng trên vào .env.local (và vào biến môi trường trên hosting).");
  } catch (error) {
    res.writeHead(500).end("Lỗi lấy token, xem log ở terminal.");
    console.error(error);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("Mở link sau, đăng nhập đúng tài khoản Gmail dùng để lưu ảnh, rồi bấm Allow:\n");
  console.log(authUrl + "\n");
});
