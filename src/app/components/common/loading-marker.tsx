'use client';

import { useEffect } from 'react';

// Rendered inside a route's loading.tsx. Its mount/unmount lifecycle exactly
// brackets the time the fallback is actually visible: it mounts the instant
// Suspense shows the skeleton, and unmounts the instant real content
// replaces it — so it's the correct signal for when a navigation is truly
// done, unlike pathname/searchParams (which change as soon as the
// navigation starts, not when it finishes).
export function LoadingMarker() {
  useEffect(() => {
    document.documentElement.classList.add('is-navigating');
    return () => {
      document.documentElement.classList.remove('is-navigating');
    };
  }, []);

  return null;
}
