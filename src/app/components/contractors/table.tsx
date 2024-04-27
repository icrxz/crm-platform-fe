import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import {
Contractor
} from '@/app/types/contractor';

export default async function ContractorsTable({
  contractors,
}: {
  contractors: Contractor[];
}) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Contratantes
      </h1>
      <Search placeholder="Buscar contratantes..." />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Documento
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Data de criação
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Total de casos
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {contractors.map((contractor) => (
                    <tr key={contractor.contractor_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${contractor.legal_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {contractor.document}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {contractor.created_at}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {contractor.cases.length}
                      </td>
                    </tr>
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
