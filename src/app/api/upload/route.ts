import { NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isAdmin } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

/** Accepted content types, mapped to the key prefix they are stored under. */
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'events',
  'image/png': 'events',
  'image/webp': 'events',
  'image/avif': 'events',
  'image/gif': 'events',
  'application/pdf': 'notices',
};

/** Reduce a client-supplied filename to something safe to use as an S3 key. */
function safeName(filename: string): string {
  const base = filename.split(/[\\/]/).pop() || 'file';
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .slice(0, 120);
  return cleaned || 'file';
}

export async function POST(request: Request) {
  // 1. Security Check
  const isAllowed = await isAdmin();
  if (!isAllowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, filetype } = await request.json();

    if (typeof filename !== 'string' || typeof filetype !== 'string') {
      return NextResponse.json({ error: 'filename and filetype are required' }, { status: 400 });
    }

    // 2. Only presign types we actually render (posters and PDF notices)
    const prefix = ALLOWED_TYPES[filetype];
    if (!prefix) {
      return NextResponse.json({ error: `Unsupported file type: ${filetype}` }, { status: 415 });
    }

    const key = `${prefix}/${randomUUID()}-${safeName(filename)}`;

    // 3. Create the command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    // 4. Generate Presigned URL (valid for 60 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // 5. Construct the final public URL
    // If CloudFront is configured, use it. Otherwise fall back to S3 (which requires public bucket).
    const cfDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
    const region = process.env.AWS_REGION || 'ap-south-1';

    const publicUrl = cfDomain
      ? `https://${cfDomain}/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    console.error('S3 Presign Error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
