'use client';

import { TrophyIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type Period = 'hoje' | 'semana' | 'mes';

const periods: { key: Period; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
];

export default function PeriodFilter() {
  const [active, setActive] = useState<Period>('semana');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-gray-200">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              active === key
                ? 'bg-sky-100 text-blue-600'
                : 'text-gray-500 hover:bg-sky-50 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
        <TrophyIcon className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-700">
          Meta: SLA 95%
        </span>
      </div>
    </div>
  );
}
