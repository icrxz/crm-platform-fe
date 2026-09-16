import { ListPageLayout } from '../common/list-page-layout';
import { shimmer } from '../common/skeleton-block';
import { Table, TableColumn } from '../common/table';

// Headers/widths mirror table.tsx's real columns so the skeleton doesn't
// shift once real data lands.
const columns: TableColumn<never>[] = [
  { key: 'external_reference', header: 'Sinistro', skeletonWidth: 'w-20' },
  { key: 'customer', header: 'Cliente', skeletonWidth: 'w-32' },
  { key: 'city', header: 'Cidade', skeletonWidth: 'w-24' },
  { key: 'contractor', header: 'Seguradora', skeletonWidth: 'w-28' },
  { key: 'category', header: 'Categoria', skeletonWidth: 'w-16' },
  { key: 'partner', header: 'Técnico', skeletonWidth: 'w-20' },
  { key: 'status', header: 'Status', skeletonWidth: 'w-20' },
  { key: 'due_date', header: 'Vencimento', skeletonWidth: 'w-20' },
];

export function CasesTableSkeleton() {
  return (
    <ListPageLayout
      title="Casos"
      searchBar={
        <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />
      }
    >
      <Table columns={columns} isLoading />
    </ListPageLayout>
  );
}
