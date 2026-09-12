"use client";

import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/ThemeToggle";

function currentPageLabel(pathname: string): string {
  const match = NAV_ITEMS.filter((item) => isActive(pathname, item.href)).sort(
    (a, b) => b.href.length - a.href.length
  )[0];
  return match?.label ?? "Quản trị";
}

/**
 * Dải header mỏng phía trên nội dung chính, chỉ ở desktop (mobile đã có thanh
 * brand riêng trong AdminNav). Sidebar không còn thanh ngang phía trên như
 * trước nên thêm lại 1 dải nhỏ để layout không bị "trống hẫng" ngay khi vào
 * trang, đồng thời cho biết đang ở mục nào.
 */
export default function AdminTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur md:flex md:px-8">
      <p className="text-sm font-semibold text-foreground">{currentPageLabel(pathname)}</p>
      <ThemeToggle />
    </header>
  );
}
