import { Partner } from "@/app/types/partner";

interface PartnerDetailsProps {
  partner: Partner;
}

export default function PartnerDetails({ partner }: PartnerDetailsProps) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
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
            <p className="text-sm font-medium text-gray-900">{partner.document}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
