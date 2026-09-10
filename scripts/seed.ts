// Nạp dữ liệu mẫu (data/projects.ts, data/listings.ts, data/blogPosts.ts) vào Supabase.
// Chạy: npm run seed   (yêu cầu SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local)
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { demoProjects } from "../data/projects";
import { demoListings } from "../data/listings";
import { demoBlogPosts } from "../data/blogPosts";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local — xem .env.example"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  // 1. Seed projects trước (listings phụ thuộc project_id).
  const projectRows = demoProjects.map(({ id, created_at, updated_at, ...rest }) => rest);

  const { error: projectsError } = await supabase
    .from("projects")
    .upsert(projectRows, { onConflict: "slug" });

  if (projectsError) {
    console.error("Seed projects thất bại:", projectsError.message);
    process.exit(1);
  }

  console.log(`Đã seed ${projectRows.length} dự án vào Supabase.`);

  // 2. Lấy lại id thật (do Supabase tự sinh) theo slug, để map project_id
  // trong data/listings.ts (đang trỏ tới id giả "demo-project-x") sang id thật.
  const { data: insertedProjects, error: fetchProjectsError } = await supabase
    .from("projects")
    .select("id, slug");

  if (fetchProjectsError) {
    console.error("Không đọc lại được projects vừa seed:", fetchProjectsError.message);
    process.exit(1);
  }

  const slugByDemoId = new Map(demoProjects.map((p) => [p.id, p.slug]));
  const realIdBySlug = new Map((insertedProjects ?? []).map((p) => [p.slug, p.id]));

  const listingRows = demoListings.map(({ id, created_at, updated_at, project_id, ...rest }) => {
    const slug = slugByDemoId.get(project_id);
    const realProjectId = slug ? realIdBySlug.get(slug) : undefined;
    if (!realProjectId) {
      throw new Error(`Không tìm được project thật cho listing "${rest.code}" (project_id demo: ${project_id})`);
    }
    return { ...rest, project_id: realProjectId };
  });

  const { error: listingsError } = await supabase
    .from("listings")
    .upsert(listingRows, { onConflict: "code" });

  if (listingsError) {
    console.error("Seed listings thất bại:", listingsError.message);
    process.exit(1);
  }

  console.log(`Đã seed ${listingRows.length} phòng vào Supabase.`);

  // 3. Blog — độc lập, không phụ thuộc project.
  const blogRows = demoBlogPosts.map(({ id, created_at, updated_at, ...rest }) => rest);

  const { error: blogError } = await supabase
    .from("blog_posts")
    .upsert(blogRows, { onConflict: "slug" });

  if (blogError) {
    console.error("Seed blog thất bại:", blogError.message);
    process.exit(1);
  }

  console.log(`Đã seed ${blogRows.length} bài blog vào Supabase.`);
}

main();
