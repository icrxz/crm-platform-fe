'use client';
import { parseDateTime } from '@/app/libs/date';
import { CaseFull } from '@/app/types/case';
import { UserRole } from '@/app/types/user';
import { adminRoles } from '@/app/utils/roles';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Card } from '../../common/card';
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

  return (
    <div className="h-fill w-full">
      <Card title="Detalhes" titleSize="xl">
        <div className="mx-4">
          <div className="items-center space-y-4">
            <p className="text-sm font-medium text-gray-900">
              {crmCase.subject}
            </p>
          </div>

          {crmCase.comments && (
            <div className="mt-4">
              <h2 className={`text-m font-semibold`}>Comentários</h2>

              {crmCase.comments.map((comment) => {
                const wasEdited = comment.updated_at !== comment.created_at;

                return (
                  <div
                    key={comment.comment_id}
                    className="ml-2 mt-4 rounded-xl bg-white px-3 py-2"
                  >
                    <div className="mt-2 items-center gap-8">
                      <div className="flex items-center gap-4">
                        <CardText
                          title="Data de criação:"
                          text={parseDateTime(comment.created_at)}
                        />
                        <CardText
                          title="Criado por:"
                          text={comment.created_by}
                        />
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

                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        <ImageCarousel
                          images={comment.attachments.map((attachment) => ({
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
          )}
        </div>
      </Card>

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
