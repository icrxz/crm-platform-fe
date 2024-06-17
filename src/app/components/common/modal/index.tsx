import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

return (
  <div tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center w-full bg-black bg-opacity-50">
      <div className="relative w-fit max-w-screen-lg p-6 bg-white rounded-lg shadow-lg max-h-dvh overflow-y-auto overflow-x-hidden">
              <button
                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            <div>{children}</div>
        </div>
    </div>
);
}
