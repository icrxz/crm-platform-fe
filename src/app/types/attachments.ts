// Anexos são enviados em lote dentro de um comentário, então o tipo do
// comentário só diz em que etapa o arquivo entrou — não o que ele é. O técnico
// sobe fotos do produto e a papelada assinada no mesmo envio, e a seção de
// detalhes do caso precisa separar as duas coisas, daí o document_type por
// arquivo. Tudo que foi enviado antes deste campo existir é PHOTO.
export enum AttachmentDocumentType {
  PHOTO = 'photo',
  SERVICE_ORDER = 'service_order',
  CUSTOMER_CONFIRMATION = 'customer_confirmation',
  WARRANTY_TERM = 'warranty_term',
}

export const attachmentDocumentTypeLabel: Record<
  AttachmentDocumentType,
  string
> = {
  [AttachmentDocumentType.PHOTO]: 'Foto',
  [AttachmentDocumentType.SERVICE_ORDER]: 'Ordem de Serviço assinada',
  [AttachmentDocumentType.CUSTOMER_CONFIRMATION]:
    'Confirmação/validação da cliente',
  [AttachmentDocumentType.WARRANTY_TERM]: 'Termo de garantia',
};

export function parseAttachmentDocumentType(
  value?: string
): AttachmentDocumentType {
  return (Object.values(AttachmentDocumentType) as string[]).includes(
    value ?? ''
  )
    ? (value as AttachmentDocumentType)
    : AttachmentDocumentType.PHOTO;
}

export interface CreateAttachment {
  url: string;
  file_name: string;
  file_extension: string;
  size: number;
  key: string;
  created_by: string;
  document_type?: AttachmentDocumentType;
}

export interface Attachment {
  attachment_id: string;
  url: string;
  file_name: string;
  file_extension: string;
  size: number;
  key: string;
  created_by: string;
  created_at: string;
  document_type?: AttachmentDocumentType;
}
