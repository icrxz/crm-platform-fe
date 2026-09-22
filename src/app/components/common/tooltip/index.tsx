'use client';

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

interface TooltipProps {
  content: string;
  children: ReactNode;
  theme?: 'light' | 'dark';
  position?: 'top' | 'bottom' | 'right';
  textSize?: 'xs' | 'sm' | 'base';
  className?: string;
  // When true, wraps long content instead of forcing a single line, with a
  // max-width that shrinks on narrow viewports so it never overflows the
  // screen.
  wrap?: boolean;
}

const TEXT_SIZE_CLASSES: Record<
  NonNullable<TooltipProps['textSize']>,
  string
> = {
  xs: 'text-[11px]',
  sm: 'text-xs',
  base: 'text-sm',
};

const THEME_CLASSES: Record<NonNullable<TooltipProps['theme']>, string> = {
  dark: 'bg-gray-900 text-white',
  light: 'bg-white text-gray-900 border border-gray-200',
};

// Gap between the trigger and the tooltip, in px — matches the old mb-1/
// mt-1/ml-2 (4-8px) CSS-positioned version.
const GAP = 8;

interface Coords {
  top: number;
  left: number;
  transform: string;
}

function computeCoords(
  rect: DOMRect,
  position: NonNullable<TooltipProps['position']>
): Coords {
  switch (position) {
    case 'bottom':
      return {
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: 'translateY(-50%)',
      };
    case 'top':
    default:
      return {
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      };
  }
}

// Rendered via a portal into document.body rather than as an absolutely
// positioned sibling of the trigger: a tooltip needs to escape any
// ancestor's overflow (e.g. the sidebar's scrollable nav list when
// collapsed), and position:absolute inside an overflow:auto ancestor gets
// clipped there instead of floating over the page — that clipping, plus
// the leaked horizontal scrollbar it caused, is the bug this replaced.
export function Tooltip({
  content,
  children,
  theme = 'dark',
  position = 'top',
  textSize = 'xs',
  className,
  wrap = false,
}: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  // Server has no `document`, so the portal must stay unrendered through the
  // client's first (hydration) pass too — this only flips to true once
  // React re-checks the snapshot after mount, keeping that first render
  // identical to the SSR output. Checking `typeof document` directly in the
  // render body instead diverges immediately on the client and causes a
  // hydration mismatch.
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    const measure = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords(computeCoords(rect, position));
      }
    };

    measure();
  }, [position]);

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords(computeCoords(rect, position));
    }
    setIsVisible(true);
  }

  return (
    <div
      ref={triggerRef}
      className={className}
      onMouseEnter={show}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isMounted &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords?.top ?? 0,
              left: coords?.left ?? 0,
              transform: coords?.transform,
            }}
            className={`pointer-events-none z-50 rounded px-2 py-1 font-normal shadow-lg transition-opacity ${wrap ? 'max-w-[85vw] whitespace-normal sm:max-w-[240px] md:max-w-xs' : 'whitespace-nowrap'} ${isVisible ? 'opacity-100' : 'opacity-0'} ${TEXT_SIZE_CLASSES[textSize]} ${THEME_CLASSES[theme]}`}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
