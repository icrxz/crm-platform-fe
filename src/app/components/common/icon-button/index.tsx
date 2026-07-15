'use client';

interface IconButtonProps {
  icon: React.ReactNode;
  color: 'success' | 'info' | 'error';
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const iconButtonColors = {
  success: 'text-green-500 hover:text-green-700',
  info: 'text-blue-600 hover:text-blue-900',
  error: 'text-red-600 hover:text-red-900',
};

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
      className={iconButtonColors[color]}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}
