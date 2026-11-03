'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { ONLY_DATE_PATTERN, parseDateTime, timeElapsed } from '@/app/libs/date';
import { changeStatus, updateCaseMetadata } from '@/app/services/cases';
import { addComment } from '@/app/services/comments';
import {
  AttachmentDocumentType,
  attachmentDocumentTypeLabel,
  CreateAttachment,
} from '@/app/types/attachments';
import {
  CaseFull,
  CaseServiceType,
  CaseStatus,
  parseCaseCategory,
} from '@/app/types/case';
import { requiredCaseDocuments } from '@/app/utils/case_documents';
import {
  ADVANCE_REQUESTED_METADATA_KEY,
  ADVANCE_REQUESTED_METADATA_VALUE,
} from '@/app/utils/case_metadata';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
  useState,
} from 'react';
import { useActionState } from 'react';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { FormTitleWithTooltip } from '../../common/form-title-tooltip';
import dynamic from 'next/dynamic';
import type {
  FileUploaderGenericRef,
  FileUploaderProps,
} from '../../common/file-uploader';

const GenericUploader = dynamic(
  () =>
    import('../../common/file-uploader').then((m) => ({
      default: m.GenericUploader,
    })),
  { ssr: false }
) as ForwardRefExoticComponent<
  FileUploaderProps & RefAttributes<FileUploaderGenericRef>
>;
import TargetDateModal from '../target-date-modal';
import { ErrorMessage } from '../../common/error-message';
import { RadioGroup, Radio } from '@heroui/react';

interface OnGoingStatusFormProps {
  crmCase: CaseFull;
}

type OnGoingStep = 'attendance' | 'report';

