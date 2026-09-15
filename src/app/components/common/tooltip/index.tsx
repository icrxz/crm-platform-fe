import { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  theme?: 'light' | 'dark';
  position?: 'top' | 'bottom' | 'right';
  className?: string;
}

const THEME_CLASSES: Record<NonNullable<TooltipProps['theme']>, string> = {
  dark: 'bg-gray-900 text-white',
  light: 'bg-white text-gray-900 border border-gray-200',
};

const POSITION_CLASSES: Record<
  NonNullable<TooltipProps['position']>,
  string
> = {
  top: 'bottom-full left-1/2 mb-1 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export function Tooltip({
  content,
  children,
  theme = 'dark',
  position = 'top',
  className,
}: TooltipProps) {
  return (
    <div className={`group relative ${className ?? ''}`}>
      {children}
      <div
        className={`pointer-events-none absolute z-50 hidden whitespace-nowrap rounded px-2 py-1 text-[11px] font-normal opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 ${POSITION_CLASSES[position]} ${THEME_CLASSES[theme]}`}
      >
        {content}
      </div>
    </div>
  );
}
