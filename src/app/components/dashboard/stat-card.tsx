import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ title, value, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 shadow-sm transition-colors hover:bg-gray-100"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm leading-tight text-gray-500">{title}</p>
      </div>
    </Link>
  );
}
