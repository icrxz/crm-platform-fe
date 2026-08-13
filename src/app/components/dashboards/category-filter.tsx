'use client';

import { CaseCategory, caseCategoryMap } from '@/app/types/case';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

const ALL_KEY = 'all';

const options: { key: string; label: string }[] = [
  { key: ALL_KEY, label: 'Todos' },
  ...Object.values(CaseCategory).map((category) => ({
    key: category,
    label: caseCategoryMap[category],
  })),
];

interface CategoryFilterProps {
  compact?: boolean;
}

function Spinner({ compact }: { compact: boolean }) {
  return (
    <svg
      data-testid="category-filter-spinner"
      className={compact ? 'h-2.5 w-2.5 animate-spin' : 'h-3 w-3 animate-spin'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function CategoryFilter({
  compact = false,
}: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const active = searchParams.get('category') ?? ALL_KEY;

  const handleSelect = (key: string) => {
    if (key === active) return;

    const params = new URLSearchParams(searchParams.toString());
    key === ALL_KEY ? params.delete('category') : params.set('category', key);

    setPendingKey(key);
    startTransition(() => {
      router.push(pathname + '?' + params.toString());
    });
  };

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200">
      {options.map(({ key, label }) => {
        const isLoadingThisOption = isPending && pendingKey === key;
        const isActive = isPending ? pendingKey === key : active === key;

        return (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={isPending}
            aria-busy={isLoadingThisOption}
            className={`flex items-center gap-1.5 font-medium transition-colors disabled:cursor-not-allowed ${compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-1.5 text-sm'} ${
              isActive
                ? 'bg-sky-100 text-blue-600'
                : 'text-gray-500 hover:bg-sky-50 hover:text-blue-600 disabled:hover:bg-transparent'
            }`}
          >
            {isLoadingThisOption && <Spinner compact={compact} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
