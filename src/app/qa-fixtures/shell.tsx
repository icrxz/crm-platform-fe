interface ShellProps {
  children: React.ReactNode;
}

// Mirrors (authenticated)/layout.tsx's content-column classes without the
// real SideNav/session, so fixtures visually match production spacing.
export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen md:flex-row md:overflow-hidden">
      <div className="w-64 flex-none bg-gray-100" />
      <div className="grow p-6 md:overflow-y-auto md:px-12 md:py-6">
        <main className="flex h-full flex-col">{children}</main>
      </div>
    </div>
  );
}
