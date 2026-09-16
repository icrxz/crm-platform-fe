import { ReactNode } from 'react';
import { roboto } from '../../ui/fonts';
import { EmptyState } from './empty-state';

interface ListPageLayoutProps {
  title: string;
  searchBar?: ReactNode;
  pagination?: ReactNode;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
}

// ~8 rows + header at the tallest real row height (a table with an Ações
// column of icon buttons, ~56px/row) — keeps the table/card area a
// consistent height across loading, populated (few rows) and empty states
// instead of visibly shrinking to fit content, and close enough to a full
// icon-heavy table's real height that it doesn't look empty by comparison.
const MIN_CONTENT_HEIGHT = 'min-h-[480px]';

// Shared shell for every listing page (and its loading skeleton — see
// ListTableSkeleton/CasesTableSkeleton/PaymentsTableSkeleton): fills the
// available height, keeps the composed search bar + table + pagination
// block centered when there's slack, and stays fully scrollable (never
// hides content) when there isn't. `overflow-x-hidden` must sit next to
// `overflow-y-auto` here — setting only one axis makes the browser compute
// the other as `auto` too, which otherwise leaks a horizontal scrollbar
// from anything with negative margins inside (e.g. HeroUI's Pagination).
export function ListPageLayout({
  title,
  searchBar,
  pagination,
  children,
  isEmpty = false,
  emptyMessage,
  onRefresh,
}: ListPageLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <h1 className={`${roboto.className} mb-4 mt-4 text-xl md:text-2xl`}>
        {title}
      </h1>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="my-auto flex w-full flex-col gap-4">
          {searchBar}

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div
                className={`overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0 ${MIN_CONTENT_HEIGHT}`}
              >
                {isEmpty ? (
                  <EmptyState message={emptyMessage} onRefresh={onRefresh} />
                ) : (
                  children
                )}
              </div>
            </div>
          </div>

          {pagination}
        </div>
      </div>
    </div>
  );
}
