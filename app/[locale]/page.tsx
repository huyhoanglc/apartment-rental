import { setRequestLocale } from "next-intl/server";
import AiFinder from "@/components/listing/AiFinder";
import DistrictLinks from "@/components/listing/DistrictLinks";
import Hero from "@/components/home/Hero";
import ListingSection from "@/components/listing/ListingSection";
import TrustSection from "@/components/home/TrustSection";
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
