type BetCardSkeletonProps = {
  count?: number;
};

export function BetCardSkeleton({ count = 5 }: BetCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`bet-card-skeleton-${index}`}
          className="relative overflow-hidden rounded-xl border border-[#223044] bg-[#1a2332] p-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-[#26364f]" />
            <div className="h-3 w-44 rounded bg-[#26364f]" />
            <div className="h-3 w-32 rounded bg-[#26364f]" />
          </div>
          <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      ))}
    </div>
  );
}
