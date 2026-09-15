import { notFound } from 'next/navigation';

// Several fixtured components (e.g. CasesTable) call useSearchParams(),
// which requires either a Suspense boundary or opting out of static
// prerendering — these routes have no reason to be statically optimized.
export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: React.ReactNode;
}

// Test-only fixture routes for visual regression (see e2e/visual.spec.ts).
// Render outside auth/session so Playwright doesn't need a logged-in user.
// Gated on an explicit flag rather than NODE_ENV, because Playwright itself
// runs against a production build (npm run build && npm run start) for
// clean, dev-overlay-free screenshots — QA_FIXTURES_ENABLED is set only for
// that build, never in a real deploy.
export default function Layout({ children }: LayoutProps) {
  if (process.env.QA_FIXTURES_ENABLED !== 'true') {
    notFound();
  }

  return children;
}
