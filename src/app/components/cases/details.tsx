"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseDateTime } from "@/app/libs/date";
import { parseDocument, parseToCurrency } from "@/app/libs/parser";
import { CaseFull, casePriorityMap, CaseStatus, caseStatusMap } from "@/app/types/case";
import { UserRole } from "@/app/types/user";
import { lusitana } from "@/app/ui/fonts";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Card } from "../common/card";
import { FormDetails } from "./form-details";

interface CaseDetailsProps {
  crmCase: CaseFull;
  userRole: UserRole;
}

export default function CaseDetails({ crmCase, userRole }: CaseDetailsProps) {
  const { push } = useRouter();

  const caseStatusList = Object.values(caseStatusMap).filter(status => status !== caseStatusMap["Canceled"]);
  const isAdminStatus = crmCase.status === CaseStatus.PAYMENT || crmCase.status === CaseStatus.CLOSED;
  const isAdminRole = userRole === UserRole.ADMIN || userRole === UserRole.THAVANNA_ADMIN;
  const isBeforeTargetDate = new Date() < new Date(crmCase.target_date!!);

  if (isAdminStatus && !isAdminRole) {
    // console.log("n ta autorizado", userRole);
    push("/cases");
  }

  function getStatusColor(caseStatus: string, actualStatus: CaseStatus): string {


    const colorVar = "text-gray-500";
    if (caseStatus === caseStatusMap[actualStatus]) {
      if (caseStatus === caseStatusMap[CaseStatus.ONGOING] && isBeforeTargetDate) {
        return "text-yellow-500";
      }
      return "text-green-500";
    }

    console.log("color", colorVar);
    return colorVar;
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="flex rounded-xl bg-gray-50 shadow-sm w-fit mb-6 p-4 gap-4 justify-center w-full">
          {caseStatusList.map((status, idx) => {
            return (
              <div key={status} className="flex">
                <p
                  className={`${lusitana.className} ${getStatusColor(status, crmCase.status)}`}
                >
                  {status}
                </p>

                {idx !== caseStatusList.length - 1 && <ArrowRightIcon className="h-5 w-5 pt-1 ml-2 text-gray-700" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="w-1/3 h-fill">
          <Card title="Dados do caso" titleSize="text-xl">
            <div className="items-center ml-4 gap-8">
              <CardText title="Sinistro:" text={crmCase.external_reference} />
              <CardText title="Seguradora:" text={crmCase.contractor?.company_name || ''} />
              <CardText title="Data de criação:" text={parseDateTime(crmCase.created_at)} />
              <CardText title="Criado por:" text={crmCase.created_by} />
              <CardText title="Prioridade:" text={casePriorityMap[crmCase.priority]} />
              {crmCase.owner && (
                <CardText title="Responsável:" text={crmCase.owner.username} />
              )}
              <CardText title="Data de vencimento:" text={parseDateTime(crmCase.due_date, "dd/MM/yyyy")} />
              {crmCase.partner && (
                <CardText title="Técnico:" text={`${crmCase.partner.first_name} ${crmCase.partner.last_name}`} />
              )}
              {crmCase.status == CaseStatus.ONGOING && crmCase.target_date && (
                <CardText title="Data agendada:" text={parseDateTime(crmCase.target_date, "dd/MM/yyyy")} />
              )}
            </div>
          </Card>
        </div>

        <div className="w-2/3 h-fit">
          {crmCase.status && <FormDetails crmCase={crmCase} />}
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="w-full h-fill">
          <Card title="Detalhes" titleSize="text-xl">
            <div className="mx-4">
              <div className="items-center space-y-4">
                <p className="text-sm font-medium text-gray-900">{crmCase.subject}</p>
              </div>

              {crmCase.comments && (
                <div className="mt-4">
                  <h2 className={`text-m font-semibold`}>
                    Comentários
                  </h2>

                  {crmCase.comments.map(comment => {
                    return (
                      <div key={comment.comment_id} className="flex items-center ml-2 mt-2 gap-8">
                        <CardText title="Data de criação:" text={parseDateTime(comment.created_at)} />
                        <CardText title="Comentário:" text={comment.content} shouldCopy />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="w-1/2 h-fill">
          <Card title="Cliente" titleSize="text-xl">
            <div className="items-center ml-4 gap-8">
              <CardText title="Nome do cliente:" text={`${crmCase.customer?.first_name} ${crmCase.customer?.last_name}` || ''} />
              <CardText title="Documento:" text={parseDocument(crmCase.customer?.document || '')} />
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
    </>
  );
}

function CardText({ title, text, shouldCopy }: { title: string; text: string; shouldCopy?: boolean; }) {
  const { showSnackbar } = useSnackbar();

  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p
        className={`text-sm font-medium text-gray-900 ${shouldCopy ? "hover:cursor-pointer" : ""}`}
        // className="text-sm font-medium text-gray-900 hover:cursor-pointer"
        onClick={(e) => {
          if (shouldCopy) {
            navigator.clipboard.writeText(e.currentTarget.innerText);
            showSnackbar("Texto copiado para a área de transferência", 'success');
          }
        }}
      >
        {text}
      </p>
    </div>
  );
}
