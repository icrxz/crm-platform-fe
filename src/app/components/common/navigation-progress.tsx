'use client';

import { useEffect, useRef } from 'react';

const NAVIGATING_CLASS = 'is-navigating';
// Fallback for routes with no loading.tsx (LoadingMarker), so the cursor
// never gets stuck if a destination never mounts one.
const SAFETY_TIMEOUT_MS = 4000;

function isInternalNavigationClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const anchor = (event.target as HTMLElement | null)?.closest('a');
  if (!anchor) return false;
  if (anchor.hasAttribute('download')) return false;
  if (anchor.target && anchor.target !== '_self') return false;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

// Gives immediate feedback (a busy cursor) the instant an internal link is
// clicked, for the brief gap before the destination route's loading.tsx
// mounts. LoadingMarker takes over from there and clears the cursor
// precisely when the real content replaces the skeleton; this component
// only clears it itself as a fallback, for routes with no loading.tsx.
export function NavigationProgress() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!isInternalNavigationClick(event)) return;

      document.documentElement.classList.add(NAVIGATING_CLASS);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove(NAVIGATING_CLASS);
      }, SAFETY_TIMEOUT_MS);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
