import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../utils/logger.js';

export interface UploadOptions {
  uploaderId: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  entityType?: 'PORTFOLIO' | 'PROJECT' | 'MILESTONE' | 'CHAT' | 'DISPUTE' | 'AVATAR';
  entityId?: string;
  milestoneSubmissionId?: string;
  messageId?: string;
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/csv',
  'application/json',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export class StorageService {
  private static uploadDir = path.resolve(process.cwd(), 'uploads');

  private static ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public static async uploadFile(options: UploadOptions) {
    const {
      uploaderId,
      originalName,
      mimeType,
      size,
      buffer,
      entityType,
      entityId,
      milestoneSubmissionId,
      messageId,
    } = options;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw ApiError.badRequest(
        `File type "${mimeType}" is not allowed. Supported formats: images, pdfs, documents, and zip archives.`
      );
    }

    // Validate size limit
    if (size > MAX_FILE_SIZE_BYTES) {
      throw ApiError.badRequest(
        `File exceeds the 15MB size limit. Current size: ${(size / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    this.ensureUploadDirExists();

    const fileExt = path.extname(originalName) || '';
    const uniqueKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filePath = path.join(this.uploadDir, uniqueKey);

    // Write file to storage
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueKey}`;

    logger.info(
      `📁 Uploaded file: ${originalName} (${(size / 1024).toFixed(1)} KB) by user ${uploaderId}`
    );

    // Persist file metadata in PostgreSQL
    return prisma.file.create({
      data: {
        originalName,
        storageKey: uniqueKey,
        url: publicUrl,
        mimeType,
        size,
        uploaderId,
        entityType,
        entityId,
        milestoneSubmissionId,
        messageId,
      },
    });
  }

  public static async getFileById(fileId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!file) {
      throw ApiError.notFound('File not found');
    }

    return file;
  }

  public static async deleteFile(fileId: string, currentUserId: string) {
    const file = await this.getFileById(fileId);

    if (file.uploaderId !== currentUserId) {
      throw ApiError.forbidden('You do not have permission to delete this file');
    }

    const filePath = path.join(this.uploadDir, file.storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch((err) => {
        logger.warn(`Could not delete file from disk: ${filePath}`, err);
      });
    }

    return prisma.file.delete({
      where: { id: fileId },
    });
  }
}
