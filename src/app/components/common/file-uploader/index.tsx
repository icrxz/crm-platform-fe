"use client";
import { uploadAttachments } from '@/app/services/attachments';
import { Attachment, CreateAttachment } from '@/app/types/attachments';
import Uppy from '@uppy/core';
import Portuguese from '@uppy/locales/lib/pt_BR';
import { FileInput } from '@uppy/react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Badge } from '../badge';

export interface FileUploaderGenericRef {
  submit: () => Promise<CreateAttachment[] | undefined>;
}

interface FileUploaderProps {
  maxFileSize?: number;
  maxFiles?: number;
  minFiles?: number;
}

export const GenericUploader = forwardRef<FileUploaderGenericRef, FileUploaderProps>(
  ({
    maxFileSize,
    maxFiles,
    minFiles,
  }, ref) => {
    const [refreshInput, setRefreshInput] = useState(false);

    const [uppy] = useState(() => new Uppy({
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
    }));

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

    useImperativeHandle(ref, () => {
      return {
        submit: submitAttachments,
      };
    });

    async function submitAttachments() {
      const uppyAttachments = uppy.getFiles();

      const formData = new FormData();
      uppyAttachments.map((file) => {
        formData.append('attachments', file.data as File);
      });

      const attachments = await uploadAttachments(formData).then((uploadResp) => {
        uppy.cancelAll();
        return uploadResp;
      });

      return attachments || [];
    }

    return (
      <div>
        <FileInput uppy={uppy} pretty inputName='attachments' id='attachments' />

        {!refreshInput && (
          <div className='flex gap-2 -mt-1'>
            {uppy.getFiles().map((file) => (
              <Badge
                key={file.id}
                content={file.name}
                isClosable
                onClose={() => {
                  uppy.removeFile(file.id);
                  setRefreshInput(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

GenericUploader.displayName = 'GenericUploader';
