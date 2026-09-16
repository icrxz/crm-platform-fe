'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';

interface AccordionProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({
  summary,
  children,
  defaultOpen = false,
  className,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        {summary}
        <ChevronDownIcon
          className={clsx(
            'h-5 w-5 shrink-0 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}
