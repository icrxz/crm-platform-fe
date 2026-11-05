import { Attachment, AttachmentDocumentType } from '../types/attachments';
import { CaseFull } from '../types/case';
import { Comment, CommentType } from '../types/comment';
import { partnerAttachmentsByType } from './case_documents';
import {
  COMMENT_ONGOING_STEP_METADATA_KEY,
  ONGOING_FLOW_VERSION_METADATA_KEY,
  ONGOING_FLOW_VERSION_V2_VALUE,
} from './case_metadata';

const { PHOTO, SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM } =
  AttachmentDocumentType;

/**
 * O caso foi marcado para o fluxo v2 ao entrar em andamento com
 * ONGOING_WIZARD_V2_ENABLED ligada. Decide tanto o formulário de andamento
 * quanto a seção de detalhes, para casos antigos seguirem iguais.
 */
export function isOngoingFlowV2(crmCase: Pick<CaseFull, 'metadata'>): boolean {
  return (
    crmCase.metadata?.[ONGOING_FLOW_VERSION_METADATA_KEY] ===
    ONGOING_FLOW_VERSION_V2_VALUE
  );
}

export const TECHNICIAN_PHOTOS_STEP = 'technician_photos';
export const REPORT_STEP = 'report';

export interface WizardStep {
  key: string;
  title: string;
  /** Documentos que a etapa recebe; vazio na etapa final. */
  documentTypes: AttachmentDocumentType[];
}

// Etapas de papelada, na ordem do atendimento. O termo de garantia (só D+)
// é assinado junto com a confirmação da cliente, então divide a etapa com ela
// em vez de ganhar uma própria.
const DOCUMENT_STEPS: WizardStep[] = [
  {
    key: 'service_order',
    title: 'Ordem de serviço',
    documentTypes: [SERVICE_ORDER],
  },
  {
    key: 'customer_confirmation',
    title: 'Confirmação do cliente',
    documentTypes: [CUSTOMER_CONFIRMATION, WARRANTY_TERM],
  },
];

export function buildWizardSteps(
  requiredDocuments: AttachmentDocumentType[]
): WizardStep[] {
  const documentSteps = DOCUMENT_STEPS.map((step) => ({
    ...step,
    documentTypes: step.documentTypes.filter((documentType) =>
      requiredDocuments.includes(documentType)
    ),
  })).filter((step) => step.documentTypes.length > 0);

  return [
    {
      key: TECHNICIAN_PHOTOS_STEP,
      title: 'Fotos do técnico',
      documentTypes: [PHOTO],
    },
    ...documentSteps,
    { key: REPORT_STEP, title: 'Envio para o laudo', documentTypes: [] },
  ];
}

// Uma etapa salva pode não existir para o tipo de serviço salvo (ex:
// confirmação da cliente numa vistoria) — aí volta para a primeira.
export function resolveCurrentStep(
  steps: WizardStep[],
  savedStep: string | undefined
): string {
  return steps.some((step) => step.key === savedStep)
    ? savedStep!
    : TECHNICIAN_PHOTOS_STEP;
}

export function isUploadStep(step: WizardStep): boolean {
  return step.documentTypes.length > 0;
}

export function stepAttachments(
  comments: Comment[] | undefined,
  step: WizardStep
): Attachment[] {
  return step.documentTypes.flatMap((documentType) =>
    partnerAttachmentsByType(comments, documentType)
  );
}

export function isDocumentSent(
  comments: Comment[] | undefined,
  documentType: AttachmentDocumentType
): boolean {
  return partnerAttachmentsByType(comments, documentType).length > 0;
}

export function isStepDone(
  comments: Comment[] | undefined,
  step: WizardStep
): boolean {
  return (
    isUploadStep(step) &&
    step.documentTypes.every((documentType) =>
      isDocumentSent(comments, documentType)
    )
  );
}

/** O que ainda falta para o caso poder ir para o laudo. */
export function missingForReport(
  comments: Comment[] | undefined,
  requiredDocuments: AttachmentDocumentType[]
): AttachmentDocumentType[] {
  return [PHOTO, ...requiredDocuments].filter(
    (documentType) => !isDocumentSent(comments, documentType)
  );
}

/** Comentário onde a etapa já guardou seus arquivos, se houver. */
export function findStepComment(
  comments: Comment[] | undefined,
  stepKey: string
): Comment | undefined {
  return (comments ?? []).findLast(
    (comment) =>
      comment.comment_type === CommentType.RESOLUTION &&
      comment.metadata?.[COMMENT_ONGOING_STEP_METADATA_KEY] === stepKey
  );
}
