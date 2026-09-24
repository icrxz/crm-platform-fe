import { AttachmentDocumentType } from '../types/attachments';
import { CaseCategory, CaseServiceType } from '../types/case';

const { SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM } =
  AttachmentDocumentType;

// Papelada que o técnico tem de anexar no envio para laudo. Vistoria fecha só
// com a OS assinada; reparo exige a validação da cliente, e D+ ainda soma o
// termo de garantia.
const REPAIR_REQUIRED_DOCUMENTS: Record<
  CaseCategory,
  AttachmentDocumentType[]
> = {
  [CaseCategory.FURNITURE]: [SERVICE_ORDER, CUSTOMER_CONFIRMATION],
  [CaseCategory.D_PLUS]: [SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM],
};

// Sem categoria não dá pra saber se o termo de garantia entra, então fica o
// conjunto comum às duas — pedir a mais bloquearia um caso legítimo de móveis.
const REPAIR_FALLBACK_DOCUMENTS = [SERVICE_ORDER, CUSTOMER_CONFIRMATION];

export function requiredCaseDocuments(
  serviceType?: CaseServiceType,
  category?: CaseCategory
): AttachmentDocumentType[] {
  if (serviceType === CaseServiceType.INSPECTION) {
    return [SERVICE_ORDER];
  }

  if (serviceType === CaseServiceType.REPAIR) {
    return category
      ? REPAIR_REQUIRED_DOCUMENTS[category]
      : REPAIR_FALLBACK_DOCUMENTS;
  }

  return [];
}
