import { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  theme?: 'light' | 'dark';
  position?: 'top' | 'bottom';
  className?: string;
}

const THEME_CLASSES: Record<NonNullable<TooltipProps['theme']>, string> = {
  dark: 'bg-gray-900 text-white',
  light: 'bg-white text-gray-900 border border-gray-200',
};

export function Tooltip({
  content,
  children,
  theme = 'dark',
  position = 'top',
  className,
}: TooltipProps) {
  const positionClasses =
    position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <div className={`group relative ${className ?? ''}`}>
      {children}
      <div
        className={`pointer-events-none absolute left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[11px] font-normal opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 ${positionClasses} ${THEME_CLASSES[theme]}`}
      >
        {content}
      </div>
    </div>
  );
}
