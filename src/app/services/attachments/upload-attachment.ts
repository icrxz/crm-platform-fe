"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CreateAttachment } from "@/app/types/attachments";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

import sharp from "sharp";
import { s3Client } from ".";

export async function uploadAttachments(formData: FormData): Promise<CreateAttachment[]> {
  const author = await getCurrentUser();
  if (!author) {
    return [];
  }

  const files = formData.getAll('attachments') as File[];

  const uploads: CreateAttachment[] = await Promise.all(files.map(async (file) => {
    const fileBuffer = await getFileBuffer(file);
    // const reducedFile = await reduceFile(fileBuffer);
    const fileKey = `${uuidv4()}.${file.type.split('/')[1]}`;

    const putS3Attachment = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    });

    const resp = await s3Client.send(putS3Attachment);

    if (resp.$metadata.httpStatusCode !== 200) {
      throw new Error('Error uploading file to S3');
    }

    return {
      file_extension: file.type,
      file_name: file.name,
      size: file.size,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      created_by: author.username,
      key: fileKey,
    } as CreateAttachment;
  }));

  return uploads;
}

async function getFileBuffer(file: File): Promise<Buffer> {
  const imageBuffer = await file.arrayBuffer();
  return Buffer.from(imageBuffer);
}

async function reduceFile(fileBuffer: Buffer): Promise<Buffer> {
  return await sharp(fileBuffer).resize(1280, 720).toBuffer();
}
