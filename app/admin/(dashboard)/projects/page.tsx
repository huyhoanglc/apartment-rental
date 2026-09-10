import Image from "next/image";
import Link from "next/link";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import { getProjects } from "@/lib/projects";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dự án</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{projects.length} dự án đang quản lý</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm dự án
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="font-medium text-foreground">Chưa có dự án nào</p>
            <p className="text-sm text-muted-foreground">
              Bấm &quot;Thêm dự án&quot; để tạo tòa nhà/chung cư đầu tiên.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3">Tên dự án</th>
                <th className="px-4 py-3">Quận</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.slug}
                  className="border-b border-border transition last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    {project.cover_image_url ? (
                      <div className="relative h-12 w-16 overflow-hidden rounded-md ring-1 ring-border">
                        <Image src={project.cover_image_url} alt={project.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{project.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project.district}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {project.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                      >
                        Sửa
                      </Link>
                      <DeleteProjectButton slug={project.slug} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
