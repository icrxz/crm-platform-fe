import clsx from 'clsx';

export type PillColor = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type PillScheme = 'loud' | 'quiet';
export type PillSize = 'sm' | 'md' | 'lg';
export type PillTextSize = 'xs' | 'sm' | 'md';

interface PillProps {
  text: string;
  color?: PillColor;
  scheme?: PillScheme;
  size?: PillSize;
  textSize?: PillTextSize;
  className?: string;
}

const pillSizes: Record<PillSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
  lg: 'px-4 py-1.5',
};

const pillTextSizes: Record<PillTextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
};

const pillColors: Record<PillScheme, Record<PillColor, string>> = {
  loud: {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
    neutral: 'bg-gray-500 text-white',
  },
  quiet: {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-orange-100 text-orange-700',
    info: 'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-200 text-gray-700',
  },
};

export function Pill({
  text,
  color = 'neutral',
  scheme = 'quiet',
  size = 'md',
  textSize = 'xs',
  className,
}: PillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium',
        pillSizes[size],
        pillTextSizes[textSize],
        pillColors[scheme][color],
        className
      )}
    >
      {text}
    </span>
  );
}
