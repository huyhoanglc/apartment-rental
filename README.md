# Tổ Thuê TP.HCM

Web tìm phòng trọ / studio / căn hộ cho thuê tại TP.HCM. Next.js 14 (App Router) + TypeScript +
Tailwind CSS, dữ liệu và ảnh lưu trên Supabase (Postgres + Storage), deploy trên Vercel.

## 1. Cài đặt local

```bash
npm install
npm run dev
```

Mặc định (chưa cấu hình Supabase) app chạy với dữ liệu mẫu trong [data/listings.ts](data/listings.ts)
để bạn xem giao diện ngay mà không cần setup gì thêm.

## 2. Kết nối Supabase (bắt buộc để có dữ liệu thật)

1. Tạo project mới tại [supabase.com](https://supabase.com) (gói Free).
2. Vào **SQL Editor**, dán toàn bộ nội dung [supabase/schema.sql](supabase/schema.sql) và chạy
   một lần — script này tạo bảng `listings`, `leads`, bật Row Level Security, và tạo bucket
   Storage `listing-images` (public).
3. Vào **Project Settings > API**, copy `Project URL` và khoá `anon public`.
4. Tạo file `.env.local` ở gốc dự án (đã nằm trong `.gitignore`, không commit) theo mẫu
   [.env.example](.env.example):

   ```
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_ZALO_CONTACT=0901234567
   ```

   `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng cho script seed dữ liệu chạy local, **không** được dùng
   trong code app và không commit lên git.

5. Nạp dữ liệu mẫu vào Supabase (tuỳ chọn, để có sẵn vài tin thuê demo):

   ```bash
   npm run seed
   ```

6. Chạy lại `npm run dev` — app sẽ tự chuyển sang đọc dữ liệu thật từ Supabase.

### Thêm/sửa tin thuê

Ở giai đoạn hiện tại (chưa có trang admin), thêm/sửa/xoá tin trực tiếp trong bảng `listings`
qua **Supabase Dashboard > Table Editor**. Upload ảnh vào bucket `listing-images` (Storage), copy
link public dạng `https://<project>.supabase.co/storage/v1/object/public/listing-images/<file>`
rồi dán vào cột `image_url` (ảnh bìa) hoặc `image_urls` (mảng ảnh, hiển thị ở trang chi tiết).

## 3. Deploy lên Vercel

1. Push code lên GitHub (repo đã có sẵn tại `origin`).
2. Import project vào [Vercel](https://vercel.com) từ repo GitHub này.
3. Trong **Project Settings > Environment Variables**, thêm:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ZALO_CONTACT` (số điện thoại/Zalo OA thật để nhận tin nhắn khách thuê)

   Không thêm `SUPABASE_SERVICE_ROLE_KEY` vào Vercel — key này chỉ cần chạy local để seed dữ liệu.
4. Deploy. Vercel cấp domain tạm dạng `*.vercel.app`; gắn domain riêng sau trong
   **Project Settings > Domains** khi đã mua domain.

## Cấu trúc chính

- `app/` — route App Router: trang chủ (`page.tsx`), trang chi tiết tin (`tin/[code]`), route
  handlers (`api/listings`, `api/leads`)
- `components/` — Header, Hero, ListingCard, ListingSection, DistrictLinks, AiFinder,
  TrustSection, Footer, ZaloButton, LeadForm
- `lib/` — `types.ts` (kiểu dữ liệu), `supabase.ts` (client + upload ảnh), `listings.ts` /
  `leads.ts` (truy vấn dữ liệu, có fallback dữ liệu mẫu khi chưa cấu hình Supabase)
- `data/listings.ts` — dữ liệu mẫu/seed, dùng làm fallback dev và nguồn cho `npm run seed`
- `supabase/schema.sql` — script khởi tạo bảng, RLS, bucket Storage

## Việc chưa làm (giai đoạn sau)

Trang admin quản lý tin (dùng Supabase Dashboard trong lúc chờ), trợ lý AI tìm nhà thật (hiện là
UI demo), đa ngôn ngữ, bản đồ hiển thị tin thuê.
