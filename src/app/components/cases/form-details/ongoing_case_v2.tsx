'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { timeElapsed } from '@/app/libs/date';
import { deleteAttachment } from '@/app/services/attachments';
import { changeStatus, updateCaseMetadata } from '@/app/services/cases';
import { addAttachmentToComment, addComment } from '@/app/services/comments';
import {
  Attachment,
  attachmentDocumentTypeLabel,
  AttachmentDocumentType,
} from '@/app/types/attachments';
import {
  CaseFull,
  CaseServiceType,
  CaseStatus,
  parseCaseCategory,
  parseCaseServiceType,
} from '@/app/types/case';
import { CommentType } from '@/app/types/comment';
import { ServiceResponse } from '@/app/types/service';
import { requiredCaseDocuments } from '@/app/utils/case_documents';
import {
  COMMENT_ONGOING_STEP_METADATA_KEY,
  ONGOING_SERVICE_TYPE_METADATA_KEY,
  ONGOING_STEP_METADATA_KEY,
} from '@/app/utils/case_metadata';
import {
  buildWizardSteps,
  findStepComment,
  isDocumentSent,
  isStepDone,
  isUploadStep,
  missingForReport,
  REPORT_STEP,
  resolveCurrentStep,
  stepAttachments,
  TECHNICIAN_PHOTOS_STEP,
  WizardStep,
} from '@/app/utils/ongoing_wizard';
import { Radio, RadioGroup } from '@heroui/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState, useRef, useState } from 'react';
import { Accordion } from '../../common/accordion';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { ErrorMessage } from '../../common/error-message';
import type { FileUploaderGenericRef } from '../../common/file-uploader';
import { FormTitleWithTooltip } from '../../common/form-title-tooltip';
import { Stepper } from '../../common/stepper';
import TargetDateModal from '../target-date-modal';
import { OnGoingStatusForm } from './ongoing_case';
import { OngoingCommentBox } from './ongoing_comment_box';
import { WizardReportStep } from './ongoing_wizard_report_step';
import { WizardUploadStep } from './ongoing_wizard_upload_step';

interface OnGoingStatusFormV2Props {
  crmCase: CaseFull;
}

// Antes da visita não há o que documentar: o caso mostra o mesmo formulário
// de espera (comentários, adiantamento, troca de data) da versão original.
export function OnGoingStatusFormV2({ crmCase }: OnGoingStatusFormV2Props) {
  const isBeforeTargetDate = new Date() < new Date(crmCase.target_date!!);
  if (isBeforeTargetDate) {
    return <OnGoingStatusForm crmCase={crmCase} />;
  }

  return <OngoingWizard crmCase={crmCase} />;
}

