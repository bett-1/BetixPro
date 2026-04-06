type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3 border-t border-[#243247] pt-3">
      <p className="text-xs text-[#8ea0b6]">
        Showing {start}–{end} of {total} bets
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="min-h-11 min-w-11 rounded-full border border-[#2b3a4f] bg-[#111827] text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          &lt;
        </button>
        <p className="text-sm text-[#c5d4e8]">
          Page {page} of {Math.max(totalPages, 1)}
        </p>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="min-h-11 min-w-11 rounded-full border border-[#2b3a4f] bg-[#111827] text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
