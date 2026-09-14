import { useSnackbar } from '@/app/context/SnackbarProvider';
import { changeStatus } from '@/app/services/cases';
import { getCaseComments, updateCommentContent } from '@/app/services/comments';
import { Attachment } from '@/app/types/attachments';
import { CaseStatus } from '@/app/types/case';
import { CommentType } from '@/app/types/comment';
import { roboto } from '@/app/ui/fonts';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../common/button';
import { ErrorMessage } from '../common/error-message';
import Modal from '../common/modal';
import { PaymentAttachmentUploader } from './payment-attachment-uploader';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
}

export function ConfirmPaymentModal({
  isOpen,
  onClose,
  caseId,
}: ConfirmPaymentModalProps) {
  const [_, dispatch] = useActionState(onSubmit, null);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [commentId, setCommentId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    getCaseComments(caseId).then((response) => {
      const paymentProofComment = response.data?.find(
        (comment) => comment.comment_type === CommentType.PAYMENT_PROOF
      );

      setErrorMessage('');
      setCommentId(paymentProofComment?.comment_id || null);
      setAttachments(paymentProofComment?.attachments || []);
    });
  }, [isOpen, caseId]);

  async function onSubmit(_: unknown, formData: FormData) {
    if (attachments.length === 0) {
      setErrorMessage('Por favor, adicione pelo menos um arquivo');
      return;
    }

    changeStatus(caseId, CaseStatus.CLOSED, formData)
      .then((response) => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
          }
          showSnackbar(response.message, 'error');
          return;
        }

        if (commentId) {
          updateCommentContent(
            commentId,
            `pagamento realizado no dia ${new Date().toLocaleDateString()}`
          ).then((updateResponse) => {
            if (!updateResponse.success) {
              showSnackbar(
                `Caso encerrado, mas não foi possível atualizar a data no comentário: ${updateResponse.message}`,
                'error'
              );
            }
          });
        }

        showSnackbar(response.message, 'success');
        refresh();
        onClose();
      })
      .catch((ex) => {
        showSnackbar(ex, 'error');
      });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <h1 className={`${roboto.className} mx-5 my-5 text-xl`}>
          Deseja confirmar o pagamento do caso?
        </h1>

        <div className="mb-4 flex flex-col items-center">
          <label className="mb-2">
            Adicione o(s) comprovante(s) do pagamento
          </label>
          <PaymentAttachmentUploader
            caseId={caseId}
            commentId={commentId}
            attachments={attachments}
            maxFiles={10}
            onCommentCreated={setCommentId}
            onAttachmentAdded={(attachment) =>
              setAttachments((current) => [...current, attachment])
            }
            onAttachmentRemoved={(attachmentId) =>
              setAttachments((current) =>
                current.filter((a) => a.attachment_id !== attachmentId)
              )
            }
            onError={(message) => showSnackbar(message, 'error')}
          />
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} />}

        <div className="flex justify-center space-x-8">
          <Button
            type="submit"
            className="min-w-24 place-content-center"
            aria-disabled={pending}
            isLoading={pending}
          >
            Sim
          </Button>
          <Button
            onClick={onClose}
            className="min-w-24 place-content-center"
            aria-disabled={pending}
            isLoading={pending}
          >
            Não
          </Button>
        </div>
      </form>
    </Modal>
  );
}
