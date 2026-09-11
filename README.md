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

   `SUPABASE_SERVICE_ROLE_KEY` dùng cho script seed **và** cho tính năng tạo/xoá tài khoản đăng
   nhập ở `/admin/accounts` (`lib/supabase/admin.ts`) — key này bỏ qua mọi RLS nên **tuyệt đối
   không commit lên git**, không lộ ra client (chỉ dùng trong Server Action đã tự kiểm tra người
   gọi đang đăng nhập).

5. Nạp dữ liệu mẫu vào Supabase (tuỳ chọn, để có sẵn vài dự án/phòng/bài blog demo):

   ```bash
   npm run seed
   ```

6. Chạy lại `npm run dev` — app sẽ tự chuyển sang đọc dữ liệu thật từ Supabase.

## 3. Trang quản trị (/admin)

Trang admin cho phép đăng nhập rồi tự quản lý dự án, phòng, blog, nhân viên và xem danh sách lead —
không cần vào thẳng Supabase Dashboard nữa (dù vẫn dùng được nếu muốn). Chi tiết cấu trúc Dự
án/Phòng/Nhân viên xem mục 9.

**Tạo tài khoản admin đầu tiên** (bắt buộc qua Supabase Dashboard vì lúc này chưa có ai đăng nhập
được để dùng tính năng trong app):

1. Vào Supabase Dashboard → **Authentication → Users → Add user**.
2. Nhập email + mật khẩu, bỏ chọn "Auto confirm user" nếu muốn xác thực email, hoặc để "Auto
   confirm" nếu muốn dùng được ngay.
3. Vào `/admin/login` trên web, đăng nhập bằng email/mật khẩu vừa tạo.

**Tạo thêm tài khoản khác** — từ tài khoản đầu tiên trở đi có thể tạo ngay trong app, không cần
vào Supabase Dashboard nữa: đăng nhập → **Tài khoản** (`/admin/accounts`) → điền họ và tên + email
+ mật khẩu + chọn **vai trò** → Tạo tài khoản. Gửi email/mật khẩu đó cho người dùng để họ tự đăng
nhập. Họ và tên lưu ở `user_metadata.full_name` (khác `app_metadata.role` — user tự sửa được field
này qua Supabase Auth API nếu muốn, không ảnh hưởng phân quyền), hiện ở sidebar thay cho email.
Tài khoản đầu tiên tạo qua Supabase Dashboard không có field này — sidebar sẽ tự dùng email làm
tên hiển thị cho tới khi bạn cập nhật `user_metadata.full_name` thủ công (Dashboard → user đó →
Edit → User Metadata).

Sau khi đăng nhập, `/admin` hiển thị danh sách phòng (đổi trạng thái nhanh bằng dropdown, sửa/xoá
từng phòng qua popup ngay trên trang — không điều hướng sang trang khác), `/admin/leads` để xem và
đánh dấu đã liên hệ các yêu cầu gửi từ form trên trang chủ. Dự án/Blog/Nhân viên cũng thêm/sửa qua
popup tương tự trên trang danh sách của từng mục.

### Vai trò (Admin / Cá nhân)

Mỗi tài khoản có 1 trong 2 vai trò, lưu ở `app_metadata.role` của Supabase Auth user (chỉ set được
qua Admin API — user không tự nâng quyền được):

- **Admin**: thấy và dùng được tất cả, kể cả Nhân viên và Tài khoản (quản lý người khác).
- **Cá nhân**: thấy Phòng, Dự án, Blog, Leads, và **Tài khoản của tôi** (`/admin/security` — tự sửa
  họ tên hiển thị, xem lịch sử đăng nhập, tự liên kết thêm Google; menu "Hồ sơ"/"Cài đặt" ở dropdown
  avatar đều dẫn tới đây). Không thấy Nhân viên/Tài khoản trên nav — vào
  thẳng URL 2 trang đó cũng bị chặn (404), không chỉ ẩn link. `/admin/security` không chặn theo
  role vì chỉ hiện dữ liệu của chính tài khoản đang đăng nhập, không phải quản trị người khác.

Tài khoản tạo **trước khi có tính năng này** (kể cả tài khoản đầu tiên tạo qua Supabase Dashboard)
không có `role` trong `app_metadata` — app coi thiếu role = **Admin** để không tự khoá bạn ra khỏi
hệ thống. Muốn đổi vai trò 1 tài khoản, admin vào `/admin/accounts` đổi trực tiếp trên bảng (không
tự đổi được vai trò của chính tài khoản đang đăng nhập).

