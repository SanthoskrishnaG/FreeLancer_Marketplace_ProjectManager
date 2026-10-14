import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { ProjectService } from '../services/projectService.js';
import { FolderRepository } from '../repositories/folder.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { UserRole } from '@prisma/client';

describe('Project Title & Folders Management Test Suite', () => {
  const app = createApp();

  const clientUserId = 'client-user-999';
  const clientProfileId = 'client-profile-999';
  const projectId = 'proj-uuid-folders-123';

  const clientToken = signAccessToken({
    userId: clientUserId,
    email: 'client_folders@test.com',
    role: UserRole.CLIENT,
  });

  const mockClientProfile = {
    id: clientUserId,
    email: 'client_folders@test.com',
    role: UserRole.CLIENT,
    clientProfile: {
      id: clientProfileId,
      userId: clientUserId,
    },
  };

  const mockProject = {
    id: projectId,
    clientId: clientProfileId,
    title: 'Initial Project Title',
    description: 'A test project with full description requirements',
    budget: 50000,
    status: 'PUBLISHED',
  };

  describe('Project Title Update & Persistence', () => {
    it('PUT /api/projects/:id should update and persist the project title', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientProfile as any);
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.spyOn(ProjectRepository, 'updateProject').mockResolvedValue({
        ...mockProject,
        title: 'Updated Project Architecture Title',
      } as any);

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ title: 'Updated Project Architecture Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Project Architecture Title');
    });
  });

  describe('Project Folders & Records', () => {
    const mockFolderId = 'folder-uuid-1';
    const mockFolder = {
      id: mockFolderId,
      projectId,
      name: 'Design Assets & Specifications',
      createdById: clientUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: clientUserId,
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'CLIENT',
      },
      files: [],
    };

    it('POST /api/projects/:projectId/folders should create a new folder', async () => {
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.spyOn(FolderRepository, 'findByName').mockResolvedValue(null);
      vi.spyOn(FolderRepository, 'createFolder').mockResolvedValue(mockFolder as any);

      const res = await request(app)
        .post(`/api/projects/${projectId}/folders`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Design Assets & Specifications' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Design Assets & Specifications');
      expect(res.body.data.projectId).toBe(projectId);
    });

    it('POST /api/projects/:projectId/folders should reject duplicate folder names', async () => {
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.spyOn(FolderRepository, 'findByName').mockResolvedValue(mockFolder as any);

      const res = await request(app)
        .post(`/api/projects/${projectId}/folders`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Design Assets & Specifications' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/projects/:projectId/folders should return all folders for the project', async () => {
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.spyOn(FolderRepository, 'getFoldersByProjectId').mockResolvedValue([mockFolder] as any);

      const res = await request(app)
        .get(`/api/projects/${projectId}/folders`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(mockFolderId);
    });

    it('POST /api/projects/:projectId/folders/:folderId/files should add a record to the folder', async () => {
      const mockFile = {
        id: 'file-uuid-1',
        folderId: mockFolderId,
        name: 'UI_Wireframe_v1.pdf',
        url: 'https://example.com/files/wireframe.pdf',
        size: 102400,
        mimeType: 'application/pdf',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(FolderRepository, 'getFolderById').mockResolvedValue(mockFolder as any);
      vi.spyOn(FolderRepository, 'addFileToFolder').mockResolvedValue(mockFile as any);

      const res = await request(app)
        .post(`/api/projects/${projectId}/folders/${mockFolderId}/files`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'UI_Wireframe_v1.pdf',
          url: 'https://example.com/files/wireframe.pdf',
          size: 102400,
          mimeType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('UI_Wireframe_v1.pdf');
    });

    it('DELETE /api/projects/:projectId/folders/:folderId/files/:fileId should delete a file from folder', async () => {
      const mockFile = {
        id: 'file-uuid-1',
        folderId: mockFolderId,
        name: 'UI_Wireframe_v1.pdf',
      };

      vi.spyOn(FolderRepository, 'getFileById').mockResolvedValue(mockFile as any);
      vi.spyOn(FolderRepository, 'deleteFile').mockResolvedValue(1 as any);

      const res = await request(app)
        .delete(`/api/projects/${projectId}/folders/${mockFolderId}/files/file-uuid-1`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/projects/:projectId/folders/:folderId should delete a folder', async () => {
      vi.spyOn(FolderRepository, 'getFolderById').mockResolvedValue(mockFolder as any);
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientProfile as any);
      vi.spyOn(FolderRepository, 'deleteFolder').mockResolvedValue(1 as any);

      const res = await request(app)
        .delete(`/api/projects/${projectId}/folders/${mockFolderId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
