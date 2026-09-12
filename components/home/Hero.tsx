import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-primary-900 text-white">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://picsum.photos/seed/hero-hcmc/1600/700"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="container-page relative py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base text-primary-100">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#listings"
            className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
          >
            {t("ctaListings")}
          </a>
          <a
            href="#ai-finder"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {t("ctaAiFinder")}
          </a>
        </div>
      </div>
    </section>
  );
}
