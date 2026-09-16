import { ListPageLayout } from '../common/list-page-layout';
import { shimmer } from '../common/skeleton-block';
import { Table, TableColumn } from '../common/table';

// Headers/widths mirror table.tsx's real columns so the skeleton doesn't
// shift once real data lands.
const columns: TableColumn<never>[] = [
  { key: 'external_reference', header: 'Sinistro', skeletonWidth: 'w-20' },
  { key: 'customer', header: 'Segurado', skeletonWidth: 'w-28' },
  { key: 'partner', header: 'Técnico', skeletonWidth: 'w-24' },
  { key: 'pix', header: 'PIX', skeletonWidth: 'w-24' },
  { key: 'mo', header: 'MO', skeletonWidth: 'w-12' },
  { key: 'transport', header: 'Deslocamento', skeletonWidth: 'w-16' },
  { key: 'parts', header: 'Peças', skeletonWidth: 'w-12' },
  { key: 'total', header: 'Total', skeletonWidth: 'w-16' },
  { key: 'status', header: 'Status', skeletonWidth: 'w-16' },
  { key: 'created_at', header: 'Data de criação', skeletonWidth: 'w-20' },
  { key: 'actions', header: 'Ações', skeletonWidth: 'w-16' },
];

export function PaymentsTableSkeleton() {
  return (
    <ListPageLayout
      title="Pagamentos"
      searchBar={
        <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />
      }
    >
      <Table columns={columns} isLoading density="compact" />
    </ListPageLayout>
  );
}
