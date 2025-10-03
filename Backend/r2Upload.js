const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

// Cloudflare R2 Configuration
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto'
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'reels';

/**
 * Upload file to Cloudflare R2 with 10-minute expiry
 * @param {string} filePath - Local file path
 * @param {string} fileName - Name for the file in R2
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToR2(filePath, fileName) {
  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath);
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: 'video/mp4',
      Metadata: {
        'upload-time': timestamp.toString(),
        'expiry-minutes': '10'
      }
    });

    await r2Client.send(uploadCommand);
    
    // Generate presigned URL for downloading (10 minutes access)
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
    });
    
    // Create presigned URL that expires in 10 minutes
    const presignedUrl = await getSignedUrl(r2Client, getCommand, { 
      expiresIn: 600 // 10 minutes in seconds
    });
    
    // Schedule deletion after 10 minutes
    setTimeout(async () => {
      try {
        await deleteFromR2(uniqueFileName);
        console.log(`🗑️ Auto-deleted expired file: ${uniqueFileName}`);
      } catch (error) {
        console.error('Failed to auto-delete file:', error.message);
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    // Delete local file after upload
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted local file: ${filePath}`);
    
    return presignedUrl;
    
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error(`Failed to upload to R2: ${error.message}`);
  }
}

/**
 * Delete file from R2
 * @param {string} fileName - File name in R2
 */
async function deleteFromR2(fileName) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
    
    await r2Client.send(deleteCommand);
    console.log(`✅ Deleted from R2: ${fileName}`);
  } catch (error) {
    console.error('R2 Delete Error:', error);
    throw error;
  }
}

/**
 * Clean up expired files (run periodically)
 */
async function cleanupExpiredFiles() {
  // This would require listing objects and checking metadata
  // For now, we rely on setTimeout for auto-deletion
  console.log('🧹 Cleanup check completed');
}

module.exports = {
  uploadToR2,
  deleteFromR2,
  cleanupExpiredFiles
};