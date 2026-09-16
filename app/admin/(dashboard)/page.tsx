import ListingsManager from "@/components/admin/ListingsManager";
import { getListingsPage } from "@/lib/listings";
import { getProjects } from "@/lib/projects";

const PAGE_SIZE = 20;

export default async function AdminListingsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  // projects: đủ toàn bộ, không phân trang — ListingForm cần liệt kê hết dự án
  // để chọn khi thêm/sửa phòng.
  const [{ listings, total }, projects] = await Promise.all([getListingsPage(page, PAGE_SIZE), getProjects()]);

  return <ListingsManager listings={listings} total={total} page={page} pageSize={PAGE_SIZE} projects={projects} />;
}
