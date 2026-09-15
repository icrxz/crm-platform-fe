import { ListPageLayout } from '../common/list-page-layout';
import { shimmer, SkeletonBlock } from '../common/skeleton-block';

const headers = [
  'Sinistro',
  'Segurado',
  'Técnico',
  'PIX',
  'MO',
  'Deslocamento',
  'Peças',
  'Total',
  'Status',
  'Data de criação',
  'Ações',
];

const columnWidths = [
  'w-20',
  'w-28',
  'w-24',
  'w-24',
  'w-12',
  'w-16',
  'w-12',
  'w-16',
  'w-16',
  'w-20',
  'w-16',
];

// Matches payments/table.tsx's reduced px-2/pr-2 padding (11 columns don't
// fit at 1280px otherwise) so the skeleton doesn't shift once real data
// replaces it.
function PaymentsRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      {columnWidths.map((width, index) => (
        <td
          key={index}
          className={`whitespace-nowrap py-3 pl-4 pr-2 ${index === 0 ? 'sm:pl-6' : ''}`}
        >
          <SkeletonBlock className={`h-4 ${width}`} />
        </td>
      ))}
    </tr>
  );
}

export function PaymentsTableSkeleton() {
  return (
    <ListPageLayout
      title="Pagamentos"
      searchBar={
        <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />
      }
    >
      <table className="hidden min-w-full rounded-md text-gray-900 md:table">
        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                scope="col"
                className={`px-2 py-3 font-medium ${index === 0 ? 'sm:pl-6' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.from({ length: 8 }).map((_, index) => (
            <PaymentsRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </ListPageLayout>
  );
}
