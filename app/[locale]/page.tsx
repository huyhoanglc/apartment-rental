import { setRequestLocale } from "next-intl/server";
import AiFinder from "@/components/AiFinder";
import DistrictLinks from "@/components/DistrictLinks";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import TrustSection from "@/components/TrustSection";
import { getListings } from "@/lib/listings";

export default async function Home({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { district?: string };
}) {
  setRequestLocale(locale);

  const district = searchParams.district;
  const initialListings = await getListings(district ? { district } : {});

  return (
    <>
      <Hero />
      <ListingSection initialListings={initialListings} initialDistrict={district ?? ""} />
      <DistrictLinks />
      <AiFinder />
      <TrustSection />
    </>
  );
}
