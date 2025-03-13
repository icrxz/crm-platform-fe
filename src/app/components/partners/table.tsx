"use client";
import { parseDocument } from '@/app/libs/parser';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Pagination } from "@nextui-org/pagination";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';

import { SearchResponse } from '@/app/types/search_response';
import { Partner } from '../../types/partner';
import { roboto } from '../../ui/fonts';
import CreatePartnerModal from './create-partner';
import { DeletePartnerModal } from './delete-partner';
import EditPartnerModal from './edit-partner';
import PartnersSearchBar from './search-bar';

interface PartnersTableProps {
  partners?: SearchResponse<Partner>;
  initialPage?: number;
}

export default function PartnersTable({
  partners,
  initialPage = 1,
}: PartnersTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerID, setPartnerID] = useState("");

  function handlePartnerEdit(partnerID: string) {
    setPartnerID(partnerID);
    setIsEditModalOpen(true);
  }

  function handlePartnerDelete(partnerID: string) {
    setPartnerID(partnerID);
    setIsDeleteModalOpen(true);
  }

  function handleRowClick(partnerID: string) {
    router.push(`/partners/${partnerID}`);
  }

  function handleChangePage(value: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
        Técnicos
      </h1>

      <PartnersSearchBar setIsCreationModalOpen={setIsCreateModalOpen} />

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
                      Tipo
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Documento
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Cidade
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Estado
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {partners?.result.map((partner) => (
                    <tr key={partner.partner_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${partner.first_name} ${partner.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.partner_type}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDocument(partner.document) || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.shipping.city}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.shipping.state}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.active ? 'Ativo' : 'Inativo'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          <button
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleRowClick(partner.partner_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handlePartnerEdit(partner.partner_id)}
                          >
                            <PencilIcon className='w-5 md:w-6' />
                          </button>

                          {partner.active &&
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handlePartnerDelete(partner.partner_id)}
                            >
                              <TrashIcon className='w-5 md:w-6' />
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-2'>
        <Pagination
          onChange={handleChangePage}
          siblings={3}
          showControls
          total={Math.ceil(Number((partners?.paging.total || 1) / (partners?.paging.limit || 1)))}
          page={Number(initialPage || 1)}
        />
      </div>

      {isCreateModalOpen && <CreatePartnerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}

      {isEditModalOpen && <EditPartnerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} partnerID={partnerID} />}

      {isDeleteModalOpen && <DeletePartnerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} partnerID={partnerID} />}
    </div>
  );
}
