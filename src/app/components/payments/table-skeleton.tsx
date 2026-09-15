import { roboto } from '../../ui/fonts';

const shimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

function Block({ className = '' }: { className?: string }) {
  return <div className={`${shimmer} rounded-md bg-gray-200 ${className}`} />;
}

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

function PaymentsRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      {columnWidths.map((width, index) => (
        <td
          key={index}
          className={`whitespace-nowrap py-3 pl-4 pr-3 ${index === 0 ? 'sm:pl-6' : ''}`}
        >
          <Block className={`h-4 ${width}`} />
        </td>
      ))}
    </tr>
  );
}

export function PaymentsTableSkeleton() {
  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Pagamentos
      </h1>

      <div className={`${shimmer} h-16 w-full rounded-lg bg-gray-100`} />

      <div className="mt-4 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    {headers.map((header, index) => (
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
                    <PaymentsRowSkeleton key={index} />
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
