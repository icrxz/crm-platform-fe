import { shimmer } from '../common/skeleton-block';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex items-center gap-4 overflow-hidden rounded-xl bg-gray-50 p-4 shadow-sm`}
    >
      <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
      <div className="min-w-0 flex-1">
        <div className="h-7 w-12 rounded-md bg-gray-200" />
        <div className="mt-2 h-4 w-32 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
}
