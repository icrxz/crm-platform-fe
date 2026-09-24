import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  color?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  scheme?: 'loud' | 'quiet';
}

const buttonSizes = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
};

const buttonColors = {
  loud: {
    success:
      'bg-green-500 hover:bg-green-400 text-white focus-visible:outline-green-500 active:bg-green-600',
    error:
      'bg-red-500 hover:bg-red-400 text-white focus-visible:outline-red-500 active:bg-red-600',
    warning:
      'bg-orange-500 hover:bg-orange-400 text-white focus-visible:outline-orange-500 active:bg-orange-600',
    info: 'bg-blue-500 hover:bg-blue-400 text-white focus-visible:outline-blue-500 active:bg-blue-600',
    neutral:
      'bg-gray-500 hover:bg-gray-400 text-white focus-visible:outline-gray-500 active:bg-gray-600',
  },
  quiet: {
    success:
      'bg-transparent border border-green-500 hover:bg-green-50 text-green-700 focus-visible:outline-green-500 active:bg-green-100',
    error:
      'bg-transparent border border-red-500 hover:bg-red-50 text-red-700 focus-visible:outline-red-500 active:bg-red-100',
    warning:
      'bg-transparent border border-orange-500 hover:bg-orange-50 text-orange-700 focus-visible:outline-orange-500 active:bg-orange-100',
    info: 'bg-transparent border border-blue-500 hover:bg-blue-50 text-blue-700 focus-visible:outline-blue-500 active:bg-blue-100',
    neutral:
      'bg-transparent border border-gray-500 hover:bg-gray-50 text-gray-700 focus-visible:outline-gray-500 active:bg-gray-100',
  },
};

export function Button({
  children,
  className,
  size = 'lg',
  color = 'info',
  scheme = 'loud',
  isLoading,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className={clsx(
        `flex ${buttonSizes[size]} ${buttonColors[scheme][color]} min-w-20 items-center justify-center rounded-lg px-4 text-center text-sm font-medium transition-colors focus:ring-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`,
        className
      )}
    >
      {isLoading && (
        <svg
          className="mr-3 h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.343A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.595zM12 20a8.003 8.003 0 01-6.343-2.93l-3.93 1.595A11.95 11.95 0 0012 24v-4zm6.343-2.93A8.003 8.003 0 0120 12h4c0 3.042-1.135 5.824-3 7.938l-3.657-1.868zM20 12a8.003 8.003 0 01-2.93 6.343l3.657 1.868A11.95 11.95 0 0024 12h-4z"
          ></path>
        </svg>
      )}

      {!isLoading && children}
    </button>
  );
}
