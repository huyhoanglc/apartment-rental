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

-- ==========================================================================
-- Lịch sử đăng nhập admin (trang /admin/security)
-- ==========================================================================
create table if not exists admin_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table admin_login_events enable row level security;

drop policy if exists "authenticated can select own login events" on admin_login_events;
create policy "authenticated can select own login events"
  on admin_login_events for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "authenticated can insert own login events" on admin_login_events;
create policy "authenticated can insert own login events"
  on admin_login_events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ==========================================================================
-- Blog (SEO)
-- ==========================================================================
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null, -- markdown
  cover_image_url text,
  meta_title text,
  meta_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_posts enable row level security;

drop policy if exists "published posts are publicly readable" on blog_posts;
create policy "published posts are publicly readable"
  on blog_posts for select
  using (published = true);

drop policy if exists "authenticated can manage all posts" on blog_posts;
create policy "authenticated can manage all posts"
  on blog_posts for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists blog_posts_set_updated_at on blog_posts;
create trigger blog_posts_set_updated_at
  before update on blog_posts
  for each row
  execute function set_updated_at();

-- Bucket ảnh cover cho blog, cùng cấu trúc policy như listing-images.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "public read access to blog images" on storage.objects;
create policy "public read access to blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "authenticated can upload blog images" on storage.objects;
create policy "authenticated can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

drop policy if exists "authenticated can update blog images" on storage.objects;
create policy "authenticated can update blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

-- ==========================================================================
-- Dự án (tòa nhà/chung cư) — Phòng (listings) giờ thuộc về 1 dự án.
-- ==========================================================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  district text not null,
  ward text,
  address text,
  description text,
  cover_image_url text,
  image_urls text[] not null default '{}',
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "projects are publicly readable" on projects;
create policy "projects are publicly readable"
  on projects for select
  using (true);

drop policy if exists "authenticated can manage projects" on projects;
create policy "authenticated can manage projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row
  execute function set_updated_at();

-- Bucket ảnh dự án, cùng policy pattern với listing-images/blog-images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "public read access to project images" on storage.objects;
create policy "public read access to project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "authenticated can upload project images" on storage.objects;
create policy "authenticated can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "authenticated can update project images" on storage.objects;
create policy "authenticated can update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

-- Chuyển listings sang thuộc về 1 dự án: xoá district/ward khỏi listings (dời
-- lên projects), thêm project_id bắt buộc. An toàn chạy trên DB đang trống
-- listings; nếu bạn đã có dữ liệu thật, tạo dự án + backfill project_id cho
-- các dòng hiện có TRƯỚC khi chạy đoạn này (not null sẽ lỗi nếu còn dòng null).
alter table listings add column if not exists project_id uuid references projects(id) on delete restrict;
alter table listings drop column if exists district;
alter table listings drop column if exists ward;
alter table listings alter column project_id set not null;

-- ==========================================================================
-- Nhân viên (danh bạ nội bộ — không liên quan tài khoản đăng nhập admin)
-- ==========================================================================
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  role text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table staff enable row level security;

drop policy if exists "authenticated can manage staff" on staff;
create policy "authenticated can manage staff"
  on staff for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists staff_set_updated_at on staff;
create trigger staff_set_updated_at
  before update on staff
  for each row
  execute function set_updated_at();