**Lưu ý phạm vi:** vai trò chỉ giới hạn **thấy được trang nào**, chưa lọc theo dữ liệu — trong 4
trang dùng chung (Phòng/Dự án/Blog/Leads), Admin và Cá nhân thấy và sửa/xoá được **toàn bộ** dữ
liệu như nhau (RLS vẫn `to authenticated using (true)` cho các bảng này, không phân biệt ai tạo).
Cố ý không giới hạn "ai tạo người đó sửa" vì bất động sản có nhiều dự án, một người có thể cần sửa
phòng do đồng nghiệp tạo. Thay vào đó, Phòng/Dự án/Blog tự ghi lại người tạo (`created_by`,
`created_by_email`, set tự động bằng trigger DB, không tin client) và mọi lượt tạo/sửa/xoá được
ghi vào bảng `activity_log` — xem ở trang **`/admin/Lịch sử`** (`/admin/activity`, thấy được bởi cả
2 vai trò) để biết ai đã thao tác gì và khi nào.

**Quan trọng:** RLS cho `listings`/`leads`/... cấp quyền ghi cho **bất kỳ** user `authenticated`
nào ở tầng database (vai trò Admin/Cá nhân chỉ chặn ở tầng ứng dụng, không đổi RLS). Vì app không
có trang tự đăng ký nên bình thường chỉ ai được bạn tạo tài khoản mới đăng nhập được — nhưng nếu
Supabase project của bạn đang bật đăng ký công khai (mặc định), ai đó vẫn có thể tự tạo tài khoản
thẳng qua Supabase Auth API (không qua UI của web) — tài khoản tự tạo kiểu này **không có role**,
nên theo đúng quy tắc "thiếu role = Admin" ở trên, họ sẽ có **toàn quyền Admin**, không phải Cá
nhân. Vào **Authentication → Providers → Email** và tắt "Allow new users to sign up" để chặn việc
này — càng quan trọng hơn từ khi có vai trò, vì hậu quả của việc bỏ sót còn nặng hơn trước.

### Đăng nhập bằng Google (tuỳ chọn)

Trang login hỗ trợ thêm nút "Đăng nhập với Google" cạnh form email/password.

