import { NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isAdmin } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  // 1. Security Check
  const isAllowed = await isAdmin();
  if (!isAllowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, filetype } = await request.json();
    
    // 2. Generate unique filename (e.g., events/uuid-image.jpg)
    const key = `events/${randomUUID()}-${filename.replace(/\s+/g, '-')}`;

    // 3. Create the command
    console.log("Generating Presigned URL for:", { Bucket: BUCKET_NAME, Key: key, ContentType: filetype });
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
