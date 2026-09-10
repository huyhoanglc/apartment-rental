import ListingForm from "@/components/admin/ListingForm";
import { saveListing } from "../actions";

export default function NewListingPage() {
  const action = saveListing.bind(null, null);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Thêm tin mới</h1>
      <div className="mt-4">
        <ListingForm action={action} />
      </div>
    </div>
  );
}
