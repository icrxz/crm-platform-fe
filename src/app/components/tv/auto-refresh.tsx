'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const REFRESH_MS = Number(process.env.NEXT_PUBLIC_TV_REFRESH_MS ?? 120_000);

export default function AutoRefresh() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(REFRESH_MS);

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          router.refresh();
          return REFRESH_MS;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [router]);

  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="flex items-center gap-1 text-xs tabular-nums text-gray-400">
      <svg
        className="h-3 w-3 animate-spin"
        style={{ animationDuration: `${REFRESH_MS}ms` }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {pad(minutes)}:{pad(seconds)}
    </span>
  );
}
