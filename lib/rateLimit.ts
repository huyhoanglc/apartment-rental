import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limit theo (endpoint, key) dùng bảng public_api_rate_limits (service
 * role, xem supabase/schema.sql) — đúng trên serverless nhiều instance, khác
 * in-memory counter sẽ không share được giữa các instance khi deploy Vercel.
 * Fail-open khi DB lỗi: hạ tầng lỗi không được chặn luôn cả người dùng hợp lệ.
 */
export async function checkRateLimit(
  endpoint: string,
  key: string,
  maxRequests: number,
  windowMinutes: number
): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count, error } = await admin
    .from("public_api_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("endpoint", endpoint)
    .eq("rate_key", key)
    .gte("created_at", since);

  if (error) {
    console.error("[checkRateLimit]", endpoint, error);
    return true;
  }

  if ((count ?? 0) >= maxRequests) return false;

  const { error: insertError } = await admin
    .from("public_api_rate_limits")
    .insert({ endpoint, rate_key: key });
  if (insertError) console.error("[checkRateLimit insert]", endpoint, insertError);

  return true;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
