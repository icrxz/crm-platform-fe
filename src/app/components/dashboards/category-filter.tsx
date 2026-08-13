'use client';

import { CaseCategory, caseCategoryMap } from '@/app/types/case';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

export default function CategoryFilter({
  compact = false,
}: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const active = searchParams.get('category') ?? ALL_KEY;

  const handleSelect = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    key === ALL_KEY ? params.delete('category') : params.set('category', key);

    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleSelect(key)}
          className={`font-medium transition-colors ${compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-1.5 text-sm'} ${
            active === key
              ? 'bg-sky-100 text-blue-600'
              : 'text-gray-500 hover:bg-sky-50 hover:text-blue-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
