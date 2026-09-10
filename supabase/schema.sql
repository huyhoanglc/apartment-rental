-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor.
-- Toàn bộ file idempotent — an toàn để chạy lại nhiều lần (vd sau khi pull code
-- mới có thêm policy), kể cả trên project đã chạy file này từ trước.

create extension if not exists pgcrypto;

-- ==========================================================================
-- Bảng listings
-- ==========================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type listing_status as enum ('con_phong', 'hot', 'het_phong');
  end if;
end $$;

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

drop policy if exists "listings are publicly readable" on listings;
create policy "listings are publicly readable"
  on listings for select
  using (true);

-- Ghi (insert/update/delete) chỉ dành cho user đã đăng nhập (trang admin) hoặc
-- service role (dashboard/script seed, luôn bỏ qua RLS) — xem policy bên dưới.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists listings_set_updated_at on listings;
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
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Cho project đã tạo bảng leads từ trước khi có cột contacted.
alter table leads add column if not exists contacted boolean not null default false;

alter table leads enable row level security;

drop policy if exists "anyone can submit a lead" on leads;
create policy "anyone can submit a lead"
  on leads for insert
  with check (true);

-- Không có policy select cho anon: chỉ đọc được qua trang admin (user đã đăng
-- nhập), Supabase Dashboard, hoặc service role — để thông tin liên hệ khách
-- hàng không bị lộ công khai.

-- ==========================================================================
-- Storage: bucket ảnh tin thuê
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "public read access to listing images" on storage.objects;
create policy "public read access to listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- ==========================================================================
-- Admin Dashboard (Supabase Auth) — cho phép user đã đăng nhập quản lý dữ
-- liệu. Không phân biệt role/admin riêng: BẤT KỲ user authenticated nào cũng
-- có toàn quyền dưới đây. App không có trang tự đăng ký (chỉ tạo tài khoản
-- thủ công qua Authentication > Users > Add user), nhưng nếu Supabase project
-- của bạn đang bật public sign-up thì cũng cần tắt nó đi (Authentication >
-- Providers > Email > Allow new users to sign up), nếu không ai tự đăng ký
-- qua thẳng Auth API cũng sẽ có quyền này.
-- ==========================================================================

drop policy if exists "authenticated can insert listings" on listings;
create policy "authenticated can insert listings"
  on listings for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update listings" on listings;
create policy "authenticated can update listings"
  on listings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete listings" on listings;
create policy "authenticated can delete listings"
  on listings for delete
  to authenticated
  using (true);

drop policy if exists "authenticated can select leads" on leads;
create policy "authenticated can select leads"
  on leads for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update leads" on leads;
create policy "authenticated can update leads"
  on leads for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can upload listing images" on storage.objects;
create policy "authenticated can upload listing images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

drop policy if exists "authenticated can update listing images" on storage.objects;
create policy "authenticated can update listing images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images')
  with check (bucket_id = 'listing-images');

-- Tạo tài khoản admin: vào Supabase Dashboard → Authentication → Users →
-- Add user (nhập email/password thủ công).
