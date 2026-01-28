import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  // Prefer S3-specific region, then general AWS region, then default to Mumbai
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "jk-cycling-assets";
