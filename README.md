# Tổ Thuê TP.HCM

Web tìm phòng trọ / studio / căn hộ cho thuê tại TP.HCM. Next.js 14 (App Router) + TypeScript +
Tailwind CSS, dữ liệu và ảnh lưu trên Supabase (Postgres + Storage + Auth), deploy trên Vercel.
Hỗ trợ dark mode và 3 ngôn ngữ (vi/en/zh), có trang quản trị (admin) để tự thêm/sửa/xoá tin.

**Yêu cầu Node.js >= 22** (do `@supabase/supabase-js` bản mới nhất yêu cầu). Xem [.nvmrc](.nvmrc)
— nếu dùng nvm, chạy `nvm use` trong thư mục dự án.

## 1. Cài đặt local

```bash
nvm use        # nếu dùng nvm, đảm bảo đúng Node >= 22
npm install
npm run dev
```

Mặc định (chưa cấu hình Supabase) app chạy với dữ liệu mẫu trong [data/listings.ts](data/listings.ts)
để bạn xem giao diện ngay mà không cần setup gì thêm — riêng trang `/admin` bắt buộc phải có
Supabase thật vì cần đăng nhập (xem mục 4).

## 2. Kết nối Supabase (bắt buộc để có dữ liệu thật)

1. Tạo project mới tại [supabase.com](https://supabase.com) (gói Free).
2. Vào **SQL Editor**, dán toàn bộ nội dung [supabase/schema.sql](supabase/schema.sql) và chạy —
   script này tạo bảng `listings`, `leads`, bật Row Level Security, tạo bucket Storage
   `listing-images` (public), và các policy cho phép admin (user đã đăng nhập) quản lý dữ liệu.
   File idempotent — cứ dán và chạy lại toàn bộ mỗi khi pull code có cập nhật schema, kể cả trên
   project đã chạy file này trước đó.
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

## 3. Trang quản trị (/admin)

Trang admin cho phép đăng nhập rồi tự thêm/sửa/xoá tin thuê và xem danh sách lead — không cần vào
thẳng Supabase Dashboard nữa (dù vẫn dùng được nếu muốn).

**Tạo tài khoản admin** (chỉ làm 1 lần, không có trang tự đăng ký):

1. Vào Supabase Dashboard → **Authentication → Users → Add user**.
2. Nhập email + mật khẩu, bỏ chọn "Auto confirm user" nếu muốn xác thực email, hoặc để "Auto
   confirm" nếu muốn dùng được ngay.
3. Vào `/admin/login` trên web, đăng nhập bằng email/mật khẩu vừa tạo.

Sau khi đăng nhập, `/admin` hiển thị danh sách tin (đổi trạng thái nhanh bằng dropdown, sửa/xoá
từng tin), `/admin/listings/new` để thêm tin mới, `/admin/leads` để xem và đánh dấu đã liên hệ các
yêu cầu gửi từ form trên trang chủ. Muốn thêm admin khác thì lặp lại bước 1-2 với email khác.

**Quan trọng:** RLS cho `listings`/`leads` cấp quyền ghi cho **bất kỳ** user `authenticated` nào,
không phân biệt role/admin riêng. Vì app không có trang tự đăng ký nên bình thường chỉ ai được bạn
tạo tài khoản thủ công mới đăng nhập được — nhưng nếu Supabase project của bạn đang bật đăng ký
công khai (mặc định), ai đó vẫn có thể tự tạo tài khoản thẳng qua Supabase Auth API (không qua UI
của web) rồi có toàn quyền admin. Vào **Authentication → Providers → Email** và tắt "Allow new
users to sign up" để chặn việc này.

## 4. Đa ngôn ngữ (vi / en / zh)

Site có 3 ngôn ngữ: Tiếng Việt (mặc định, không có prefix — vd `/`), English (`/en`), 中文 (`/zh`).
Chuyển ngôn ngữ bằng dropdown ở Header, hoặc site tự nhận diện qua header `Accept-Language` của
trình duyệt ở lần truy cập đầu.

Nội dung UI tĩnh (Header, Hero, form...) nằm trong `messages/vi.json`, `messages/en.json`,
`messages/zh.json`. Nội dung tin thuê (tiêu đề, tiện ích, mô tả) hiện chỉ có 1 ngôn ngữ — xem
comment cạnh `Listing` trong [lib/types.ts](lib/types.ts) nếu sau này cần dịch nội dung tin.

**Thêm ngôn ngữ mới**, ví dụ tiếng Nhật (`ja`):

1. Thêm `"ja"` vào mảng `locales` trong [i18n/routing.ts](i18n/routing.ts).
2. Tạo `messages/ja.json` với đầy đủ key giống `messages/vi.json` (copy file rồi dịch).
3. Thêm nhãn hiển thị (vd `"日本語"`) vào namespace `LocaleSwitcher` trong **cả 4** file message.

Trang `/admin` không đa ngôn ngữ (chỉ tiếng Việt), vì đây là công cụ nội bộ.

## 5. Dark mode

Dùng `next-themes`, mặc định theo `prefers-color-scheme` của hệ điều hành, có nút bật/tắt ở
Header (lưu lựa chọn vào localStorage). Bảng màu định nghĩa qua CSS variable trong
[app/globals.css](app/globals.css) (`:root` cho light, `.dark` cho dark) và ánh xạ trong
[tailwind.config.ts](tailwind.config.ts) — màu thương hiệu (`primary`, `accent`, `status`, `zalo`)
giữ nguyên cho cả 2 chế độ.

## 6. Deploy lên Vercel

1. Push code lên GitHub (repo đã có sẵn tại `origin`).
2. Import project vào [Vercel](https://vercel.com) từ repo GitHub này. Đảm bảo Vercel dùng Node.js
   22.x runtime (Project Settings > General > Node.js Version).
3. Trong **Project Settings > Environment Variables**, thêm:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ZALO_CONTACT` (số điện thoại/Zalo OA thật để nhận tin nhắn khách thuê)

   Không thêm `SUPABASE_SERVICE_ROLE_KEY` vào Vercel — key này chỉ cần chạy local để seed dữ liệu.
4. Deploy. Vercel cấp domain tạm dạng `*.vercel.app`; gắn domain riêng sau trong
   **Project Settings > Domains** khi đã mua domain.

## Cấu trúc chính

- `app/[locale]/` — route công khai đa ngôn ngữ: trang chủ (`page.tsx`), trang chi tiết tin
  (`tin/[code]`), layout gốc (`layout.tsx`, bọc `NextIntlClientProvider` + `ThemeProvider` +
  Header/Footer)
- `app/admin/` — trang quản trị, root layout riêng (không đa ngôn ngữ); `login/` (đăng nhập công
  khai); `(dashboard)/` (route group yêu cầu đăng nhập — danh sách tin, thêm/sửa tin, leads)
- `app/api/` — route handlers `listings`, `leads` (dùng chung cho cả trang công khai)
- `middleware.ts` — kết hợp routing đa ngôn ngữ (next-intl) và chặn `/admin/**` khi chưa đăng nhập
- `i18n/` — cấu hình next-intl (`routing.ts`, `navigation.ts`, `request.ts`)
- `messages/` — nội dung dịch UI tĩnh theo từng ngôn ngữ
- `components/` — Header, Hero, ListingCard, ListingSection, DistrictLinks, AiFinder,
  TrustSection, Footer, ZaloButton, LeadForm, LocaleSwitcher, ThemeToggle
- `components/admin/` — component riêng cho trang quản trị (form, bảng, nút xoá/toggle)
- `lib/` — `types.ts` (kiểu dữ liệu), `supabase.ts` (client anon, đọc công khai + gửi lead),
  `listings.ts`/`leads.ts` (truy vấn công khai, fallback dữ liệu mẫu khi chưa cấu hình Supabase)
- `lib/supabase/` — `server.ts`/`middleware.ts`: client Supabase gắn session admin (đăng nhập)
- `lib/admin/` — thao tác ghi dữ liệu (tạo/sửa/xoá tin, upload ảnh, quản lý leads) dùng client admin
- `data/listings.ts` — dữ liệu mẫu/seed, dùng làm fallback dev và nguồn cho `npm run seed`
- `supabase/schema.sql` — script khởi tạo bảng, RLS, bucket Storage, policy cho admin

## Việc chưa làm (giai đoạn sau)

Trợ lý AI tìm nhà thật (hiện là UI demo), dịch nội dung tin thuê theo ngôn ngữ, bản đồ hiển thị tin
thuê.
