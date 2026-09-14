import { roboto } from '../../ui/fonts';
import { shimmer, SkeletonBlock } from '../common/skeleton-block';

const columns = [
  'Data',
  'Cidade',
  'Segurado',
  'Técnico',
  'Senha',
  'Seguradora',
  'Mão de obra Técnico',
  'Deslocamento Técnico',
  'Peças Técnico',
  'Mão de obra Seguradora',
  'Deslocamento Seguradora',
  'Peças Seguradora',
  'Serviço',
];

function FilterFieldSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <SkeletonBlock className="mb-1 h-3 w-16" />
      <SkeletonBlock className="h-10 w-full" />
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className={`${shimmer} rounded-xl bg-gray-50 p-3 shadow-sm`}>
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="h-9 w-full" />
    </div>
  );
}

function PanelRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      {columns.map((_, index) => (
        <td key={index} className="whitespace-nowrap py-5 sm:pl-6">
          <SkeletonBlock className="h-4 w-16" />
        </td>
      ))}
    </tr>
  );
}

export function PanelSkeleton() {
  return (
    <main>
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Painel de controle
      </h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg bg-gray-100 px-4 pb-4 pt-4 shadow-md">
        <FilterFieldSkeleton className="w-32 shrink-0" />
        <FilterFieldSkeleton className="w-24 shrink-0" />
        <FilterFieldSkeleton className="w-32 shrink-0" />
        <FilterFieldSkeleton className="min-w-[130px] flex-1" />
        <FilterFieldSkeleton className="min-w-[200px] flex-1" />
        <FilterFieldSkeleton className="min-w-[260px] flex-1" />
        <SkeletonBlock className="h-10 w-24" />
        <SkeletonBlock className="h-10 w-32" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 px-1">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-4 w-24" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-md bg-gray-50 p-2">
        <table className="hidden min-w-full table-auto rounded-md text-gray-900 md:table">
          <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
            <tr>
              {columns.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="py-5 font-medium sm:pl-6"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <PanelRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
