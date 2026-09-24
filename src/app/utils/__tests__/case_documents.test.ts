import { AttachmentDocumentType } from '@/app/types/attachments';
import { CaseCategory, CaseServiceType } from '@/app/types/case';
import { requiredCaseDocuments } from '../case_documents';

const { SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM } =
  AttachmentDocumentType;

describe('requiredCaseDocuments', () => {
  it('asks only for the signed service order on an inspection, whatever the category', () => {
    expect(
      requiredCaseDocuments(CaseServiceType.INSPECTION, CaseCategory.D_PLUS)
    ).toEqual([SERVICE_ORDER]);
  });

  it('asks for the service order and the customer confirmation on a furniture repair', () => {
    expect(
      requiredCaseDocuments(CaseServiceType.REPAIR, CaseCategory.FURNITURE)
    ).toEqual([SERVICE_ORDER, CUSTOMER_CONFIRMATION]);
  });

  it('adds the warranty term on a D+ repair', () => {
    expect(
      requiredCaseDocuments(CaseServiceType.REPAIR, CaseCategory.D_PLUS)
    ).toEqual([SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM]);
  });

  // Sem categoria o termo de garantia ficaria cobrado de um caso de móveis, que
  // não o exige — então fica o conjunto comum às duas categorias.
  it('falls back to the documents both categories share when the category is unknown', () => {
    expect(requiredCaseDocuments(CaseServiceType.REPAIR)).toEqual([
      SERVICE_ORDER,
      CUSTOMER_CONFIRMATION,
    ]);
  });

  // 'insurance' é o tipo com que o caso nasce: o técnico ainda não disse se é
  // reparo ou vistoria, então não há papelada a cobrar.
  it('asks for nothing while the service type is still undefined', () => {
    expect(requiredCaseDocuments(undefined, CaseCategory.D_PLUS)).toEqual([]);
  });
});
