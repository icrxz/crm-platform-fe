'use client';

interface IconButtonProps {
  icon: React.ReactNode;
  color: 'success' | 'info' | 'error' | 'white';
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'md';
}

const iconButtonColors = {
  success: 'text-green-500 hover:text-green-700',
  info: 'text-blue-600 hover:text-blue-900',
  error: 'text-red-600 hover:text-red-900',
  white: 'text-white hover:text-gray-200',
};

// md (default): p-2 grows the tap target toward the ~40-44px touch-target
// guideline (icons are h-5/h-6, 20-24px). Real padding, not a
// negative-margin trick, on purpose: this button renders inside all kinds
// of containers (table cells, cards, modals) and a negative margin has
// previously leaked into a parent's overflow-x calculation (see
// ListPageLayout).
//
// sm: for desktop <Table> action columns specifically — a mouse-driven,
// row-dense context where md's full touch target inflates every row's
// height to fit the button (a table with an Ações column visibly grew
// taller than one without, even though neither has more text content).
const sizeClasses = {
  sm: 'p-1',
  md: 'p-2',
};

export function IconButton({
  icon,
  color,
  onClick,
  disabled,
  title,
  size = 'md',
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`${sizeClasses[size]} ${iconButtonColors[color]}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}
