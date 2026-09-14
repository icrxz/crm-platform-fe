const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function KpiCardsSkeleton() {
  return (
    <>
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gray-200" />
            <div className="h-4 w-32 rounded-md bg-gray-200" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 h-8 w-20 rounded-md bg-gray-200" />
              <div className="h-3 w-28 rounded-md bg-gray-200" />
            </div>
            <div className="flex items-end gap-1.5">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="w-6 rounded-t bg-gray-200"
                  style={{ height: `${16 + j * 8}px` }}
                />
              ))}
            </div>
          </div>
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
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-40 rounded-md bg-gray-200" />
        <div className="h-4 w-16 rounded-md bg-gray-200" />
      </div>
      <div className="mb-3 h-9 w-full rounded-lg bg-gray-200" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-4 grid grid-cols-[16px_1fr] gap-x-3">
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="grid grid-cols-[auto_1fr] gap-x-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="hidden sm:block">
                <div className="mb-1 h-3 w-16 rounded bg-gray-200" />
                <div className="h-2 w-10 rounded bg-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2">
              <div className="h-6 rounded bg-gray-200" />
              <div className="h-6 rounded bg-gray-200" />
            </div>
          </div>
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
      <div className="mb-1 h-5 w-56 rounded-md bg-gray-200" />
      <div className="mb-4 h-3 w-48 rounded-md bg-gray-200" />
      <div className="h-48 w-full rounded-md bg-gray-200" />
      <div className="mt-3 flex gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <div className="h-3 w-20 rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttendanceBonusSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-36 rounded-md bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mb-3 h-3 w-24 rounded-md bg-gray-200" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="h-2 w-10 rounded bg-gray-200" />
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
