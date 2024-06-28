"use client";
import { parseDateTime } from "@/app/libs/date";
import { parseToCurrency } from "@/app/libs/parser";
import { CaseFull, casePriorityMap, CaseStatus, caseStatusMap } from "@/app/types/case";
import { lusitana } from "@/app/ui/fonts";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Card } from "../common/card";
import { FormDetails } from "./form-details";

interface CaseDetailsProps {
    crmCase: CaseFull;
}

export default function CaseDetails({ crmCase }: CaseDetailsProps) {
    const caseStatusList = Object.values(caseStatusMap).filter(status => status !== caseStatusMap["Canceled"]);
    const [selectedStatus, setSelectedStatus] = useState<CaseStatus>(crmCase.status);

    function handleStatusBarClick(status: string) {
        switch (status) {
            case "Novo":
                setSelectedStatus(CaseStatus.NEW);
                break;
            case "Informações cliente":
                setSelectedStatus(CaseStatus.CUSTOMER_INFO);
                break;
            case "Aguardando técnico":
                setSelectedStatus(CaseStatus.WAITING_PARTNER);
                break;
            case "Em andamento":
                setSelectedStatus(CaseStatus.ONGOING);
                break;
            case "Laudo":
                setSelectedStatus(CaseStatus.REPORT);
                break;
            case "Pagamento":
                setSelectedStatus(CaseStatus.PAYMENT);
                break;
            case "Encerrado":
                setSelectedStatus(CaseStatus.CLOSED);
                break;
            case "Cancelado":
                setSelectedStatus(CaseStatus.CANCELED);
                break;
            default:
                setSelectedStatus(CaseStatus.NEW);
        }
    }

    useEffect(() => {
        crmCase.status = selectedStatus;
    }, [selectedStatus, crmCase]);

    return (
        <>
            <div className="flex rounded-xl bg-gray-50 shadow-sm w-fit mb-6 p-4 gap-4 justify-center">
                {caseStatusList.map((status, idx) => {
                    return (
                        <div key={status} className="flex">
                            <p
                                className={`${lusitana.className} ${status === caseStatusMap[crmCase.status] ? "text-green-500" : "text-gray-500"}`}
                                onClick={() => handleStatusBarClick(status as CaseStatus)}
                            >
                                {status}
                            </p>

                            {idx !== caseStatusList.length - 1 && <ArrowRightIcon className="h-5 w-5 pt-1 ml-2 text-gray-700" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-6 mb-8">
                <div className="w-1/3 h-fill">
                    <Card title="Dados do caso" titleSize="text-xl">
                        <div className="items-center ml-4 gap-8">
                            <CardText title="ID do caso:" text={crmCase.case_id} />
                            <CardText title="Seguradora:" text={crmCase.contractor?.company_name || ''} />
                            <CardText title="Sinistro:" text={crmCase.external_reference} />
                            <CardText title="Data de criação:" text={parseDateTime(crmCase.created_at)} />
                            <CardText title="Criado por:" text={crmCase.created_by} />
                            <CardText title="Prioridade:" text={casePriorityMap[crmCase.priority]} />
                            <CardText title="Data de vencimento:" text={parseDateTime(crmCase.due_date, "dd/MM/yyyy")} />
                        </div>
                    </Card>
                </div>

                <div className="w-2/3 h-fit">
                    {crmCase.status && <FormDetails crmCase={crmCase} />}
                </div>
            </div>

            <div className="flex gap-6 mb-8">
                <div className="w-1/2 h-fill">
                    <Card title="Cliente" titleSize="text-xl">
                        <div className="items-center ml-4 gap-8">
                            <CardText title="Nome do cliente:" text={`${crmCase.customer?.first_name} ${crmCase.customer?.last_name}` || ''} />
                            <CardText title="Documento:" text={crmCase.customer?.document || ''} />
                            <CardText title="Endereço:" text={crmCase.customer?.shipping.address || ''} />
                            <CardText title="Cidade:" text={crmCase.customer?.shipping.city || ''} />
                            <CardText title="Estado:" text={crmCase.customer?.shipping.state || ''} />
                            <CardText title="CEP:" text={crmCase.customer?.shipping.zip_code || ''} />
                            <CardText title="Telefone:" text={crmCase.customer?.personal_contact?.phone_number || ''} />
                            <CardText title="Email:" text={crmCase.customer?.personal_contact?.email || ''} />
                        </div>
                    </Card>
                </div>

                <div className="w-1/2 h-fill">
                    <Card title="Produto" titleSize="text-xl">
                        <div className="items-center ml-4 gap-8">
                            <CardText title="Nome do produto:" text={crmCase.product?.product_name || ''} />
                            <CardText title="Descrição:" text={crmCase.product?.product_description || ''} />
                            <CardText title="Marca:" text={crmCase.product?.brand || ''} />
                            <CardText title="Modelo:" text={crmCase.product?.model || ''} />
                            <CardText title="Valor:" text={parseToCurrency(crmCase.product?.value || 0)} />
                            <CardText title="Número de série:" text={crmCase.product?.serial_number || ''} />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex gap-6 mb-8">
                <div className="w-full h-fill">
                    <Card title="Comentários" titleSize="text-xl">
                        <div></div>
                    </Card>
                </div>
            </div>
        </>
    );
}

function CardText({ title, text }: { title: string; text: string; }) {
    return (
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-sm font-medium text-gray-900">{text}</p>
        </div>
    );
}