1. Tạo OAuth Client ở [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Create Credentials → OAuth client ID** → Application type: **Web application**.
2. Vào Supabase Dashboard → **Authentication → Providers → Google**, bật lên, copy **Callback URL
   (for OAuth)** Supabase hiển thị sẵn ở đó (dạng `https://<project>.supabase.co/auth/v1/callback`)
   → dán vào **Authorized redirect URIs** ở Google Cloud Console.
3. Copy `Client ID` + `Client secret` từ Google dán ngược lại vào Supabase Provider Google, Save.
   Không cần thêm biến env nào ở phía app cho bước này — Supabase tự xử lý phần trao đổi token với
   Google.
4. **Bắt buộc** thêm `ADMIN_ALLOWED_EMAILS` vào `.env.local` — danh sách email Gmail được phép vào
   `/admin`, cách nhau bằng dấu phẩy (vd `ADMIN_ALLOWED_EMAILS=you@gmail.com,other@gmail.com`).
   Supabase OAuth mặc định **tự tạo tài khoản mới** cho bất kỳ ai đăng nhập Google thành công —
   khác với luồng email/password (chỉ tạo tài khoản được qua Dashboard) — nên nếu bỏ trống biến
   này, `app/auth/callback/route.ts` sẽ **chặn tất cả** đăng nhập Google (fail closed) thay vì mặc
   định cho qua.
5. Đăng nhập thử ở `/admin/login`. Nếu Google báo lỗi redirect URI mismatch, kiểm tra lại URL ở
   bước 2 khớp chính xác (kể cả https, không có dấu `/` thừa cuối).

**Tự liên kết Google cho tài khoản email/password có sẵn:** một tài khoản tạo bằng email/password
(qua Dashboard hoặc `/admin/accounts`) có thể tự thêm Google làm cách đăng nhập khác cho **chính
tài khoản đó** (không tạo tài khoản mới) — vào `/admin/security`, bấm "Liên kết Google". Không cần
admin duyệt riêng (`supabase.auth.linkIdentity`), và không cần nằm trong `ADMIN_ALLOWED_EMAILS`
(không cấp thêm quyền gì, chỉ thêm cách đăng nhập cho tài khoản vốn đã hợp lệ). Cần bật **"Manual
linking"** trong Supabase Dashboard → Authentication → (mục Settings/Advanced tuỳ phiên bản
dashboard, tìm từ khoá "manual linking") — nếu không tìm thấy, xem
[docs Supabase](https://supabase.com/docs/guides/auth/auth-identity-linking).

Đăng nhập Zalo chưa làm (cần tự build OAuth flow riêng vì Supabase không hỗ trợ sẵn Zalo — sẽ làm
sau khi có Zalo Developer App).

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
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (giống giá trị 2 dòng trên)
   - `SUPABASE_SERVICE_ROLE_KEY` — **bắt buộc** trên Vercel từ khi có `/admin/accounts` (tạo/xoá
     tài khoản đăng nhập cần Admin API, không seed dữ liệu mới cần nữa). Đánh dấu là *Sensitive*
     trong Vercel nếu có tuỳ chọn đó. Key này bỏ qua mọi RLS — không dán vào đâu khác, không log ra
     console ở bất kỳ đâu trong code.
   - `NEXT_PUBLIC_ZALO_CONTACT` (số điện thoại/Zalo OA thật để nhận tin nhắn khách thuê)
   - `NEXT_PUBLIC_SITE_URL` (domain Vercel thật, cho sitemap)
   - `ADMIN_ALLOWED_EMAILS` nếu dùng đăng nhập Google (xem mục 3)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` nếu dùng thông báo Telegram (xem mục 7)
4. Deploy. Vercel cấp domain tạm dạng `*.vercel.app`; gắn domain riêng sau trong
   **Project Settings > Domains** khi đã mua domain.

## 7. Bảo mật đăng nhập & thông báo Telegram

`/admin/security` hiển thị 20 lần đăng nhập gần nhất của tài khoản đang dùng (bảng
`admin_login_events`, IP lấy từ header `x-forwarded-for`, Vercel tự set khi deploy), và nút "Đăng
xuất khỏi tất cả thiết bị khác" (`supabase.auth.signOut({ scope: 'others' })`).

**Thông báo Telegram khi có admin đăng nhập / lead mới** (tuỳ chọn, bỏ trống 2 biến env thì tự
tắt, không lỗi):

1. Mở Telegram, nhắn cho [@BotFather](https://t.me/BotFather) → gõ `/newbot` → làm theo hướng dẫn
   để tạo bot, lấy `TELEGRAM_BOT_TOKEN`.
2. Nhắn thử 1 tin bất kỳ cho bot vừa tạo (hoặc thêm bot vào 1 group).
3. Mở trình duyệt vào `https://api.telegram.org/bot<TOKEN>/getUpdates`, tìm field
   `"chat":{"id": ...}` — đó là `TELEGRAM_CHAT_ID`.
4. Thêm 2 biến này vào `.env.local` (và Vercel Environment Variables khi deploy thật).

`TELEGRAM_BOT_TOKEN` chỉ dùng trong `lib/telegram.ts`, gọi từ Server Action/Route Handler — không
bao giờ lộ ra client.

## 8. Blog (chuẩn SEO cơ bản)

`/blog` (danh sách, phân trang) và `/blog/[slug]` (chi tiết, render Markdown qua `react-markdown`,
có JSON-LD `Article`). Quản lý bài viết ở `/admin/blog` — tạo/sửa dùng chung `BlogPostForm`, có
đếm ký tự cảnh báo khi `meta_title` > 60 hoặc `meta_description` > 160 ký tự (chuẩn SEO cơ bản),
toggle xuất bản/nháp ngay trên bảng danh sách.

**Viết bài đầu tiên:**

1. Đăng nhập `/admin`, vào **Blog → Viết bài mới**.
2. Nhập tiêu đề (slug tự tạo theo tiêu đề, có thể sửa tay), nội dung viết bằng Markdown (`##` cho
   heading, `**...**` in đậm...), chọn ảnh cover, tick **Xuất bản ngay** rồi Lưu.
3. Kiểm tra tại `/blog` và `/blog/<slug>`.

Ảnh cover lưu ở bucket Storage riêng `blog-images` (public, cùng kiểu policy với
`listing-images`). `app/sitemap.ts`/`app/robots.ts` tự liệt kê mọi bài đã xuất bản + mọi tin thuê —
không cần cập nhật tay. Nhớ set `NEXT_PUBLIC_SITE_URL` đúng domain thật khi deploy (mặc định
`http://localhost:3000`) để sitemap ra đúng URL tuyệt đối.

**Bảng mới trong `supabase/schema.sql`** (đã gồm trong file, chạy lại toàn bộ file là đủ):
`admin_login_events` (lịch sử đăng nhập, RLS chỉ cho user xem/ghi dòng của chính mình),
`blog_posts` (bài viết, RLS: đọc công khai bài `published = true`, ghi cho user đã đăng nhập).

## 9. Dự án → Phòng, Nhân viên

Mỗi phòng cho thuê giờ thuộc về 1 **Dự án** (tòa nhà/chung cư) — địa chỉ, quận/phường, tiện ích
chung nằm ở dự án; phòng chỉ giữ thông tin riêng (giá, diện tích, loại hình, ảnh, tiện ích riêng).
**Phải tạo Dự án trước khi thêm Phòng** — bấm "Thêm phòng mới" ở `/admin` khi chưa có dự án nào sẽ
báo lỗi nhắc tạo dự án trước, thay vì mở popup thêm phòng. Quản lý ở `/admin/projects` (CRUD dự án,
dùng chung `ProjectForm`) — xoá 1 dự án sẽ báo lỗi nếu dự án đó vẫn còn phòng (xoá hết phòng trước).

`/admin/staff` là **danh bạ nhân viên nội bộ** đơn giản (tên, SĐT, email, chức vụ, đang làm/nghỉ)
— không liên quan tài khoản đăng nhập `/admin` (tài khoản đăng nhập vẫn tạo thủ công qua Supabase
Dashboard như mục 3).

Trang chi tiết phòng (`/tin/[code]`) hiện thêm mục "Phòng khác cùng dự án" nếu dự án có nhiều
phòng. Chưa có trang công khai duyệt riêng theo Dự án (`/du-an`) — có thể làm sau, bảng `projects`
đã có sẵn `slug` để dùng ngay không cần đổi schema.

**Bảng mới:** `projects` (RLS: đọc công khai, ghi cho user đã đăng nhập), `staff` (RLS: không có
đọc công khai, chỉ user đã đăng nhập). Bucket Storage mới `project-images`.

## Cấu trúc chính

- `app/[locale]/` — route công khai đa ngôn ngữ: trang chủ (`page.tsx`), trang chi tiết phòng
  (`tin/[code]`), blog (`blog/`, `blog/[slug]`), layout gốc (`layout.tsx`, bọc
  `NextIntlClientProvider` + `ThemeProvider` + Header/Footer)
- `app/admin/` — trang quản trị, root layout riêng (không đa ngôn ngữ); `login/` (đăng nhập công
  khai); `(dashboard)/` (route group yêu cầu đăng nhập — phòng, dự án, leads, blog, nhân viên,
  bảo mật)
- `app/api/` — route handlers `listings`, `leads` (dùng chung cho cả trang công khai)
- `app/auth/callback/route.ts` — callback OAuth (Google...), ngoài `/admin` và ngoài matcher của
  `middleware.ts` để không bị chặn/redirect ngôn ngữ giữa chừng
- `app/sitemap.ts`, `app/robots.ts` — SEO, tự liệt kê phòng + bài blog đã xuất bản
- `middleware.ts` — kết hợp routing đa ngôn ngữ (next-intl) và chặn `/admin/**` khi chưa đăng nhập
- `i18n/` — cấu hình next-intl (`routing.ts`, `navigation.ts`, `request.ts`)
- `messages/` — nội dung dịch UI tĩnh theo từng ngôn ngữ
- `components/` — Header, Hero, ListingCard, ListingSection, DistrictLinks, AiFinder,
  TrustSection, Footer, ZaloButton, LeadForm, LocaleSwitcher, ThemeToggle
- `components/admin/` — component riêng cho trang quản trị (form, bảng, nút xoá/toggle)
- `lib/` — `types.ts` (kiểu dữ liệu), `supabase.ts` (client anon, đọc công khai + gửi lead),
  `listings.ts`/`projects.ts`/`leads.ts`/`blog.ts` (truy vấn công khai, fallback dữ liệu mẫu khi
  chưa cấu hình Supabase), `telegram.ts`, `slugify.ts`
- `lib/supabase/` — `server.ts`/`middleware.ts`/`client.ts`: client Supabase gắn session admin
  (đăng nhập) + client browser cho Realtime Presence; `admin.ts`: client service role key (bỏ qua
  RLS) — chỉ dùng trong `lib/admin/accounts.ts`, không dùng ở đâu khác
- `lib/admin/` — thao tác ghi dữ liệu (phòng, dự án, blog, nhân viên, leads, upload ảnh, lịch sử
  đăng nhập, tài khoản đăng nhập) dùng client admin
- `data/listings.ts`, `data/projects.ts`, `data/blogPosts.ts` — dữ liệu mẫu/seed, dùng làm fallback
  dev và nguồn cho `npm run seed`
- `supabase/schema.sql` — script khởi tạo bảng, RLS, bucket Storage, policy cho admin

## Việc chưa làm (giai đoạn sau)

Trợ lý AI tìm nhà thật (hiện là UI demo), dịch nội dung tin thuê/bài blog theo ngôn ngữ, bản đồ
hiển thị tin thuê.
