'use client';
import { addAttachmentToComment, addComment } from '@/app/services/comments';
import {
  deleteAttachment,
  uploadAttachments,
} from '@/app/services/attachments';
import { Attachment } from '@/app/types/attachments';
import { CommentType } from '@/app/types/comment';
import Uppy, { type UppyFile } from '@uppy/core';
import Portuguese from '@uppy/locales/lib/pt_BR';
import { FileInput } from '@uppy/react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../common/badge';

const PAYMENT_PROOF_CONTENT = 'comprovante(s) de pagamento anexado(s)';

interface PaymentAttachmentUploaderProps {
  caseId: string;
  commentId: string | null;
  attachments: Attachment[];
  maxFiles?: number;
  onCommentCreated: (commentId: string) => void;
  onAttachmentAdded: (attachment: Attachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
  onError: (message: string) => void;
}

export function PaymentAttachmentUploader({
  caseId,
  commentId,
  attachments,
  maxFiles,
  onCommentCreated,
  onAttachmentAdded,
  onAttachmentRemoved,
  onError,
}: PaymentAttachmentUploaderProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const commentIdRef = useRef(commentId);
  const queueRef = useRef(Promise.resolve());

  useEffect(() => {
    commentIdRef.current = commentId;
  }, [commentId]);

  const [uppy] = useState(
    () =>
      new Uppy({
        id: 'paymentAttachmentUploader',
        autoProceed: false,
        restrictions: {
          maxNumberOfFiles: maxFiles,
          allowedFileTypes: ['image/*'],
        },
        locale: Portuguese,
      })
  );

  useEffect(() => {
    async function persist(
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ) {
      const formData = new FormData();
      formData.append('attachments', file.data as File);

      const uploaded = await uploadAttachments(formData);
      const createAttachment = uploaded?.[0];
      if (!createAttachment) {
        onError('falha ao enviar arquivo');
        return;
      }

      if (!commentIdRef.current) {
        const commentFormData = new FormData();
        commentFormData.set('content', PAYMENT_PROOF_CONTENT);

        const response = await addComment(
          caseId,
          commentFormData,
          [createAttachment],
          CommentType.PAYMENT_PROOF
        );

        if (!response.success || !response.data) {
          onError(response.message);
          return;
        }

        commentIdRef.current = response.data.comment_id;
        onCommentCreated(response.data.comment_id);

        const savedAttachment = response.data.attachments?.[0];
        if (savedAttachment) {
          onAttachmentAdded(savedAttachment);
        }
        return;
      }

      const response = await addAttachmentToComment(
        commentIdRef.current,
        createAttachment
      );

      if (!response.success || !response.data) {
        onError(response.message);
        return;
      }

      onAttachmentAdded(response.data);
    }

    function handleFileAdded(
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ) {
      setPendingCount((count) => count + 1);

      queueRef.current = queueRef.current
        .then(() => persist(file))
        .finally(() => {
          uppy.removeFile(file.id);
          setPendingCount((count) => count - 1);
        });
    }

    uppy.on('file-added', handleFileAdded);
    return () => {
      uppy.off('file-added', handleFileAdded);
    };
  }, [uppy, caseId, onCommentCreated, onAttachmentAdded, onError]);

  async function handleRemove(attachmentId: string) {
    setRemovingIds((ids) => [...ids, attachmentId]);

    const response = await deleteAttachment(attachmentId);

    setRemovingIds((ids) => ids.filter((id) => id !== attachmentId));

    if (!response.success) {
      onError(response.message);
      return;
    }

    onAttachmentRemoved(attachmentId);
  }

  return (
    <div>
      <FileInput uppy={uppy} pretty inputName="attachments" id="attachments" />

      <div className="-mt-1 flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <Badge
            key={attachment.attachment_id}
            content={attachment.file_name}
            isClosable={!removingIds.includes(attachment.attachment_id)}
            onClose={() => handleRemove(attachment.attachment_id)}
          />
        ))}
        {pendingCount > 0 && <Badge content={`enviando ${pendingCount}...`} />}
      </div>
    </div>
  );
}
