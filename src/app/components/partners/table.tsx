'use client';
import { parseDocument } from '@/app/libs/parser';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PartnerListItem } from '@/app/types/partner-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { IconButton } from '../common/icon-button';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Pill } from '../common/pill';
import CreatePartnerModal from './create-partner';
import { DeletePartnerModal } from './delete-partner';
import EditPartnerModal from './edit-partner';
import PartnersSearchBar from './search-bar';

interface PartnersTableProps {
  partners?: SearchResponse<PartnerListItem>;
  initialPage?: number;
}

export default function PartnersTable({
  partners,
  initialPage = 1,
}: PartnersTableProps) {
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerID, setPartnerID] = useState('');

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

  return (
    <>
      <ListPageLayout
        title="Técnicos"
        searchBar={
          <PartnersSearchBar setIsCreationModalOpen={setIsCreateModalOpen} />
        }
        pagination={<Pagination paging={partners?.paging} page={initialPage} />}
      >
        <table className="hidden min-w-full rounded-md text-gray-900 md:table">
          <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium sm:pl-6">
                Nome
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Tipo
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Documento
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Cidade
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Estado
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-900">
            {partners?.result.map((partner) => (
              <tr
                key={partner.partner_id}
                className="group cursor-pointer"
                onClick={() => handleRowClick(partner.partner_id)}
              >
                <td className="whitespace-nowrap bg-white py-3 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md group-hover:bg-gray-100 sm:pl-6">
                  <div className="flex items-center gap-3">
                    <p>{`${partner.first_name} ${partner.last_name}`}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  {partner.partner_type}
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  {parseDocument(partner.document) || '-'}
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  {partner.city}
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  {partner.state}
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  <Pill
                    text={partner.active ? 'Ativo' : 'Inativo'}
                    color={partner.active ? 'success' : 'neutral'}
                  />
                </td>
                <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      color="info"
                      icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
                      onClick={() => handlePartnerEdit(partner.partner_id)}
                    />

                    {partner.active && (
                      <IconButton
                        color="error"
                        icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
                        onClick={() => handlePartnerDelete(partner.partner_id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListPageLayout>

      {isCreateModalOpen && (
        <CreatePartnerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditPartnerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          partnerID={partnerID}
        />
      )}

      {isDeleteModalOpen && (
        <DeletePartnerModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          partnerID={partnerID}
        />
      )}
    </>
  );
}
