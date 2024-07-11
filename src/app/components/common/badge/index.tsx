interface BadgeProps {
  content: string;
  isClosable?: boolean;
  onClose?: () => void;
}

export function Badge({ content, isClosable, onClose }: BadgeProps) {
  return (
    <div className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full">
      <span className="text-xs font-medium">{content}</span>
      {isClosable && (
        <button
          onClick={onClose}
          className="ml-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-sm"
        >
          &times;
        </button>
      )}
    </div>
  );
}
