"use client";
import Modal from '../../components/common/modal';
import {
  Partner
} from '../../types/partner';
import { lusitana } from '../../ui/fonts';
import React, { useState } from 'react';
import PartnersSearchBar from './search-bar';
import CreatePartnerModal from './create-partner';

interface PartnersTableProps {
  partners: Partner[];
}

export default function PartnersTable({
  partners,
}: PartnersTableProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {partners.map((partner) => (
                    <tr key={partner.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${partner.first_name} ${partner.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.document}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.shipping_city}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {partner.shipping_state}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        Ativo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div>
          Filtro
        </div>
      </Modal>

      <CreatePartnerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
