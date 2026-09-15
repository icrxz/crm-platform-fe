import { ListPageLayout } from '../common/list-page-layout';
import { shimmer, SkeletonBlock } from '../common/skeleton-block';

const columnWidths = [
  'w-20',
  'w-32',
  'w-24',
  'w-28',
  'w-16',
  'w-20',
  'w-20',
  'w-20',
];

function CasesRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      {columnWidths.map((width, index) => (
        <td
          key={index}
          className={`whitespace-nowrap px-4 py-3 ${index === 0 ? 'sm:pl-6' : ''}`}
        >
          <SkeletonBlock className={`h-4 ${width}`} />
        </td>
      ))}
    </tr>
  );
}

export function CasesTableSkeleton() {
  return (
    <ListPageLayout
      title="Casos"
      searchBar={
        <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />
      }
    >
      <table className="hidden min-w-full rounded-md text-gray-900 md:table">
        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
          <tr>
            {[
              'Sinistro',
              'Cliente',
              'Cidade',
              'Seguradora',
              'Categoria',
              'Técnico',
              'Status',
              'Vencimento',
            ].map((header, index) => (
              <th
                key={header}
                scope="col"
                className={`px-4 py-3 font-medium ${index === 0 ? 'sm:pl-6' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.from({ length: 8 }).map((_, index) => (
            <CasesRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </ListPageLayout>
  );
}
