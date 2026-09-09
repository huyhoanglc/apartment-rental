import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tổ Thuê TP.HCM — Tìm phòng trọ, studio, căn hộ cho thuê",
  description:
    "Tìm phòng trọ, studio, căn hộ cho thuê tại TP.HCM. Lọc theo quận, ngân sách, loại hình. Ảnh thật, cập nhật trạng thái còn phòng/hết phòng.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
