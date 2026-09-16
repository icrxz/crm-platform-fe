import { ListPageLayout } from './list-page-layout';
import { shimmer } from './skeleton-block';
import { Table, TableColumn } from './table';

interface ListTableSkeletonProps {
  title: string;
  columns: string[];
  rows?: number;
}

const SKELETON_WIDTHS = [
  'w-28',
  'w-40',
  'w-32',
  'w-24',
  'w-20',
  'w-16',
  'w-20',
];

export function ListTableSkeleton({
  title,
  columns,
  rows = 8,
}: ListTableSkeletonProps) {
  const tableColumns: TableColumn<never>[] = columns.map((header, index) => ({
    key: header,
    header,
    skeletonWidth: SKELETON_WIDTHS[index % SKELETON_WIDTHS.length],
  }));

  return (
    <ListPageLayout
      title={title}
      searchBar={
        <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />
      }
    >
      <Table columns={tableColumns} isLoading skeletonRows={rows} />
    </ListPageLayout>
  );
}
