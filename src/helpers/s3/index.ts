import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { promises as fs } from 'fs';
import path from 'path';

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is required');
}

const r2Client = new S3Client({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
  }
});

export const R2_BUCKET = process.env.R2_BUCKET;

interface UploadParams {
  file: Buffer;
  key: string;
  contentType?: string;
}

interface FileUploadParams {
  filePath: string;
  prefix?: string;
  contentType?: string;
}


export async function uploadToR2({ file, key, contentType }: UploadParams) {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await r2Client.send(command);
    const baseUrl = process.env.R2_PUBLIC_URL;

    return `${baseUrl}/${key}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
}

export async function getSignedR2Url(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

export function generateKey(filename: string, prefix?: string) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix ? prefix + '/' : ''}${timestamp}-${randomString}-${sanitizedFilename}`;
}

export async function handleFileUpload({ filePath, prefix, contentType }: FileUploadParams) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    const filename = path.basename(filePath);
    const key = generateKey(filename, prefix);

    // Upload to R2 and get URL
    const r2Url = await uploadToR2({
      file: fileBuffer,
      key,
      contentType: contentType || 'application/octet-stream'
    });

    return {
      url: r2Url,
    };
  } catch (error) {
    console.error('Error in file upload process:', error);
    throw new Error('Failed to process file upload');
  }
}