"use client";
import { parseDocument } from "@/app/libs/parser";
import { Partner } from "@/app/types/partner";
import { Button } from "../common/button";

interface PartnerDetailsProps {
  partner: Partner;
}

export default function PartnerDetails({ partner }: PartnerDetailsProps) {
  const handleUpdateDescription = (e: any) => {
    console.log(e)
  }

  return (
    <div className="rounded-xl bg-gray-50 p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Dados do técnico</h1>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Nome:</p>
            <p className="text-sm font-medium text-gray-900">{partner.first_name} {partner.last_name}</p>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Documento:</p>
            <p className="text-sm font-medium text-gray-900">{parseDocument(partner.document) || '-'}</p>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Tipo:</p>
            <p className="text-sm font-medium text-gray-900">{partner.partner_type}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full">
          <div>
            <label
              className="mb-2 block text-lg font-medium text-gray-900"
              htmlFor="description"
            >
              Observações
            </label>
          </div>

          <div className="mb-4">
            <textarea
              className="peer block w-80 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="description"
              rows={3}
              name="description"
              placeholder="Digite observações sobre o técnico"
              defaultValue={partner?.description || ''}
              required
            />
          </div>

          <Button onClick={handleUpdateDescription}> Alterar</Button>
        </div>
      </div>
    </div>
  );
}
