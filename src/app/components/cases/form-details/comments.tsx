'use client';
import { parseDateTime } from '@/app/libs/date';
import { CaseFull } from '@/app/types/case';
import {
  AttachmentDocumentType,
  parseAttachmentDocumentType,
} from '@/app/types/attachments';
import { CommentType } from '@/app/types/comment';
import { UserRole } from '@/app/types/user';
import { adminRoles } from '@/app/utils/roles';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Accordion } from '../../common/accordion';
import { CardText } from '../../common/card/card-text';
import { ImageCarousel } from '../../common/image-carousel';
import { EditCommentModal } from './edit-comment-modal';

interface CommentDetailsProps {
  crmCase: CaseFull;
  userRole: UserRole;
}

export function CommentDetails({ crmCase, userRole }: CommentDetailsProps) {
  const isAdminRole = adminRoles.includes(userRole);
  const [editingCommentID, setEditingCommentID] = useState<string | null>(null);

  const editingComment = crmCase.comments?.find(
    (comment) => comment.comment_id === editingCommentID
  );

  // Só os comentários livres. Os que o backend cria na troca de status são
  // marcos do caso e aparecem em "Detalhes" (case-moments.tsx).
  const sortedComments = (crmCase.comments ?? [])
    .filter((comment) => comment.comment_type === CommentType.COMMENT)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return (
    <div className="h-fill w-full">
      <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
        <Accordion
          className="p-2"
          summary={
            <p className="ml-2 text-xl font-semibold">
              Comentários ({sortedComments.length})
            </p>
          }
        >
          <div className="mx-4">
            {sortedComments.length === 0 && (
              <p className="text-sm font-medium text-gray-500">
                Nenhum comentário registrado.
              </p>
            )}

            {sortedComments.map((comment) => {
              const wasEdited = comment.updated_at !== comment.created_at;
              // Anexo marcado como documento é promovido para "Detalhes"; aqui
              // ele só duplicaria a mesma imagem na página.
              const photos = (comment.attachments ?? []).filter(
                (attachment) =>
                  parseAttachmentDocumentType(attachment.document_type) ===
                  AttachmentDocumentType.PHOTO
              );

              return (
                <div
                  key={comment.comment_id}
                  className="ml-2 mt-4 rounded-xl bg-white px-3 py-2"
                >
                  <div className="mt-2 items-center gap-8">
                    <div className="flex flex-wrap items-center gap-4">
                      <CardText
                        title="Data de criação:"
                        text={parseDateTime(comment.created_at)}
                      />
                      <CardText title="Criado por:" text={comment.created_by} />
                      {wasEdited && (
                        <span className="text-xs italic text-gray-400">
                          (editado)
                        </span>
                      )}
                      {isAdminRole && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingCommentID(comment.comment_id)
                          }
                          className="text-gray-400 hover:text-gray-700"
                          title="Editar comentário"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <CardText
                      title="Comentário:"
                      text={comment.content}
                      shouldCopy
                    />
                  </div>

                  {photos.length > 0 && (
                    <div className="mt-2">
                      <ImageCarousel
                        images={photos.map((attachment) => ({
                          id: attachment.attachment_id,
                          src: attachment.url,
                          alt: attachment.file_name,
                        }))}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Accordion>
      </div>

      {editingComment && (
        <EditCommentModal
          isOpen
          onClose={() => setEditingCommentID(null)}
          comment={editingComment}
        />
      )}
    </div>
  );
}
