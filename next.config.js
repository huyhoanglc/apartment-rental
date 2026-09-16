const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

// 'unsafe-inline' cho script/style vẫn cần thiết: App Router tự chèn inline
// <script> để hydrate RSC payload (không có cách nào tránh nếu không dựng
// nonce xuyên suốt middleware + mọi layout — rủi ro gãy hydration nếu làm
// sai mà không có browser thật để kiểm chứng). Vẫn chặn được: script/style/
// ảnh/kết nối từ domain lạ, nhúng iframe (frame-ancestors), form submit ra
// ngoài site (form-action), <base> bị chèn (base-uri), plugin/object (Flash...).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.supabase.co https://picsum.photos https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Client Router Cache: quay lại 1 trang admin (dynamic route, không có
    // cache mặc định) trong vòng 30s sau khi rời đi thì dùng lại bản đã
    // render thay vì gọi lại Supabase — chuyển tab qua lại không bị giật/chờ
    // load lại. Sau 30s hoặc sau khi có action ghi dữ liệu, lần vào tiếp theo
    // vẫn tự fetch mới nên không lo hiện dữ liệu cũ lâu.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async headers() {
    // Chỉ áp ở production: CSP/HSTS chặt sẽ phá WebSocket Fast Refresh (HMR)
    // của `next dev`, và HSTS vô nghĩa (thậm chí gây phiền) trên localhost http.
    if (process.env.NODE_ENV !== "production") return [];

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
  images: {
    // Giới hạn đúng domain ảnh thật (Supabase Storage) + domain ảnh demo (picsum.photos).
    // Dùng hostname "**" (chấp nhận mọi domain) sẽ mở SSRF qua Image Optimization API,
    // nên tránh dùng ở production trừ khi thật sự cần.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Avatar Google trả về khi đăng nhập OAuth (user_metadata.avatar_url).
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
