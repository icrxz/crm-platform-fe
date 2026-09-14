import { roboto } from '../../ui/fonts';
import { shimmer, SkeletonBlock } from './skeleton-block';

interface PageSkeletonProps {
  title?: string;
}

// Generic fallback for pages without a bespoke skeleton (forms, detail
// pages, dashboards): just enough shape to avoid a blank flash while the
// real content loads.
export function PageSkeleton({ title }: PageSkeletonProps) {
  return (
    <div className="w-full">
      {title && (
        <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
          {title}
        </h1>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonBlock className="h-24 rounded-xl" />
        <SkeletonBlock className="h-24 rounded-xl" />
        <SkeletonBlock className="h-24 rounded-xl" />
      </div>

      <div className={`${shimmer} mt-6 h-64 w-full rounded-xl bg-gray-100`} />
    </div>
  );
}
