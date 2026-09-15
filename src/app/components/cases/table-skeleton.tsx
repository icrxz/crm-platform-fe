import { roboto } from '../../ui/fonts';

const shimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

function Block({ className = '' }: { className?: string }) {
  return <div className={`${shimmer} rounded-md bg-gray-200 ${className}`} />;
}

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
          <Block className={`h-4 ${width}`} />
        </td>
      ))}
    </tr>
  );
}

export function CasesTableSkeleton() {
  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Casos</h1>

      <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />

      <div className="mt-4 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