function OngoingWizard({ crmCase }: OnGoingStatusFormV2Props) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useActionState(onSubmit, null);

  const comments = crmCase.comments;
  const category = parseCaseCategory(crmCase.metadata?.category);
  const [serviceType, setServiceType] = useState<CaseServiceType>(
    () =>
      parseCaseServiceType(
        crmCase.metadata?.[ONGOING_SERVICE_TYPE_METADATA_KEY]
      ) ?? CaseServiceType.REPAIR
  );
  const [savedStep, setSavedStep] = useState<string | undefined>(
    () => crmCase.metadata?.[ONGOING_STEP_METADATA_KEY]
  );
  const [busyStep, setBusyStep] = useState<string | null>(null);
  const [openTargetDateModal, setOpenTargetDateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const uploaderRefs = useRef<Record<string, FileUploaderGenericRef | null>>(
    {}
  );

  const requiredDocuments = requiredCaseDocuments(serviceType, category);
  const steps = buildWizardSteps(requiredDocuments);
  const currentStep = resolveCurrentStep(steps, savedStep);
  const uploadSteps = steps.filter(isUploadStep);

  function handleFailure(response: ServiceResponse<unknown>) {
    if (response.unauthorized) {
      signOut({ callbackUrl: '/login' });
    }
    showSnackbar(response.message, 'error');
  }

  // O progresso vai pro metadata do caso porque o atendimento leva dias e o
  // técnico precisa voltar na mesma etapa. Não bloqueia a navegação: é só a
  // posição no wizard, os dados de cada etapa já foram salvos ao enviar.
  function persistProgress(step: string, type: CaseServiceType) {
    updateCaseMetadata(crmCase.case_id, {
      [ONGOING_STEP_METADATA_KEY]: step,
      [ONGOING_SERVICE_TYPE_METADATA_KEY]: type,
    }).then((response) => {
      if (!response.success) {
        handleFailure(response);
      }
    });
  }

  function goToStep(step: string) {
    setErrorMessage('');
    setSavedStep(step);
    persistProgress(step, serviceType);
  }

  // O seletor só aparece na etapa de fotos, que existe para qualquer tipo —
  // trocar o tipo nunca tira o técnico da etapa em que ele está.
  function changeServiceType(type: CaseServiceType) {
    setServiceType(type);
    persistProgress(currentStep, type);
  }

  // Cada etapa guarda seus arquivos num único comentário (marcado no metadata
  // dele): o primeiro envio cria, os seguintes acrescentam. `saved` diz se algo
  // chegou a ser gravado — num lote acrescentado, uma falha no meio deixa os
  // anteriores salvos.
  async function saveToStepComment(
    step: WizardStep,
    attachments: Awaited<ReturnType<FileUploaderGenericRef['submit']>>
  ): Promise<{ response: ServiceResponse<unknown>; saved: boolean }> {
    const stepComment = findStepComment(comments, step.key);
    if (!stepComment) {
      const formData = new FormData();
      formData.append('content', step.title);
      // Resolution é o tipo que a seção "Detalhes" lê como envio do técnico.
      const response = await addComment(
        crmCase.case_id,
        formData,
        attachments,
        CommentType.RESOLUTION,
        { [COMMENT_ONGOING_STEP_METADATA_KEY]: step.key }
      );
      return { response, saved: response.success };
    }

    let saved = false;
    for (const attachment of attachments ?? []) {
      const response = await addAttachmentToComment(
        stepComment.comment_id,
        attachment
      );
      if (!response.success) {
        return { response, saved };
      }
      saved = true;
    }
    return {
      response: { success: true, message: 'arquivos adicionados com sucesso' },
      saved,
    };
  }

  async function handleUploadStep(step: WizardStep) {
    const uploader = uploaderRefs.current[step.key];
    if (!uploader || uploader.length === 0) {
      setErrorMessage('Selecione ao menos um arquivo antes de enviar.');
      return;
    }

    setErrorMessage('');
    setBusyStep(step.key);

    try {
      const { response, saved } = await saveToStepComment(
        step,
        await uploader.submit()
      );
      if (response.success) {
        showSnackbar(response.message, 'success');
      } else {
        handleFailure(response);
      }
      if (saved) {
        refresh();
      }
    } finally {
      setBusyStep(null);
    }
  }

  async function handleRemoveAttachment(
    step: WizardStep,
    attachment: Attachment
  ) {
    setErrorMessage('');
    setBusyStep(step.key);

    try {
      const response = await deleteAttachment(attachment.attachment_id);
      if (!response.success) {
        handleFailure(response);
        return;
      }

      showSnackbar('Arquivo removido', 'success');
      refresh();
    } finally {
      setBusyStep(null);
    }
  }

  // Única etapa que bloqueia: o laudo sai com o que já foi enviado nas etapas
  // anteriores, então tudo que o caso exige precisa estar lá.
  async function onSubmit(_currentState: unknown, formData: FormData) {
    const missing = missingForReport(comments, requiredDocuments);
    if (missing.length > 0) {
      setErrorMessage(
        `Antes de enviar para o laudo, falta enviar: ${missing
          .map((documentType) => attachmentDocumentTypeLabel[documentType])
          .join(', ')}.`
      );
      return;
    }

    setErrorMessage('');
    // Sem anexos: para casos v2 o backend monta o laudo com as fotos de todos
    // os envios do técnico. Reenviar criaria outra linha com a mesma key no
    // S3, e apagar a foto original quebraria o download do laudo.
    const response = await changeStatus(
      crmCase.case_id,
      CaseStatus.REPORT,
      formData
    );
    if (!response.success) {
      handleFailure(response);
      return;
    }

    showSnackbar(response.message, 'success');
    refresh();
  }

  return (
    <Card
      title={
        <FormTitleWithTooltip
          title="Caso em andamento"
          tooltip="As etapas podem ser feitas em qualquer ordem e revisitadas até o envio para o laudo. Cada envio fica salvo no caso na hora."
          titleSize="xl"
        />
      }
    >
      <div className="px-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Tempo decorrido:</p>
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

        <div className="mb-6">
          <Stepper
            ariaLabel="Etapas do atendimento"
            steps={steps.map((step) => ({
              key: step.key,
              label: step.title,
              done: isStepDone(comments, step),
            }))}
            currentKey={currentStep}
            onSelect={goToStep}
          />
        </div>

        {uploadSteps.map((step) => {
          const nextStep = steps[steps.indexOf(step) + 1];

          return (
            <WizardUploadStep
              key={step.key}
              step={step}
              hidden={step.key !== currentStep}
              header={
                step.key === TECHNICIAN_PHOTOS_STEP && (
                  <RadioGroup
                    label="Tipo de serviço"
                    value={serviceType}
                    onValueChange={(value) =>
                      changeServiceType(value as CaseServiceType)
                    }
                    className="mb-4"
                    orientation="horizontal"
                    size="sm"
                    description="Define quais documentos o caso exige nas próximas etapas."
                  >
                    <Radio value={CaseServiceType.REPAIR}>Reparo</Radio>
                    <Radio value={CaseServiceType.INSPECTION}>Vistoria</Radio>
                  </RadioGroup>
                )
              }
              posted={stepAttachments(comments, step)}
              isDocumentSent={(documentType: AttachmentDocumentType) =>
                isDocumentSent(comments, documentType)
              }
              uploaderRef={(instance) => {
                uploaderRefs.current[step.key] = instance;
              }}
              isUploading={busyStep === step.key}
              isBusy={busyStep !== null}
              onUpload={() => handleUploadStep(step)}
              onRemove={(attachment) =>
                handleRemoveAttachment(step, attachment)
              }
              onNext={nextStep && (() => goToStep(nextStep.key))}
            />
          );
        })}

        <WizardReportStep
          hidden={currentStep !== REPORT_STEP}
          checklist={uploadSteps.map((step) => ({
            key: step.key,
            title: step.title,
            done: isStepDone(comments, step),
          }))}
          serviceType={serviceType}
          action={dispatch}
        />

        {errorMessage && (
          <div className="mt-4">
            <ErrorMessage message={errorMessage} />
          </div>
        )}

        <Accordion
          className="mt-6 border-t border-gray-200 pt-4"
          summary={
            <span className="text-sm font-medium text-gray-700">
              Comentário / adiantamento
            </span>
          }
        >
          <OngoingCommentBox crmCase={crmCase} />
        </Accordion>
      </div>

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
