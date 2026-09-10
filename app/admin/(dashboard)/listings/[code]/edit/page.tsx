import { notFound } from "next/navigation";
import ListingForm from "@/components/admin/ListingForm";
import { getListingByCode } from "@/lib/listings";
import { saveListing } from "../../actions";

export default async function EditListingPage({ params }: { params: { code: string } }) {
  const listing = await getListingByCode(params.code);
  if (!listing) notFound();

  const action = saveListing.bind(null, listing.code);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Sửa tin — {listing.code}</h1>
      <div className="mt-4">
        <ListingForm action={action} initialListing={listing} />
      </div>
    </div>
  );
}
