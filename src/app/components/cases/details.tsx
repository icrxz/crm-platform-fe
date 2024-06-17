import { parseDateTime } from "@/app/libs/date";
import { CaseFull, caseStatusMap } from "@/app/types/case";

interface CaseDetailsProps {
    crmCase: CaseFull;
}

export default function CaseDetails({ crmCase }: CaseDetailsProps) {
    return (
        <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold">Dados do caso</h1>
            </div>

            <div className="mt-4">
                <div className="items-center ml-4 gap-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">ID:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.case_id}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Sinistro:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.external_reference}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Seguradora:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.contractor?.company_name || ''}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Cliente:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.customer?.first_name || ''}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Produto:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.product?.brand || ''}</p>
                    </div>

                    {crmCase.partner && (
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-500">Técnico:</p>
                            <p className="text-sm font-medium text-gray-900">{crmCase.partner?.first_name || ''}</p>
                        </div>
                    )}

                    {crmCase.owner && (
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-500">Assignado a:</p>
                            <p className="text-sm font-medium text-gray-900">{crmCase.owner.name}</p>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Status:</p>
                        <p className="text-sm font-medium text-gray-900">{caseStatusMap[crmCase.status]}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Descrição:</p>
                        <p className="text-sm font-medium text-gray-900">{crmCase.subject}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">Data de vencimento:</p>
                        <p className="text-sm font-medium text-gray-900">{parseDateTime(crmCase.due_date, "dd/MM/yyyy")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}