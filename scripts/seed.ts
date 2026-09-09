// Nạp dữ liệu mẫu (data/listings.ts) vào bảng "listings" trên Supabase.
// Chạy: npm run seed   (yêu cầu SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local)
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { demoListings } from "../data/listings";

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
  const rows = demoListings.map(({ id, created_at, updated_at, ...rest }) => rest);

  const { error } = await supabase.from("listings").upsert(rows, { onConflict: "code" });

  if (error) {
    console.error("Seed thất bại:", error.message);
    process.exit(1);
  }

  console.log(`Đã seed ${rows.length} tin thuê vào Supabase.`);
}

main();
