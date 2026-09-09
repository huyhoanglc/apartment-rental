"use client";

import Link from "next/link";
import { useState } from "react";

const ZALO_CONTACT = process.env.NEXT_PUBLIC_ZALO_CONTACT || "0901234567";

const NAV_LINKS = [
  { href: "/#listings", label: "Tin thuê" },
  { href: "/#districts", label: "Khu vực" },
  { href: "/#ai-finder", label: "Trợ lý tìm nhà" },
  { href: "/#trust", label: "Vì sao chọn chúng tôi" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            TT
          </span>
          Tổ Thuê TP.HCM
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-primary-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={`https://zalo.me/${ZALO_CONTACT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zalo px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Nhắn Zalo tư vấn
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 md:hidden"
          aria-label="Mở menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://zalo.me/${ZALO_CONTACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-zalo px-4 py-2 text-sm font-semibold text-white"
            >
              Nhắn Zalo tư vấn
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
