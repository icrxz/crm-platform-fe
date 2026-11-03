'use client';
import { uploadAttachments } from '@/app/services/attachments';
import {
  AttachmentDocumentType,
  attachmentDocumentTypeLabel,
  CreateAttachment,
} from '@/app/types/attachments';
import Uppy from '@uppy/core';
import Portuguese from '@uppy/locales/lib/pt_BR';
import { FileInput } from '@uppy/react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Badge } from '../badge';

export interface FileUploaderGenericRef {
  submit: () => Promise<CreateAttachment[] | undefined>;
  length: number;
}

export interface FileUploaderProps {
  maxFileSize?: number;
  maxFiles?: number;
  minFiles?: number;
  /**
   * Quando informado, cada arquivo ganha um seletor com estas opções e sobe
   * marcado com o tipo escolhido. Omitido, tudo sobe como foto — que é o
   * comportamento de todos os uploads que não são o envio para laudo.
   */
  documentTypes?: AttachmentDocumentType[];
}

export const GenericUploader = forwardRef<
  FileUploaderGenericRef,
  FileUploaderProps
>(({ maxFileSize, maxFiles, minFiles, documentTypes }, ref) => {
  const [refreshInput, setRefreshInput] = useState(false);
  const [documentTypeByFile, setDocumentTypeByFile] = useState<
    Record<string, AttachmentDocumentType>
  >({});

  const [uppy] = useState(
    () =>
      new Uppy({
        id: 'uppyAttachments',
        autoProceed: true,
        debug: true,
        restrictions: {
          maxFileSize: maxFileSize,
          maxNumberOfFiles: maxFiles,
          minNumberOfFiles: minFiles,
          allowedFileTypes: ['image/*'],
        },
        locale: Portuguese,
      })
  );

  uppy.on('file-added', () => {
    setRefreshInput(true);
  });

  useEffect(() => {
    if (refreshInput) {
      setTimeout(() => {
        setRefreshInput(false);
      }, 5);
    }
  }, [refreshInput]);

  async function submitAttachments() {
    const uppyAttachments = uppy.getFiles();

    const formData = new FormData();
    uppyAttachments.map((file) => {
      formData.append('attachments', file.data as File);
      // Um par por arquivo e na mesma ordem: uploadAttachments casa os dois
      // pelo índice.
      formData.append(
        'document_types',
        documentTypeByFile[file.id] ?? AttachmentDocumentType.PHOTO
      );
    });

    const attachments = await uploadAttachments(formData).then((uploadResp) => {
      uppy.cancelAll();
      setDocumentTypeByFile({});
      return uploadResp;
    });

    return attachments || [];
  }

  useImperativeHandle(ref, () => {
    return {
      submit: submitAttachments,
      length: uppy.getFiles().length,
    };
  });

  function removeFile(fileID: string) {
    uppy.removeFile(fileID);
    setDocumentTypeByFile((prev) => {
      const { [fileID]: _removed, ...rest } = prev;
      return rest;
    });
    setRefreshInput(true);
  }

  return (
    <div>
      <FileInput uppy={uppy} pretty inputName="attachments" id="attachments" />

      {!refreshInput &&
        (documentTypes ? (
          <div className="-mt-1 flex flex-col gap-2">
            {uppy.getFiles().map((file) => (
              <div
                key={file.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-2 py-1"
              >
                <Badge
                  content={file.name || ''}
                  isClosable
                  onClose={() => removeFile(file.id)}
                />

                <label className="sr-only" htmlFor={`document-type-${file.id}`}>
                  Tipo do arquivo {file.name}
                </label>
                <select
                  id={`document-type-${file.id}`}
                  className="rounded-md border border-gray-300 p-1 text-sm"
                  value={
                    documentTypeByFile[file.id] ?? AttachmentDocumentType.PHOTO
                  }
                  onChange={(event) =>
                    setDocumentTypeByFile((prev) => ({
                      ...prev,
                      [file.id]: event.target.value as AttachmentDocumentType,
                    }))
                  }
                >
                  {documentTypes.map((documentType) => (
                    <option key={documentType} value={documentType}>
                      {attachmentDocumentTypeLabel[documentType]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div className="-mt-1 flex gap-2">
            {uppy.getFiles().map((file) => (
              <Badge
                key={file.id}
                content={file.name || ''}
                isClosable
                onClose={() => removeFile(file.id)}
              />
            ))}
          </div>
        ))}
    </div>
  );
});

GenericUploader.displayName = 'GenericUploader';
