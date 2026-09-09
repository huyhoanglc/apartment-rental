/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

module.exports = nextConfig;
