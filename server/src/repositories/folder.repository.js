import { randomUUID } from 'crypto';
import { prisma } from '../config/database.js';

export class FolderRepository {
  static async getFoldersByProjectId(projectId) {
    const folders = await prisma.$queryRawUnsafe(
      `SELECT 
         f.id,
         f."projectId",
         f.name,
         f."createdById",
         f."createdAt",
         f."updatedAt",
         json_build_object(
           'id', u.id,
           'firstName', u."firstName",
           'lastName', u."lastName",
           'role', u.role
         ) as "createdBy",
         COALESCE(
           (
             SELECT json_agg(
               json_build_object(
                 'id', fl.id,
                 'folderId', fl."folderId",
                 'name', fl.name,
                 'url', fl.url,
                 'size', fl.size,
                 'mimeType', fl."mimeType",
                 'createdAt', fl."createdAt"
               ) ORDER BY fl."createdAt" DESC
             )
             FROM "ProjectFile" fl
             WHERE fl."folderId" = f.id
           ),
           '[]'::json
         ) as files
       FROM "ProjectFolder" f
       LEFT JOIN "User" u ON u.id = f."createdById"
       WHERE f."projectId" = $1
       ORDER BY f."createdAt" ASC`,
      projectId
    );

    return folders;
  }

  static async getFolderById(folderId) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT 
         f.id,
         f."projectId",
         f.name,
         f."createdById",
         f."createdAt",
         f."updatedAt"
       FROM "ProjectFolder" f
       WHERE f.id = $1`,
      folderId
    );
    return rows[0] || null;
  }

  static async findByName(projectId, name) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, name FROM "ProjectFolder" WHERE "projectId" = $1 AND LOWER(name) = LOWER($2)`,
      projectId,
      name.trim()
    );
    return rows[0] || null;
  }

  static async createFolder({ projectId, name, createdById }) {
    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProjectFolder" ("id", "projectId", "name", "createdById", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      id,
      projectId,
      name.trim(),
      createdById
    );

    const created = await prisma.$queryRawUnsafe(
      `SELECT 
         f.id,
         f."projectId",
         f.name,
         f."createdById",
         f."createdAt",
         f."updatedAt",
         json_build_object(
           'id', u.id,
           'firstName', u."firstName",
           'lastName', u."lastName",
           'role', u.role
         ) as "createdBy",
         '[]'::json as files
       FROM "ProjectFolder" f
       LEFT JOIN "User" u ON u.id = f."createdById"
       WHERE f.id = $1`,
      id
    );

    return created[0];
  }

  static async deleteFolder(folderId) {
    return prisma.$executeRawUnsafe(
      `DELETE FROM "ProjectFolder" WHERE id = $1`,
      folderId
    );
  }

  static async addFileToFolder({ folderId, name, url = '#', size = null, mimeType = 'application/octet-stream' }) {
    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProjectFile" ("id", "folderId", "name", "url", "size", "mimeType", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      id,
      folderId,
      name.trim(),
      url,
      size,
      mimeType
    );

    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, "folderId", name, url, size, "mimeType", "createdAt"
       FROM "ProjectFile"
       WHERE id = $1`,
      id
    );

    return rows[0];
  }

  static async getFileById(fileId) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, "folderId", name, url, size, "mimeType", "createdAt"
       FROM "ProjectFile"
       WHERE id = $1`,
      fileId
    );
    return rows[0] || null;
  }

  static async deleteFile(fileId) {
    return prisma.$executeRawUnsafe(
      `DELETE FROM "ProjectFile" WHERE id = $1`,
      fileId
    );
  }
}
