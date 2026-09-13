import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "./rateLimit";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

function mockAdminFrom(selectResult: { count?: number; error?: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    then: (resolve: (value: typeof selectResult) => void) =>
      Promise.resolve(selectResult).then(resolve),
  };
  vi.mocked(createAdminClient).mockReturnValue({
    from: vi.fn(() => builder),
  } as unknown as ReturnType<typeof createAdminClient>);
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("dưới ngưỡng -> cho phép và ghi thêm 1 dòng", async () => {
    const builder = mockAdminFrom({ count: 2, error: null });
    const allowed = await checkRateLimit("leads_submit", "1.2.3.4", 5, 10);
    expect(allowed).toBe(true);
    expect(builder.insert).toHaveBeenCalledOnce();
  });

  it("chạm ngưỡng -> chặn, không ghi thêm dòng nào", async () => {
    const builder = mockAdminFrom({ count: 5, error: null });
    const allowed = await checkRateLimit("leads_submit", "1.2.3.4", 5, 10);
    expect(allowed).toBe(false);
    expect(builder.insert).not.toHaveBeenCalled();
  });

  it("DB lỗi -> fail-open (cho phép)", async () => {
    mockAdminFrom({ count: undefined, error: new Error("db down") });
    const allowed = await checkRateLimit("leads_submit", "1.2.3.4", 5, 10);
    expect(allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("lấy IP đầu tiên trong x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("không có header -> 'unknown'", () => {
    const request = new Request("https://example.com");
    expect(getClientIp(request)).toBe("unknown");
  });
});
