import Link from "next/link";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Đường dẫn trang hiện tại, dùng để dựng link ?page=N. */
  basePath: string;
  /** Query param khác cần giữ nguyên khi đổi trang (vd. filter đang chọn). */
  extraParams?: Record<string, string>;
}

function buildHref(basePath: string, page: number, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams(extraParams);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({ page, pageSize, total, basePath, extraParams }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const buttonClass =
    "rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition";

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        Trang {page}/{totalPages} · {total} kết quả
      </span>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(basePath, page - 1, extraParams)}
            className={`${buttonClass} text-foreground hover:bg-muted`}
          >
            Trước
          </Link>
        ) : (
          <span className={`${buttonClass} cursor-not-allowed text-muted-foreground opacity-50`}>Trước</span>
        )}
        {hasNext ? (
          <Link
            href={buildHref(basePath, page + 1, extraParams)}
            className={`${buttonClass} text-foreground hover:bg-muted`}
          >
            Sau
          </Link>
        ) : (
          <span className={`${buttonClass} cursor-not-allowed text-muted-foreground opacity-50`}>Sau</span>
        )}
      </div>
    </div>
  );
}
