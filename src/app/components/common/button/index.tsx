import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  color?: 'success' | 'error' | 'warning' | 'info';
}

const buttonSizes = {
  'sm': 'h-6',
  'md': 'h-8',
  'lg': 'h-10',
}

const buttonColors = {
  success: 'bg-green-500 hover:bg-green-400 focus-visible:outline-green-500 active:bg-green-600',
  error: 'bg-red-500 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600',
  warning: 'bg-yellow-500 hover:bg-yellow-400 focus-visible:outline-yellow-500 active:bg-yellow-600',
  info: 'bg-blue-500 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600',
}

export function Button({ children, className, size = 'lg', color = 'info', isLoading, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading}
      className={clsx(
        `flex ${buttonSizes[size]} ${buttonColors[color]} items-center text-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`,
        className,
      )}
    >
      {children}
    </button>
  );
}
