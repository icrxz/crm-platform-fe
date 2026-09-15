import { roboto } from '../../ui/fonts';
import { shimmer, SkeletonBlock } from './skeleton-block';

interface ListTableSkeletonProps {
  title: string;
  columns: string[];
  rows?: number;
}

const rowWidths = ['w-28', 'w-40', 'w-32', 'w-24', 'w-20', 'w-16', 'w-20'];

function ListRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td
          key={index}
          className={`whitespace-nowrap px-4 py-3 ${index === 0 ? 'sm:pl-6' : ''}`}
        >
          <SkeletonBlock
            className={`h-4 ${rowWidths[index % rowWidths.length]}`}
          />
        </td>
      ))}
    </tr>
  );
}

export function ListTableSkeleton({
  title,
  columns,
  rows = 8,
}: ListTableSkeletonProps) {
  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        {title}
      </h1>

      <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />

      <div className="mt-4 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    {columns.map((header, index) => (
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
                  {Array.from({ length: rows }).map((_, index) => (
                    <ListRowSkeleton key={index} columns={columns.length} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
