import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closable?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
  closable = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      tabIndex={-1}
      className="fixed inset-0 z-50 flex w-full items-center justify-center bg-black bg-opacity-50"
    >
      <div className="relative max-h-dvh w-fit max-w-[95vw] overflow-y-auto overflow-x-hidden rounded-lg bg-white p-6 shadow-lg sm:max-w-screen-lg">
        {closable && (
          <button
            className="absolute right-2 top-2 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
