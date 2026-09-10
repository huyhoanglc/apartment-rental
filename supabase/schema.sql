-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor (1 lần khi khởi tạo project)

create extension if not exists pgcrypto;

-- ==========================================================================
-- Bảng listings
-- ==========================================================================
create type listing_status as enum ('con_phong', 'hot', 'het_phong');

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  district text not null,
  ward text,
  price_million numeric not null,
  type text not null check (
    type in ('phong_tro', 'studio', 'can_ho_mini', 'can_ho_dich_vu', 'nha_nguyen_can')
  ),
  area numeric not null,
  amenities text[] not null default '{}',
  status listing_status not null default 'con_phong',
  image_url text not null,
  image_urls text[] not null default '{}',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table listings enable row level security;

create policy "listings are publicly readable"
  on listings for select
  using (true);

-- Không tạo policy insert/update/delete cho anon/authenticated:
-- chỉ service role (dashboard hoặc script seed) mới ghi được, vì service role
-- luôn bỏ qua RLS. Khi có trang admin với người dùng đăng nhập, thêm policy
-- insert/update/delete có điều kiện auth.uid() tương ứng tại đây.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_set_updated_at
  before update on listings
  for each row
  execute function set_updated_at();

-- ==========================================================================
-- Bảng leads (nhu cầu gửi từ form)
-- ==========================================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  zalo text,
  district text,
  budget_million numeric,
  note text,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "anyone can submit a lead"
  on leads for insert
  with check (true);

-- Không có policy select cho anon: chỉ đọc được qua Supabase Dashboard hoặc
-- service role, để thông tin liên hệ khách hàng không bị lộ công khai.

-- ==========================================================================
-- Storage: bucket ảnh tin thuê
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "public read access to listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Upload/xoá ảnh chỉ thực hiện qua service role (script seed hoặc trang admin
-- sau này), nên không cần policy insert/update/delete cho anon ở đây.

-- ==========================================================================
-- Bổ sung cho Admin Dashboard (Supabase Auth) — chạy thêm đoạn dưới đây nếu
-- project của bạn đã chạy phần schema ở trên từ trước. An toàn để chạy lại
-- nhiều lần (idempotent).
-- ==========================================================================

-- Cột đánh dấu đã liên hệ lead hay chưa
alter table leads add column if not exists contacted boolean not null default false;

-- Cho phép user đã đăng nhập (admin) toàn quyền quản lý listings.
-- Vẫn giữ nguyên policy select public ở trên cho khách truy cập trang chủ.
create policy "authenticated can insert listings"
  on listings for insert
  to authenticated
  with check (true);

create policy "authenticated can update listings"
  on listings for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete listings"
  on listings for delete
  to authenticated
  using (true);

-- Cho phép admin xem và cập nhật (đánh dấu đã liên hệ) leads.
create policy "authenticated can select leads"
  on leads for select
  to authenticated
  using (true);

create policy "authenticated can update leads"
  on leads for update
  to authenticated
  using (true)
  with check (true);

-- Cho phép admin upload ảnh tin thuê (bucket vẫn public cho việc đọc).
create policy "authenticated can upload listing images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

create policy "authenticated can update listing images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images')
  with check (bucket_id = 'listing-images');

-- Tạo tài khoản admin: vào Supabase Dashboard → Authentication → Users →
-- Add user (nhập email/password thủ công). Không có trang tự đăng ký.
