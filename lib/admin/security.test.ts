import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLoginRateLimit, detectNewDevice, lookupAccountByEmail, parseUserAgent } from "./security";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

/** Fake query builder Supabase — mọi method chain trả về chính nó, thenable ở cuối. */
function fakeQueryBuilder(result: { data?: unknown; error?: unknown; count?: number }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function mockAdminFrom(result: { data?: unknown; error?: unknown; count?: number }) {
  const builder = fakeQueryBuilder(result);
  vi.mocked(createAdminClient).mockReturnValue({
    from: vi.fn(() => builder),
  } as unknown as ReturnType<typeof createAdminClient>);
  return builder;
}

function mockListUsers(users: { email: string; app_metadata?: { role?: string } }[]) {
  vi.mocked(createAdminClient).mockReturnValue({
    auth: {
      admin: {
        listUsers: vi.fn(() => Promise.resolve({ data: { users }, error: null })),
      },
    },
  } as unknown as ReturnType<typeof createAdminClient>);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("parseUserAgent", () => {
  it("parse đúng Chrome trên Windows", () => {
    expect(
      parseUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
      )
    ).toBe("Chrome · Windows");
  });

  it("parse đúng Safari trên iOS", () => {
    expect(
      parseUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1"
      )
    ).toBe("Safari · iOS");
  });

  it("null -> Không xác định", () => {
    expect(parseUserAgent(null)).toBe("Không xác định");
  });
});

describe("checkLoginRateLimit", () => {
  it("dưới ngưỡng 5 lần sai -> không chặn", async () => {
    mockAdminFrom({ count: 4, error: null });
    const result = await checkLoginRateLimit("a@b.com");
    expect(result.blocked).toBe(false);
  });

  it("chạm đúng ngưỡng 5 lần sai -> chặn", async () => {
    mockAdminFrom({ count: 5, error: null });
    const result = await checkLoginRateLimit("a@b.com");
    expect(result.blocked).toBe(true);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("DB lỗi -> fail-open, không chặn nhầm người dùng hợp lệ", async () => {
    mockAdminFrom({ count: undefined, error: new Error("db down") });
    const result = await checkLoginRateLimit("a@b.com");
    expect(result.blocked).toBe(false);
  });
});

describe("lookupAccountByEmail", () => {
  it("email không tồn tại -> exists=false, role=null", async () => {
    mockListUsers([{ email: "a@b.com", app_metadata: { role: "admin" } }]);
    expect(await lookupAccountByEmail("khong-ton-tai@b.com")).toEqual({
      exists: false,
      role: null,
    });
  });

  it("email tồn tại, role admin -> exists=true, role=admin", async () => {
    mockListUsers([{ email: "admin@b.com", app_metadata: { role: "admin" } }]);
    expect(await lookupAccountByEmail("admin@b.com")).toEqual({ exists: true, role: "admin" });
  });

  it("email tồn tại, role member -> exists=true, role=member", async () => {
    mockListUsers([{ email: "staff@b.com", app_metadata: { role: "member" } }]);
    expect(await lookupAccountByEmail("staff@b.com")).toEqual({ exists: true, role: "member" });
  });

  it("so khớp email không phân biệt hoa thường", async () => {
    mockListUsers([{ email: "Admin@B.com", app_metadata: { role: "admin" } }]);
    expect(await lookupAccountByEmail("admin@b.com")).toEqual({ exists: true, role: "admin" });
  });

  it("tài khoản không có app_metadata.role -> mặc định coi là admin", async () => {
    mockListUsers([{ email: "legacy@b.com" }]);
    expect(await lookupAccountByEmail("legacy@b.com")).toEqual({ exists: true, role: "admin" });
  });
});

describe("detectNewDevice", () => {
  it("chưa từng đăng nhập thành công lần nào -> không tính là thiết bị mới", async () => {
    mockAdminFrom({ data: [], error: null });
    expect(await detectNewDevice("user-1", "1.2.3.4", "ua-a")).toBe(false);
  });

  it("(ip, user-agent) khớp lần đăng nhập trước -> không phải thiết bị mới", async () => {
    mockAdminFrom({ data: [{ ip_address: "1.2.3.4", user_agent: "ua-a" }], error: null });
    expect(await detectNewDevice("user-1", "1.2.3.4", "ua-a")).toBe(false);
  });

  it("(ip, user-agent) khác mọi lần trước -> là thiết bị mới", async () => {
    mockAdminFrom({ data: [{ ip_address: "1.2.3.4", user_agent: "ua-a" }], error: null });
    expect(await detectNewDevice("user-1", "9.9.9.9", "ua-b")).toBe(true);
  });
});
