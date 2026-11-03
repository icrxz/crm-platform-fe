'use client';
import { parseDateTime } from '@/app/libs/date';
import {
  AttachmentDocumentType,
  attachmentDocumentTypeLabel,
  parseAttachmentDocumentType,
} from '@/app/types/attachments';
import {
  CaseFull,
  parseCaseCategory,
  parseCaseServiceType,
} from '@/app/types/case';
import { Comment, CommentType } from '@/app/types/comment';
import { UserRole } from '@/app/types/user';
import { requiredCaseDocuments } from '@/app/utils/case_documents';
import {
  ADVANCE_REQUESTED_METADATA_KEY,
  ADVANCE_REQUESTED_METADATA_VALUE,
} from '@/app/utils/case_metadata';
import { adminRoles } from '@/app/utils/roles';
import { useState } from 'react';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { CardText } from '../../common/card/card-text';
import { CarouselImage, ImageCarousel } from '../../common/image-carousel';
import { AdvancePaymentModal } from './advance-payment-modal';

interface CaseMomentsProps {
  crmCase: CaseFull;
  userRole: UserRole;
}

interface CaseMoment {
  key: string;
  title: string;
  hint?: string;
  comment?: Comment;
  images: CarouselImage[];
  /** Documento que o caso exige e que ainda não foi anexado. */
  pending?: boolean;
}

function byCreatedAtAsc(a: Comment, b: Comment): number {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function toCarouselImages(
  comments: Comment[],
  documentType: AttachmentDocumentType
) {
  return comments.flatMap((comment) =>
    (comment.attachments ?? [])
      .filter(
        (attachment) =>
          parseAttachmentDocumentType(attachment.document_type) === documentType
      )
      .map((attachment) => ({
        id: attachment.attachment_id,
        src: attachment.url,
        alt: attachment.file_name,
      }))
  );
}

// Ordem canônica da papelada. Um documento entra na seção por estar marcado
// como tal, não pela etapa: o técnico costuma subir a Ordem de Serviço ainda
// "Em andamento", via "Adicionar comentário", muito antes do envio para laudo.
const DOCUMENT_ORDER = [
  AttachmentDocumentType.SERVICE_ORDER,
  AttachmentDocumentType.CUSTOMER_CONFIRMATION,
  AttachmentDocumentType.WARRANTY_TERM,
];

// Monta os marcos na ordem em que o caso acontece. As fotos do cliente e do
// técnico vêm de etapas diferentes (Content x Resolution); a papelada sai de
// qualquer comentário, separada pelo document_type de cada anexo. Cada anexo
// aparece em exatamente um bloco: os blocos de foto filtram por PHOTO, e o
// resto cai no bloco do seu documento.
export function buildCaseMoments(crmCase: CaseFull): CaseMoment[] {
  const comments = (crmCase.comments ?? []).slice().sort(byCreatedAtAsc);
  const ofType = (commentType: CommentType) =>
    comments.filter((comment) => comment.comment_type === commentType);

  const customerComments = ofType(CommentType.CONTENT);
  const partnerComments = ofType(CommentType.RESOLUTION);

  const moments: CaseMoment[] = [
    {
      key: 'customer-photos',
      title: 'Fotos Fornecidas pelo Cliente',
      comment: customerComments.at(-1),
      images: toCarouselImages(customerComments, AttachmentDocumentType.PHOTO),
      pending: customerComments.length === 0,
    },
    {
      key: 'partner-photos',
      title: 'Fotos Fornecidas pelo Técnico',
      hint: 'São estas as fotos enviadas para o Laudo.',
      comment: partnerComments.at(-1),
      images: toCarouselImages(partnerComments, AttachmentDocumentType.PHOTO),
      pending: partnerComments.length === 0,
    },
  ];

  // Enquanto o caso está em andamento crmCase.type ainda é o tipo de abertura,
  // então não há papelada exigida — mas o que já chegou tem de aparecer.
  const requiredDocuments = requiredCaseDocuments(
    parseCaseServiceType(crmCase.type),
    parseCaseCategory(crmCase.metadata?.category)
  );

  DOCUMENT_ORDER.forEach((documentType) => {
    const images = toCarouselImages(comments, documentType);
    const isRequired = requiredDocuments.includes(documentType);

    if (!isRequired && images.length === 0) {
      return;
    }

    moments.push({
      key: documentType,
      title: attachmentDocumentTypeLabel[documentType],
      images,
      pending: images.length === 0,
    });
  });

  const closingTypes: [CommentType, string][] = [
    [CommentType.REPORT, 'Conclusão do laudo'],
    [CommentType.REJECTION, 'Reprovação'],
    [CommentType.PAYMENT_PROOF, 'Comprovante de pagamento'],
  ];

  closingTypes.forEach(([commentType, title]) => {
    ofType(commentType).forEach((comment) => {
      moments.push({
        key: comment.comment_id,
        title,
        comment,
        images: toCarouselImages([comment], AttachmentDocumentType.PHOTO),
      });
    });
  });

  return moments;
}

function MomentBlock({ moment }: { moment: CaseMoment }) {
  return (
    <div className="ml-2 mt-4 rounded-xl bg-white px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-4">
        <h3 className="text-sm font-semibold text-gray-900">{moment.title}</h3>
        {moment.pending && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Não enviado
          </span>
        )}
      </div>

      {moment.hint && (
        <p className="mt-1 text-xs text-gray-500">{moment.hint}</p>
      )}

      {moment.comment && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4">
          <CardText
            title="Data:"
            text={parseDateTime(moment.comment.created_at)}
          />
          <CardText title="Por:" text={moment.comment.created_by} />
        </div>
      )}

      {moment.comment?.content && (
        <div className="mt-1">
          <CardText
            title="Descrição:"
            text={moment.comment.content}
            shouldCopy
          />
        </div>
      )}

      {moment.images.length > 0 && (
        <div className="mt-2">
          <ImageCarousel images={moment.images} />
        </div>
      )}
    </div>
  );
}

export function CaseMoments({ crmCase, userRole }: CaseMomentsProps) {
  const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);

  const isAdminRole = adminRoles.includes(userRole);
  const advanceRequested =
    crmCase.metadata?.[ADVANCE_REQUESTED_METADATA_KEY] ===
    ADVANCE_REQUESTED_METADATA_VALUE;

  const moments = buildCaseMoments(crmCase);

  return (
    <div className="h-fill w-full">
      <Card title="Detalhes" titleSize="xl">
        <div className="mx-4">
          <div className="items-center space-y-4">
            <p className="text-sm font-medium text-gray-900">
              {crmCase.subject}
            </p>
          </div>

          {advanceRequested && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-base font-semibold text-amber-700">
                Adiantamento pendente
              </span>
              {isAdminRole && (
                <Button
                  type="button"
                  size="sm"
                  color="warning"
                  scheme="quiet"
                  onClick={() => setShowAdvancePaymentModal(true)}
                >
                  Marcar pagamento
                </Button>
              )}
            </div>
          )}

          {moments.map((moment) => (
            <MomentBlock key={moment.key} moment={moment} />
          ))}
        </div>
      </Card>

      {showAdvancePaymentModal && (
        <AdvancePaymentModal
          isOpen={showAdvancePaymentModal}
          onClose={() => setShowAdvancePaymentModal(false)}
          caseId={crmCase.case_id}
        />
      )}
    </div>
  );
}
