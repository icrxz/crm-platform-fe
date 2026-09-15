'use client';

interface IconButtonProps {
  icon: React.ReactNode;
  color: 'success' | 'info' | 'error' | 'white';
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const iconButtonColors = {
  success: 'text-green-500 hover:text-green-700',
  info: 'text-blue-600 hover:text-blue-900',
  error: 'text-red-600 hover:text-red-900',
  white: 'text-white hover:text-gray-200',
};

// p-2 grows the tap target toward the ~40-44px touch-target guideline
// (icons are h-5/h-6, 20-24px). Real padding, not a negative-margin
// trick, on purpose: this button renders inside all kinds of containers
// (table cells, cards, modals) and a negative margin has previously
// leaked into a parent's overflow-x calculation (see ListPageLayout).
export function IconButton({
  icon,
  color,
  onClick,
  disabled,
  title,
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`p-2 ${iconButtonColors[color]}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}
