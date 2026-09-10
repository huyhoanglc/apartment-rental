import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const ZALO_CONTACT = process.env.NEXT_PUBLIC_ZALO_CONTACT || "0901234567";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tHeader = await getTranslations("Header");

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-primary-700 dark:text-primary-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              TT
            </span>
            Tổ Thuê TP.HCM
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
          <Link
            href="/blog"
            className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
          >
            {tHeader("navBlog")}
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("contactTitle")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{t("hotline", { contact: ZALO_CONTACT })}</li>
            <li>{t("email")}</li>
            <li>{t("address")}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("districtsTitle")}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li>Quận 1</li>
            <li>Quận 7</li>
            <li>Bình Thạnh</li>
            <li>Phú Nhuận</li>
            <li>Gò Vấp</li>
            <li>Thủ Đức</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
