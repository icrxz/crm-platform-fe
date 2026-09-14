'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { deleteAttachment } from '@/app/services/attachments';
import {
  addAttachmentToComment,
  updateCommentContent,
} from '@/app/services/comments';
import { Attachment } from '@/app/types/attachments';
import { Comment } from '@/app/types/comment';
import { TrashIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
  useState,
} from 'react';
import { Button } from '../../common/button';
import Modal from '../../common/modal';
import type {
  FileUploaderGenericRef,
  FileUploaderProps,
} from '../../common/file-uploader';

const GenericUploader = dynamic(
  () =>
    import('../../common/file-uploader').then((m) => ({
      default: m.GenericUploader,
    })),
  { ssr: false }
) as ForwardRefExoticComponent<
  FileUploaderProps & RefAttributes<FileUploaderGenericRef>
>;

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
}

export function EditCommentModal({
  isOpen,
  onClose,
  comment,
}: EditCommentModalProps) {
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);

  const [content, setContent] = useState(comment.content);
  const [attachments, setAttachments] = useState<Attachment[]>(
    comment.attachments || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [removingID, setRemovingID] = useState<string | null>(null);

  async function handleRemoveAttachment(attachmentID: string) {
    setRemovingID(attachmentID);

    const response = await deleteAttachment(attachmentID);

    setRemovingID(null);

    if (!response.success) {
      if (response.unauthorized) {
        signOut({ callbackUrl: '/login' });
        return;
      }
      showSnackbar(response.message, 'error');
      return;
    }

    setAttachments((current) =>
      current.filter((attachment) => attachment.attachment_id !== attachmentID)
    );
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      if (content !== comment.content) {
        const response = await updateCommentContent(
          comment.comment_id,
          content
        );
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
            return;
          }
          showSnackbar(response.message, 'error');
          return;
        }
      }

      const newAttachments = (await fileUploaderRef.current?.submit()) || [];

      for (const attachment of newAttachments) {
        const response = await addAttachmentToComment(
          comment.comment_id,
          attachment
        );
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
            return;
          }
          showSnackbar(response.message, 'error');
          return;
        }
      }

      showSnackbar('comentário atualizado com sucesso', 'success');
      refresh();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Editar comentário
        </h2>

        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        {attachments.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.attachment_id}
                className="relative rounded-lg bg-gray-100 p-1"
              >
                <Image
                  src={attachment.url}
                  alt={attachment.file_name}
                  width={120}
                  height={120}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  aria-label="Remover anexo"
                  disabled={removingID === attachment.attachment_id}
                  onClick={() =>
                    handleRemoveAttachment(attachment.attachment_id)
                  }
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <GenericUploader ref={fileUploaderRef} maxFiles={20} />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" color="warning" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="md"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
