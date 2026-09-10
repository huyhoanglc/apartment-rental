// Nạp dữ liệu mẫu (data/listings.ts, data/blogPosts.ts) vào Supabase.
// Chạy: npm run seed   (yêu cầu SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local)
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
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
  const listingRows = demoListings.map(({ id, created_at, updated_at, ...rest }) => rest);

  const { error: listingsError } = await supabase
    .from("listings")
    .upsert(listingRows, { onConflict: "code" });

  if (listingsError) {
    console.error("Seed listings thất bại:", listingsError.message);
    process.exit(1);
  }

  console.log(`Đã seed ${listingRows.length} tin thuê vào Supabase.`);

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
