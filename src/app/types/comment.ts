import { Attachment, CreateAttachment } from './attachments';

export type CreateComment = {
  case_id: string;
  content: string;
  comment_type: CommentType;
  created_by: string;
  attachments?: CreateAttachment[];
  metadata?: Record<string, string>;
};

export type Comment = {
  comment_id: string;
  case_id: string;
  content: string;
  comment_type: CommentType;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  attachments?: Attachment[];
  metadata?: Record<string, string>;
};

export enum CommentType {
  CONTENT = 'Content',
  COMMENT = 'Comment',
  RESOLUTION = 'Resolution',
  REPORT = 'Report',
  REJECTION = 'Rejection',
  PAYMENT_PROOF = 'PaymentProof',
}

// Etapa/ação do caso que originou o comentário, derivada do comment_type
// atribuído pelo backend em case_actions_service.go (createChangeStatusComment).
// Usado só pela seção de detalhes antiga (comments_v1.tsx).
export const commentTypeStageLabel: Record<CommentType, string> = {
  [CommentType.CONTENT]: 'Detalhes do caso',
  [CommentType.COMMENT]: 'Comentário',
  [CommentType.RESOLUTION]: 'Envio para laudo',
  [CommentType.REPORT]: 'Conclusão do laudo',
  [CommentType.REJECTION]: 'Reprovação',
  [CommentType.PAYMENT_PROOF]: 'Comprovante de pagamento',
};
