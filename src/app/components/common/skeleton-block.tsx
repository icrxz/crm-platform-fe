export const shimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`${shimmer} rounded-md bg-gray-200 ${className}`} />;
}
