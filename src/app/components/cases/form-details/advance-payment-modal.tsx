'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { updateCaseMetadata } from '@/app/services/cases';
import { addComment } from '@/app/services/comments';
import { CreateAttachment } from '@/app/types/attachments';
import { CommentType } from '@/app/types/comment';
import { ADVANCE_REQUESTED_METADATA_KEY } from '@/app/utils/case_metadata';
import dynamic from 'next/dynamic';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
  useState,
} from 'react';
import { Button } from '../../common/button';
import { ErrorMessage } from '../../common/error-message';
import type {
  FileUploaderGenericRef,
  FileUploaderProps,
} from '../../common/file-uploader';
import Modal from '../../common/modal';

const GenericUploader = dynamic(
  () =>
    import('../../common/file-uploader').then((m) => ({
      default: m.GenericUploader,
    })),
  { ssr: false }
) as ForwardRefExoticComponent<
  FileUploaderProps & RefAttributes<FileUploaderGenericRef>
>;

const ADVANCE_PAYMENT_COMMENT_CONTENT =
  'Comprovante de pagamento do adiantamento anexado';

interface AdvancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export function AdvancePaymentModal({
  isOpen,
  onClose,
  caseId,
}: AdvancePaymentModalProps) {
  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();

  async function handleConfirm() {
    setLoading(true);
    setErrorMessage('');

    // Comprovante é opcional: o pagamento costuma ser dado como feito antes de
    // o comprovante existir, e travar aqui deixaria o caso marcado como
    // pendente de adiantamento sem necessidade.
    let attachments: CreateAttachment[] = [];
    await fileUploaderRef.current?.submit().then((response) => {
      attachments = response || [];
    });

    const formData = new FormData();
    formData.append('content', ADVANCE_PAYMENT_COMMENT_CONTENT);

    const commentResponse = await addComment(
      caseId,
      formData,
      attachments,
      CommentType.PAYMENT_PROOF
    );

    if (!commentResponse.success) {
      if (commentResponse.unauthorized) {
        signOut({ callbackUrl: '/login' });
      }
      setErrorMessage(commentResponse.message || '');
      setLoading(false);
      return;
    }

    const metadataResponse = await updateCaseMetadata(caseId, {
      [ADVANCE_REQUESTED_METADATA_KEY]: 'false',
    });

    if (!metadataResponse.success) {
      if (metadataResponse.unauthorized) {
        signOut({ callbackUrl: '/login' });
      }
      setErrorMessage(metadataResponse.message || '');
      setLoading(false);
      return;
    }

    showSnackbar('Pagamento do adiantamento registrado com sucesso', 'success');
    setLoading(false);
    onClose();
    refresh();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80">
        <h1 className="mx-1 mb-2 text-xl font-semibold">
          Registrar pagamento do adiantamento
        </h1>
        <p className="mx-1 mb-4 text-sm text-gray-600">
          Anexe o comprovante do pagamento, se já tiver. O caso deixará de
          aparecer como pendente de adiantamento.
        </p>

        <div className="mb-4">
          <GenericUploader ref={fileUploaderRef} minFiles={0} maxFiles={5} />
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} />}

        <div className="mt-4 flex justify-center space-x-4">
          <Button
            type="button"
            color="success"
            scheme="quiet"
            isLoading={loading}
            onClick={handleConfirm}
            className="w-28 justify-center"
          >
            Confirmar
          </Button>
          <Button
            type="button"
            color="error"
            scheme="loud"
            onClick={onClose}
            disabled={loading}
            className="w-28 justify-center"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
