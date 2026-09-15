'use client';
import { parseDocument } from '@/app/libs/parser';
import { Partner } from '@/app/types/partner';
import { Button } from '../common/button';
import { Pill } from '../common/pill';

interface PartnerDetailsProps {
  partner: Partner;
}

export default function PartnerDetails({ partner }: PartnerDetailsProps) {
  const handleUpdateDescription = (e: any) => {
    console.log(e);
  };

  return (
    <div className="rounded-xl bg-gray-50 p-8 shadow-sm">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Dados do técnico
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {partner.first_name} {partner.last_name}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <Pill text={parseDocument(partner.document) || '-'} textSize="sm" />
          <Pill text={partner.partner_type} textSize="sm" />
        </div>
      </div>

      <div className="mt-6">
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
