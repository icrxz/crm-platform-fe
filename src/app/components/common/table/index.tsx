import clsx from 'clsx';
import { ReactNode } from 'react';
import { SkeletonBlock } from '../skeleton-block';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  skeletonWidth?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data?: T[];
  rowKey?: (item: T) => string;
  onRowClick?: (item: T) => void;
  isRowClickable?: (item: T) => boolean;
  density?: 'normal' | 'compact';
  isLoading?: boolean;
  skeletonRows?: number;
}

const DEFAULT_SKELETON_ROWS = 8;
const DEFAULT_SKELETON_WIDTH = 'w-20';

// The desktop counterpart to ListItemCard/ListItemCardGroup (see
// common/list-item-card): callers render both, CSS shows one or the other
// by breakpoint. `hidden md:table` here is what makes that work.
//
// The table itself floats inside ListPageLayout's padded gray-50 box, so
// its own 4 corners (not the table's start/end column edges — the actual
// first/last *row* crossed with the first/last *column*) need rounding to
// look like a rounded card rather than a square grid.
export function Table<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  isRowClickable,
  density = 'normal',
  isLoading = false,
  skeletonRows = DEFAULT_SKELETON_ROWS,
}: TableProps<T>) {
  const rows = isLoading
    ? Array.from({ length: skeletonRows }, (_, index) => ({
        key: `skeleton-${index}`,
        item: null as T | null,
      }))
    : (data ?? []).map((item, index) => ({
        key: rowKey ? rowKey(item) : String(index),
        item,
      }));

  function headerCellClass(colIndex: number) {
    return clsx(
      'py-3 font-medium',
      density === 'compact' ? 'px-2' : 'px-4',
      colIndex === 0 && 'sm:pl-6'
    );
  }

  function bodyCellClass(rowIndex: number, colIndex: number) {
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rows.length - 1;
    const isFirstCol = colIndex === 0;
    const isLastCol = colIndex === columns.length - 1;

    return clsx(
      'whitespace-nowrap bg-white py-3 text-sm',
      density === 'compact' ? 'px-2' : 'px-4',
      isFirstCol && 'pl-4 sm:pl-6',
      isFirstRow && isFirstCol && 'rounded-tl-md',
      isFirstRow && isLastCol && 'rounded-tr-md',
      isLastRow && isFirstCol && 'rounded-bl-md',
      isLastRow && isLastCol && 'rounded-br-md'
    );
  }

  return (
    <table className="hidden min-w-full rounded-md text-gray-900 md:table">
      <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
        <tr>
          {columns.map((column, index) => (
            <th
              key={column.key}
              scope="col"
              className={clsx(headerCellClass(index), column.className)}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200 text-gray-900">
        {rows.map(({ key, item }, rowIndex) => {
          const clickable =
            !isLoading &&
            !!onRowClick &&
            item !== null &&
            (isRowClickable ? isRowClickable(item) : true);

          return (
            <tr
              key={key}
              className={clsx('group', clickable && 'cursor-pointer')}
              onClick={clickable ? () => onRowClick!(item as T) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={column.key}
                  className={clsx(
                    bodyCellClass(rowIndex, colIndex),
                    clickable && 'group-hover:bg-gray-100',
                    column.className
                  )}
                >
                  {isLoading || item === null ? (
                    <SkeletonBlock
                      className={`h-4 ${column.skeletonWidth ?? DEFAULT_SKELETON_WIDTH}`}
                    />
                  ) : (
                    column.render?.(item)
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