export function OnGoingStatusForm({ crmCase }: OnGoingStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useActionState(onSubmit, null);

  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);
  const commentFileUploaderRef = useRef<FileUploaderGenericRef>(null);
  const [step, setStep] = useState<OnGoingStep>('attendance');
  const [content, setContent] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingAdvance, setLoadingAdvance] = useState(false);
  const [openTargetDateModal, setOpenTargetDateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serviceType, setServiceType] = useState<CaseServiceType>(
    CaseServiceType.REPAIR
  );

  const isBeforeTargetDate = new Date() < new Date(crmCase.target_date!!);
  const canAdvanceToReportStep = !isBeforeTargetDate;
  const isReportStep = step === 'report' && canAdvanceToReportStep;

  // A papelada exigida muda com o tipo de serviço e a categoria, e é o técnico
  // que escolhe o tipo aqui — por isso a lista é derivada do radio, não do
  // crmCase.type (que só vira repair/inspection depois deste envio). Vale
  // tanto pros anexos de comentário (etapa 1) quanto pro laudo (etapa 2): a
  // ordem de serviço assinada, por exemplo, costuma chegar via "Adicionar
  // comentário" antes do caso ir pro laudo.
  const requiredDocuments = requiredCaseDocuments(
    serviceType,
    parseCaseCategory(crmCase.metadata?.category)
  );
  const documentTypes = [AttachmentDocumentType.PHOTO, ...requiredDocuments];

  async function onSubmit(_currentState: unknown, formData: FormData) {
    let attachments: CreateAttachment[] = [];

    await fileUploaderRef.current?.submit().then((response) => {
      attachments = response || [];
    });

    if (attachments.length <= 0) {
      setErrorMessage('Deve haver no mínimo 1 anexo.');
      return;
    }

    changeStatus(
      crmCase.case_id,
      CaseStatus.REPORT,
      formData,
      attachments
    ).then((response) => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut({ callbackUrl: '/login' });
        }
        showSnackbar(response.message, 'error');
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    });
  }

  async function handleAddComment() {
    setLoadingComment(true);

    const formData = new FormData();
    formData.append('content', content);

    let attachments: CreateAttachment[] = [];

    await commentFileUploaderRef.current?.submit().then((response) => {
      attachments = response || [];
    });

    addComment(crmCase.case_id, formData, attachments)
      .then((response) => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
          }
          showSnackbar(response.message, 'error');
          return;
        }

        showSnackbar(response.message, 'success');
        refresh();
      })
      .finally(() => {
        setContent('');
      });

    setLoadingComment(false);
  }

  async function handleRequestAdvance() {
    // Cada solicitação vira um comentário próprio, com o que o técnico
    // escreveu — é o texto que diz qual peça/valor está sendo pedido, então
    // um conteúdo fixo não serve. A flag no metadata é uma só: marcá-la de
    // novo é idempotente e reabre o caso como pendente se o admin já tiver
    // dado baixa num pedido anterior.
    if (!content.trim()) {
      setErrorMessage(
        'Descreva a solicitação em "Informações adicionais" antes de solicitar o adiantamento.'
      );
      return;
    }

    setErrorMessage('');
    setLoadingAdvance(true);

    const formData = new FormData();
    formData.append('content', content);

    addComment(crmCase.case_id, formData)
      .then((response) => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
          }
          showSnackbar(response.message, 'error');
          return;
        }

        return updateCaseMetadata(crmCase.case_id, {
          [ADVANCE_REQUESTED_METADATA_KEY]: ADVANCE_REQUESTED_METADATA_VALUE,
        }).then((metadataResponse) => {
          if (!metadataResponse.success) {
            if (metadataResponse.unauthorized) {
              signOut({ callbackUrl: '/login' });
            }
            showSnackbar(metadataResponse.message, 'error');
            return;
          }

          showSnackbar('Adiantamento solicitado com sucesso', 'success');
          setContent('');
          refresh();
        });
      })
      .finally(() => {
        setLoadingAdvance(false);
      });
  }

  function handleAdvanceToReportStep() {
    setErrorMessage('');
    setStep('report');
  }

  function handleBackToAttendanceStep() {
    setErrorMessage('');
    setStep('attendance');
  }

  return (
    <Card
      title={
        <FormTitleWithTooltip
          title={
            isBeforeTargetDate
              ? 'Aguardando data da visita'
              : `Caso em andamento${
                  canAdvanceToReportStep
                    ? ` — Etapa ${isReportStep ? '2' : '1'} de 2`
                    : ''
                }`
          }
          tooltip="Etapa 1: registre comentários, solicitações e anexos durante o atendimento (esses anexos ficam só no comentário, não vão para o laudo). Etapa 2: preencha os dados que vão para o laudo e envie — as imagens anexadas aqui são as que entram no laudo final."
          titleSize="xl"
        />
      }
    >
      <form action={dispatch} className="gap-4 px-5">
        {isBeforeTargetDate ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-500">Data agendada:</p>
            <p className="text-sm font-medium text-gray-900">
              {parseDateTime(crmCase.target_date || '', ONLY_DATE_PATTERN)}
            </p>
            <Button
              type="button"
              size="sm"
              className="shrink-0"
              onClick={() => setOpenTargetDateModal(true)}
            >
              Alterar data de visita
            </Button>
          </div>
        ) : (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-500">
              Tempo decorrido:
            </p>
            <p className="text-sm font-medium text-gray-900">
              {timeElapsed(new Date(crmCase.target_date!!), new Date())}
            </p>
            <Button
              type="button"
              size="sm"
              className="shrink-0"
              onClick={() => setOpenTargetDateModal(true)}
            >
              Alterar data de visita
            </Button>
          </div>
        )}

        <div hidden={isReportStep}>
          <div className="mb-2">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="content"
            >
              Informações adicionais
            </label>

            <textarea
              id="content"
              className="h-32 w-full rounded-md border border-gray-300 p-2"
              rows={3}
              placeholder="Adicione comentários ao caso durante o atendimento"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required={!isReportStep}
            />
          </div>

          {/* Anexos daqui ficam presos ao comentário — não entram no laudo
              (esses vêm do uploader da etapa 2, em "Enviar para laudo"). */}
          <div className="mb-4">
            <GenericUploader
              ref={commentFileUploaderRef}
              minFiles={0}
              maxFiles={20}
              documentTypes={documentTypes}
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <Button
              type="button"
              onClick={handleAddComment}
              isLoading={loadingComment}
            >
              Adicionar comentário
            </Button>
            <Button
              type="button"
              onClick={handleRequestAdvance}
              isLoading={loadingAdvance}
              disabled={loadingComment}
            >
              Solicitar Adiantamento/Peças
            </Button>
            {canAdvanceToReportStep && (
              <Button type="button" onClick={handleAdvanceToReportStep}>
                Avançar para dados do laudo
              </Button>
            )}
          </div>
        </div>

        {/* O uploader e o seletor de tipo ficam sempre montados (só
            escondidos via o atributo `hidden`) para não perder anexos/seleção
            já feitos ao alternar entre as etapas. */}
        <div hidden={!isReportStep}>
          <div className="mb-2">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="report-content"
            >
              Conclusão do atendimento
            </label>

            <textarea
              id="report-content"
              name="content"
              className="h-32 w-full rounded-md border border-gray-300 p-2"
              rows={3}
              placeholder='Descreva o que foi feito no atendimento para constar no laudo e selecione as imagens para anexar, clicando em "Enviar para laudo"'
              value={reportContent}
              onChange={(event) => setReportContent(event.target.value)}
              required={isReportStep}
            />
          </div>

          <div className="mb-4">
            <GenericUploader
              ref={fileUploaderRef}
              minFiles={isBeforeTargetDate ? 0 : 1}
              maxFiles={20}
              documentTypes={documentTypes}
            />
          </div>

          <div>
            <RadioGroup
              label="Tipo de serviço"
              value={serviceType}
              onValueChange={(value) =>
                setServiceType(value as CaseServiceType)
              }
              className="mb-4"
              orientation="horizontal"
              isRequired={isReportStep}
              size="sm"
              id="type"
              name="type"
            >
              <Radio value={CaseServiceType.REPAIR}>Reparo</Radio>
              <Radio value={CaseServiceType.INSPECTION}>Vistoria</Radio>
            </RadioGroup>

            {requiredDocuments.length > 0 && (
              <p className="mb-4 text-sm text-gray-500">
                Marque cada arquivo com o seu tipo. Este caso precisa de:{' '}
                {requiredDocuments
                  .map((document) => attachmentDocumentTypeLabel[document])
                  .join(', ')}
                .
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button type="button" onClick={handleBackToAttendanceStep}>
              Voltar
            </Button>
            <Button type="submit" disabled={loadingComment}>
              Enviar para laudo
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4">
            <ErrorMessage message={errorMessage} />
          </div>
        )}
      </form>

      {openTargetDateModal && (
        <TargetDateModal
          caseId={crmCase.case_id}
          isOpen={openTargetDateModal}
          onClose={() => setOpenTargetDateModal(false)}
        />
      )}
    </Card>
  );
}
