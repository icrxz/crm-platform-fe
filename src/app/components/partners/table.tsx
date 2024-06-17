"use client";
import Modal from '../../components/common/modal';
import { Partner } from '../../types/partner';
import { lusitana } from '../../ui/fonts';
import React, { useState } from 'react';
import PartnersSearchBar from './search-bar';
import CreatePartnerModal from './create-partner';
import EditPartnerModal from './edit-partner';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DeletePartnerModal } from './delete-partner';
import { useRouter } from 'next/navigation';

interface PartnersTableProps {
  partners: Partner[];
}

export default function PartnersTable({
  partners,
}: PartnersTableProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerID, setPartnerID] = useState("");
  const router = useRouter();

  function handlePartnerEdit(partnerID: string) {
    setPartnerID(partnerID)
    setIsEditModalOpen(true)
  }

  function handlePartnerDelete(partnerID: string) {
    setPartnerID(partnerID)
    setIsDeleteModalOpen(true)
  }

  function handleRowClick(partnerID: string) {
    router.push(`/partners/${partnerID}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Técnicos
      </h1>

      <PartnersSearchBar setIsCreationModalOpen={setIsCreateModalOpen} setIsFilterModalOpen={setIsFilterModalOpen} />

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
                  {partners.map((partner) => (
                    <tr key={partner.partner_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${partner.first_name} ${partner.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.document}
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

      {isFilterModalOpen && <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div>
          Filtro
        </div>
      </Modal>}

      {isCreateModalOpen && <CreatePartnerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}

      {isEditModalOpen && <EditPartnerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} partnerID={partnerID} />}

      {isDeleteModalOpen && <DeletePartnerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} partnerID={partnerID} />}
    </div>
  );
}
