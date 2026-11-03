'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { updateCaseMetadata } from '@/app/services/cases';
import { addComment } from '@/app/services/comments';
import { CaseFull } from '@/app/types/case';
import { ServiceResponse } from '@/app/types/service';
import {
  ADVANCE_REQUESTED_METADATA_KEY,
  ADVANCE_REQUESTED_METADATA_VALUE,
} from '@/app/utils/case_metadata';
import { signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
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

const GenericUploader = dynamic(
  () =>
    import('../../common/file-uploader').then((m) => ({
      default: m.GenericUploader,
    })),
  { ssr: false }
) as ForwardRefExoticComponent<
  FileUploaderProps & RefAttributes<FileUploaderGenericRef>
>;

interface OngoingCommentBoxProps {
  crmCase: CaseFull;
}

// Comentários avulsos e pedidos de adiantamento ficam fora das etapas do
// wizard: o técnico registra isso a qualquer momento do atendimento. Os anexos
// daqui ficam só no comentário — o laudo usa o que foi enviado nas etapas.
export function OngoingCommentBox({ crmCase }: OngoingCommentBoxProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();

  const uploaderRef = useRef<FileUploaderGenericRef>(null);
  const [content, setContent] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingAdvance, setLoadingAdvance] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleFailure(response: ServiceResponse<unknown>) {
    if (response.unauthorized) {
      signOut({ callbackUrl: '/login' });
    }
    showSnackbar(response.message, 'error');
  }

  async function handleAddComment() {
    if (!content.trim()) {
      setErrorMessage('Escreva o comentário antes de enviar.');
      return;
    }

    setErrorMessage('');
    setLoadingComment(true);

    const formData = new FormData();
    formData.append('content', content);

    try {
      const attachments = (await uploaderRef.current?.submit()) ?? [];
      const response = await addComment(crmCase.case_id, formData, attachments);
      if (!response.success) {
        handleFailure(response);
        return;
      }

      showSnackbar(response.message, 'success');
      setContent('');
      refresh();
    } finally {
      setLoadingComment(false);
    }
  }

  // Cada solicitação vira um comentário próprio com o que o técnico escreveu;
  // a flag no metadata é idempotente e reabre o pedido se o admin já tiver
  // dado baixa num anterior.
  async function handleRequestAdvance() {
    if (!content.trim()) {
      setErrorMessage(
        'Descreva a solicitação no comentário antes de solicitar o adiantamento.'
      );
      return;
    }

    setErrorMessage('');
    setLoadingAdvance(true);

    const formData = new FormData();
    formData.append('content', content);

    try {
      const response = await addComment(crmCase.case_id, formData);
      if (!response.success) {
        handleFailure(response);
        return;
      }

      const metadataResponse = await updateCaseMetadata(crmCase.case_id, {
        [ADVANCE_REQUESTED_METADATA_KEY]: ADVANCE_REQUESTED_METADATA_VALUE,
      });
      if (!metadataResponse.success) {
        handleFailure(metadataResponse);
        return;
      }

      showSnackbar('Adiantamento solicitado com sucesso', 'success');
      setContent('');
      refresh();
    } finally {
      setLoadingAdvance(false);
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <label
        className="mb-2 block text-sm font-medium text-gray-700"
        htmlFor="ongoing-comment"
      >
        Comentário
      </label>
      <textarea
        id="ongoing-comment"
        className="h-24 w-full rounded-md border border-gray-300 p-2"
        rows={3}
        placeholder="Registre informações do atendimento ou descreva uma solicitação de adiantamento"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      <div className="mb-4 mt-2">
        <GenericUploader ref={uploaderRef} minFiles={0} maxFiles={20} />
      </div>

      {errorMessage && (
        <div className="mb-4">
          <ErrorMessage message={errorMessage} />
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Button
          type="button"
          onClick={handleAddComment}
          isLoading={loadingComment}
          disabled={loadingAdvance}
        >
          Adicionar comentário
        </Button>
        <Button
          type="button"
          onClick={handleRequestAdvance}
          isLoading={loadingAdvance}
          disabled={loadingComment}
        >
          Solicitar Adiantamento/Peças
        </Button>
      </div>
    </div>
  );
}
