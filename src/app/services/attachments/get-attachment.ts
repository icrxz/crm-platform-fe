"use server";
import { getCurrentUser } from "@/app/libs/session";
import { Attachment } from "@/app/types/attachments";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

import sharp from "sharp";
import { s3Client } from ".";

export async function getAttachments(attachment: Attachment): Promise<File | null> {
  const author = await getCurrentUser();
  if (!author) {
    return null;
  }

  const fileKey = uuidv4();

  const getS3Attachment = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: fileKey,
  });

  const resp = await s3Client.send(getS3Attachment);

  if (resp.$metadata.httpStatusCode !== 200) {
    throw new Error('Error uploading file to S3');
  }

  const imageBytes = resp.Body?.transformToString();

  if (imageBytes) {
    const x = await imageBytes;
    const tst = await reduceFile(x);
  }

  return uploads;
}

async function getFileBuffer(file: File): Promise<Buffer> {
  const imageBuffer = await file.arrayBuffer();
  return Buffer.from(imageBuffer);
}

async function reduceFile(fileBuffer: Buffer): Promise<Buffer> {
  return await sharp(fileBuffer).resize(1280, 720).toBuffer();
}
