import { parseDocument } from "@/app/libs/parser";
import { Contractor } from "@/app/types/contractor";

interface ContractorDetailsProps {
  contractor: Contractor;
}

export default function ContractorDetails({ contractor }: ContractorDetailsProps) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Dados da seguradora</h1>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Nome:</p>
            <p className="text-sm font-medium text-gray-900">{contractor.company_name} / {contractor.legal_name}</p>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Documento:</p>
            <p className="text-sm font-medium text-gray-900">{parseDocument(contractor.document)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
