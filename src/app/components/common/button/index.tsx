import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const buttonSizes = {
  'sm': 'h-6',
  'md': 'h-8',
  'lg': 'h-10',
}

export function Button({ children, className, size = 'lg', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        `flex ${buttonSizes[size]} items-center text-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`,
        className,
      )}
    >
      {children}
    </button>
  );
}
