"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleSwitcher from "@/components/LocaleSwitcher";

const ZALO_CONTACT = process.env.NEXT_PUBLIC_ZALO_CONTACT || "0901234567";

export default function Header() {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);

  const NAV_LINKS = [
    { hash: "listings", label: t("navListings") },
    { hash: "districts", label: t("navDistricts") },
    { hash: "ai-finder", label: t("navAiFinder") },
    { hash: "trust", label: t("navTrust") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700 dark:text-primary-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            TT
          </span>
          Tổ Thuê TP.HCM
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.hash}
              href={{ pathname: "/", hash: link.hash }}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary-700 dark:hover:text-primary-300"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground transition hover:text-primary-700 dark:hover:text-primary-300"
          >
            {t("navBlog")}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <a
            href={`https://zalo.me/${ZALO_CONTACT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zalo px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t("zaloCta")}
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
            aria-label={t("openMenu")}
          >
            <span className="text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.hash}
                href={{ pathname: "/", hash: link.hash }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("navBlog")}
            </Link>
            <div className="mt-1">
              <LocaleSwitcher />
            </div>
            <a
              href={`https://zalo.me/${ZALO_CONTACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-zalo px-4 py-2 text-sm font-semibold text-white"
            >
              {t("zaloCta")}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
