"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
    </svg>
  );
}

/**
 * Cụm nút nổi góc dưới phải — thay cho ThemeToggle từng cố định trên thanh
 * header. Hơi lệch nghiêng (rotate) + đứng thẳng lại khi hover cho cảm giác
 * "tự do", không xếp thành khối vuông vức cứng nhắc.
 */
export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:-translate-y-0.5 hover:rotate-0 hover:shadow-xl"
        >
          <ArrowUpIcon />
        </button>
      )}
      <div className="rotate-2 transition hover:rotate-0">
        <ThemeToggle />
      </div>
    </div>
  );
}
