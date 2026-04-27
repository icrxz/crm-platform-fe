const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function KpiCardsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gray-200" />
            <div className="h-4 w-32 rounded-md bg-gray-200" />
          </div>
          <div className="mb-2 h-8 w-20 rounded-md bg-gray-200" />
          <div className="h-3 w-24 rounded-md bg-gray-200" />
        </div>
      ))}
    </>
  );
}

export function RankingSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
    >
      <div className="mb-4 h-5 w-40 rounded-md bg-gray-200" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-4 flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="h-4 w-20 rounded-md bg-gray-200" />
          <div className="h-6 flex-1 rounded-md bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
    >
      <div className="mb-4 h-5 w-48 rounded-md bg-gray-200" />
      <div className="h-48 w-full rounded-md bg-gray-200" />
      <div className="mt-3 flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <div className="h-3 w-20 rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
    >
      <div className="mb-4 h-5 w-36 rounded-md bg-gray-200" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="mb-1 h-4 w-32 rounded-md bg-gray-200" />
            <div className="h-3 w-20 rounded-md bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
