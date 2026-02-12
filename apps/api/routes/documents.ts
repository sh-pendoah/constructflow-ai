import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentModel } from '../models/Document';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { config } from '../config';
import { azureBlobStorageService } from '../services/azureBlobStorageService';
import * as fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.use(authMiddleware);

router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const documents = await DocumentModel.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    logger.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.post('/:projectId/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Generate unique blob name
    const blobName = azureBlobStorageService.generateBlobName(req.file.originalname, req.user!.id);
    const containerName = 'documents';

    // Upload to Azure Blob Storage
    const { blobUrl } = await azureBlobStorageService.uploadFile({
      containerName,
      blobName,
      filePath: req.file.path,
      contentType: req.file.mimetype,
      metadata: {
        tenantId: req.user!.id,
        projectId: req.params.projectId,
        originalFilename: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user!.id,
      },
    });

    // Clean up local file after upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      logger.warn('Failed to cleanup local file:', cleanupError);
    }

    // Create document record
    const doc = await DocumentModel.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      project: req.params.projectId,
      uploadedBy: req.user!.id,
      fileUrl: blobUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    logger.info(`Document uploaded to blob storage: ${containerName}/${blobName}`);
    res.status(201).json({ document: doc });
  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await DocumentModel.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json({ message: 'Document deleted' });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
