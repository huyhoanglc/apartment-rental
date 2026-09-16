import ContactedToggle from "@/components/admin/ContactedToggle";
import Pagination from "@/components/admin/Pagination";
import { getLeads } from "@/lib/admin/leads";
import { formatVNDateTime } from "@/lib/formatDate";

const PAGE_SIZE = 20;

export default async function AdminLeadsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { leads, total } = await getLeads(page, PAGE_SIZE);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Yêu cầu khách hàng ({total})</h1>

      <div className="mt-4 overflow-hidden rounded-xl2 bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">SĐT/Zalo</th>
                <th className="px-4 py-3">Khu vực</th>
                <th className="px-4 py-3">Ngân sách</th>
                <th className="px-4 py-3">Ghi chú</th>
                <th className="px-4 py-3">Đã liên hệ</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatVNDateTime(lead.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{lead.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.district ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.budget_million != null ? `${lead.budget_million} triệu` : "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {lead.note ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ContactedToggle id={lead.id} contacted={lead.contacted} />
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có lead nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/leads" />
      </div>
    </div>
  );
}
