import { Attachment, AttachmentDocumentType } from '@/app/types/attachments';
import { Comment, CommentType } from '@/app/types/comment';
import { CaseCategory, CaseServiceType } from '@/app/types/case';
import {
  partnerAttachmentsByType,
  requiredCaseDocuments,
} from '../case_documents';

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

describe('partnerAttachmentsByType', () => {
  const attachment = (id: string, document_type?: AttachmentDocumentType) =>
    ({ attachment_id: id, document_type }) as Attachment;

  const comments = [
    {
      comment_type: CommentType.RESOLUTION,
      attachments: [
        attachment('photo-1', AttachmentDocumentType.PHOTO),
        attachment('os-1', SERVICE_ORDER),
        attachment('legacy-1'),
      ],
    },
    {
      comment_type: CommentType.COMMENT,
      attachments: [attachment('comment-os', SERVICE_ORDER)],
    },
    { comment_type: CommentType.RESOLUTION },
  ] as Comment[];

  it('returns only what the technician sent, of the requested type', () => {
    expect(
      partnerAttachmentsByType(comments, SERVICE_ORDER).map(
        (a) => a.attachment_id
      )
    ).toEqual(['os-1']);
  });

  it('counts attachments sent before document_type existed as photos', () => {
    expect(
      partnerAttachmentsByType(comments, AttachmentDocumentType.PHOTO).map(
        (a) => a.attachment_id
      )
    ).toEqual(['photo-1', 'legacy-1']);
  });

  it('handles a case without comments', () => {
    expect(partnerAttachmentsByType(undefined, WARRANTY_TERM)).toEqual([]);
  });
});
