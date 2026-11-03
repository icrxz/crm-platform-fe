'use client';
import {
  Attachment,
  AttachmentDocumentType,
  attachmentDocumentTypeLabel,
} from '@/app/types/attachments';
import { WizardStep } from '@/app/utils/ongoing_wizard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import { Button } from '../../common/button';
import type {
  FileUploaderGenericRef,
  FileUploaderProps,
} from '../../common/file-uploader';
import { ImageCarousel } from '../../common/image-carousel';
import { Pill } from '../../common/pill';

const GenericUploader = dynamic(
  () =>
    import('../../common/file-uploader').then((m) => ({
      default: m.GenericUploader,
    })),
  { ssr: false }
) as ForwardRefExoticComponent<
  FileUploaderProps & RefAttributes<FileUploaderGenericRef>
>;

interface WizardUploadStepProps {
  step: WizardStep;
  hidden: boolean;
  /** Conteúdo próprio da etapa antes do upload (ex: tipo de serviço). */
  header?: ReactNode;
  posted: Attachment[];
  isDocumentSent: (documentType: AttachmentDocumentType) => boolean;
  uploaderRef: (instance: FileUploaderGenericRef | null) => void;
  isUploading: boolean;
  isBusy: boolean;
  onUpload: () => void;
  onRemove: (attachment: Attachment) => void;
  onNext?: () => void;
}

// Fica montada mesmo escondida, para não perder arquivos já selecionados ao
// trocar de etapa.
export function WizardUploadStep({
  step,
  hidden,
  header,
  posted,
  isDocumentSent,
  uploaderRef,
  isUploading,
  isBusy,
  onUpload,
  onRemove,
  onNext,
}: WizardUploadStepProps) {
  const isMultiDocument = step.documentTypes.length > 1;

  return (
    <section hidden={hidden} aria-label={step.title}>
      {header}

      {isMultiDocument && (
        <ul className="mb-4 space-y-1">
          {step.documentTypes.map((documentType) => {
            const isSent = isDocumentSent(documentType);
            return (
              <li
                key={documentType}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Pill
                  text={isSent ? 'Enviado' : 'Pendente'}
                  color={isSent ? 'success' : 'neutral'}
                  size="sm"
                />
                {attachmentDocumentTypeLabel[documentType]}
              </li>
            );
          })}
        </ul>
      )}

      {posted.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-gray-700">Já enviados</p>
          <ImageCarousel
            images={posted.map((attachment) => ({
              id: attachment.attachment_id,
              src: attachment.url,
              alt: attachment.file_name,
            }))}
          />
          <ul className="mt-2 flex flex-wrap gap-2">
            {posted.map((attachment) => (
              <li
                key={attachment.attachment_id}
                className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-xs text-gray-700"
              >
                {attachment.file_name}
                {isMultiDocument && attachment.document_type && (
                  <span className="text-gray-500">
                    ({attachmentDocumentTypeLabel[attachment.document_type]})
                  </span>
                )}
                <Button
                  type="button"
                  size="sm"
                  color="error"
                  scheme="quiet"
                  className="min-w-0 px-2"
                  aria-label={`Remover ${attachment.file_name}`}
                  disabled={isBusy}
                  onClick={() => onRemove(attachment)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <GenericUploader
          ref={uploaderRef}
          minFiles={0}
          maxFiles={20}
          defaultDocumentType={step.documentTypes[0]}
          documentTypes={isMultiDocument ? step.documentTypes : undefined}
        />
        {isMultiDocument && (
          <p className="mt-1 text-xs text-gray-500">
            Marque cada arquivo com o documento que ele é.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          onClick={onUpload}
          isLoading={isUploading}
          disabled={isBusy}
        >
          Enviar {step.title.toLowerCase()}
        </Button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Próxima etapa
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
