/**
 * Azure Blob Storage Service
 * 
 * Provides document storage capabilities using Azure Blob Storage.
 * Supports upload, download, delete, and URL generation for documents.
 * 
 * Features:
 * - Container-based organization (invoices, daily-logs, compliance, exports)
 * - Metadata tagging for documents
 * - SAS URL generation for secure access
 * - Error handling and retry logic
 * - Health check support
 */

import { BlobServiceClient, ContainerClient, BlockBlobClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';
import { logger } from '../config/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadOptions {
  containerName: string;
  blobName: string;
  filePath?: string;
  buffer?: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface DownloadOptions {
  containerName: string;
  blobName: string;
  downloadPath?: string;
}

export interface BlobMetadata {
  tenantId?: string;
  workflowType?: string;
  documentId?: string;
  originalFilename?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  [key: string]: string | undefined;
}

export interface SASUrlOptions {
  containerName: string;
  blobName: string;
  expiresInMinutes?: number;
  permissions?: 'read' | 'write' | 'readwrite';
}

/**
 * Azure Blob Storage Service Class
 */
class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private accountName: string | null = null;
  private accountKey: string | null = null;
  private useMockStorage: boolean = false;
  private mockStoragePath: string = '/tmp/mock-blob-storage';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Azure Blob Storage client
   */
  private initialize() {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    // Check if Azure credentials are available
    if (!accountName && !connectionString) {
      logger.warn('Azure Blob Storage credentials not found, using mock storage');
      this.useMockStorage = true;
      this.setupMockStorage();
      return;
    }

    try {
      if (connectionString) {
        // Initialize with connection string
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        logger.info('Azure Blob Storage initialized with connection string');
      } else if (accountName && accountKey) {
        // Initialize with account name and key
        this.accountName = accountName;
        this.accountKey = accountKey;
        const connectionStringGenerated = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionStringGenerated);
        logger.info(`Azure Blob Storage initialized for account: ${accountName}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Azure Blob Storage:', error);
      logger.warn('Falling back to mock storage');
      this.useMockStorage = true;
      this.setupMockStorage();
    }
  }

  /**
   * Setup mock storage directory for development/testing
   */
  private setupMockStorage() {
    if (!fs.existsSync(this.mockStoragePath)) {
      fs.mkdirSync(this.mockStoragePath, { recursive: true });
      logger.info(`Mock storage directory created: ${this.mockStoragePath}`);
    }
  }

  /**
   * Ensure container exists (creates if not present)
   */
  private async ensureContainer(containerName: string): Promise<ContainerClient | null> {
    if (this.useMockStorage) {
      const containerPath = path.join(this.mockStoragePath, containerName);
      if (!fs.existsSync(containerPath)) {
        fs.mkdirSync(containerPath, { recursive: true });
        logger.info(`Mock container created: ${containerName}`);
      }
      return null;
    }

    if (!this.blobServiceClient) {
      throw new Error('Blob service client not initialized');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      await containerClient.createIfNotExists();
      logger.debug(`Container ensured: ${containerName}`);
      return containerClient;
    } catch (error) {
      logger.error(`Failed to ensure container ${containerName}:`, error);
      throw error;
    }
  }

  /**
   * Upload a file to Azure Blob Storage
   */
  async uploadFile(options: UploadOptions): Promise<{ blobUrl: string; blobName: string }> {
    const { containerName, blobName, filePath, buffer, contentType, metadata } = options;

    if (!filePath && !buffer) {
      throw new Error('Either filePath or buffer must be provided');
    }

    // Mock storage implementation
    if (this.useMockStorage) {
      return this.mockUploadFile(options);
    }

    try {
      // Ensure container exists
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      // Get blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Prepare upload options
      const uploadOptions: any = {
        blobHTTPHeaders: {
          blobContentType: contentType || 'application/octet-stream',
        },
      };

      if (metadata) {
        uploadOptions.metadata = metadata;
      }

      // Upload from file or buffer
      if (buffer) {
        await blockBlobClient.uploadData(buffer, uploadOptions);
      } else if (filePath) {
        await blockBlobClient.uploadFile(filePath, uploadOptions);
      }

      logger.info(`File uploaded to blob storage: ${containerName}/${blobName}`);

      return {
        blobUrl: blockBlobClient.url,
        blobName: blobName,
      };
    } catch (error) {
      logger.error(`Failed to upload file to blob storage:`, error);
      throw error;
    }
  }

  /**
   * Mock upload implementation for development
   */
  private async mockUploadFile(options: UploadOptions): Promise<{ blobUrl: string; blobName: string }> {
    const { containerName, blobName, filePath, buffer } = options;
    const containerPath = path.join(this.mockStoragePath, containerName);
    const targetPath = path.join(containerPath, blobName);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    // Copy file or write buffer
    if (buffer) {
      fs.writeFileSync(targetPath, buffer);
    } else if (filePath) {
      fs.copyFileSync(filePath, targetPath);
    }

    logger.info(`Mock: File stored at ${targetPath}`);

    return {
      blobUrl: `file://${targetPath}`,
      blobName: blobName,
    };
  }

  /**
   * Download a file from Azure Blob Storage
   */
  async downloadFile(options: DownloadOptions): Promise<Buffer> {
    const { containerName, blobName, downloadPath } = options;

    // Mock storage implementation
    if (this.useMockStorage) {
      return this.mockDownloadFile(options);
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      if (downloadPath) {
        // Download to file
        await blockBlobClient.downloadToFile(downloadPath);
        logger.info(`File downloaded from blob storage to: ${downloadPath}`);
        return fs.readFileSync(downloadPath);
      } else {
        // Download to buffer
        const downloadResponse = await blockBlobClient.download();
        const buffer = await this.streamToBuffer(downloadResponse.readableStreamBody!);
        logger.info(`File downloaded from blob storage: ${containerName}/${blobName}`);
        return buffer;
      }
    } catch (error) {
      logger.error(`Failed to download file from blob storage:`, error);
      throw error;
    }
  }

  /**
   * Mock download implementation
   */
  private async mockDownloadFile(options: DownloadOptions): Promise<Buffer> {
    const { containerName, blobName } = options;
    const filePath = path.join(this.mockStoragePath, containerName, blobName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Mock blob not found: ${containerName}/${blobName}`);
    }

    return fs.readFileSync(filePath);
  }

  /**
   * Delete a file from Azure Blob Storage
   */
  async deleteFile(containerName: string, blobName: string): Promise<void> {
    // Mock storage implementation
    if (this.useMockStorage) {
      const filePath = path.join(this.mockStoragePath, containerName, blobName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Mock: File deleted at ${filePath}`);
      }
      return;
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
      logger.info(`File deleted from blob storage: ${containerName}/${blobName}`);
    } catch (error) {
      logger.error(`Failed to delete file from blob storage:`, error);
      throw error;
    }
  }

  /**
   * Check if a blob exists
   */
  async blobExists(containerName: string, blobName: string): Promise<boolean> {
    // Mock storage implementation
    if (this.useMockStorage) {
      const filePath = path.join(this.mockStoragePath, containerName, blobName);
      return fs.existsSync(filePath);
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        return false;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (error) {
      logger.error(`Failed to check blob existence:`, error);
      return false;
    }
  }

  /**
   * Generate SAS URL for secure access to a blob
   */
  async generateSasUrl(options: SASUrlOptions): Promise<string> {
    const { containerName, blobName, expiresInMinutes = 60, permissions = 'read' } = options;

    // Mock storage returns local file path
    if (this.useMockStorage) {
      const filePath = path.join(this.mockStoragePath, containerName, blobName);
      return `file://${filePath}`;
    }

    if (!this.accountName || !this.accountKey) {
      throw new Error('Account name and key required for SAS URL generation');
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Set permissions
      const blobPermissions = new BlobSASPermissions();
      if (permissions === 'read' || permissions === 'readwrite') {
        blobPermissions.read = true;
      }
      if (permissions === 'write' || permissions === 'readwrite') {
        blobPermissions.write = true;
        blobPermissions.create = true;
      }

      // Generate SAS token
      const sasOptions = {
        containerName: containerName,
        blobName: blobName,
        permissions: blobPermissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + expiresInMinutes * 60 * 1000),
      };

      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

      const sasUrl = `${blockBlobClient.url}?${sasToken}`;
      logger.debug(`SAS URL generated for ${containerName}/${blobName}`);

      return sasUrl;
    } catch (error) {
      logger.error(`Failed to generate SAS URL:`, error);
      throw error;
    }
  }

  /**
   * List blobs in a container
   */
  async listBlobs(containerName: string, prefix?: string): Promise<string[]> {
    // Mock storage implementation
    if (this.useMockStorage) {
      const containerPath = path.join(this.mockStoragePath, containerName);
      if (!fs.existsSync(containerPath)) {
        return [];
      }

      const files: string[] = [];
      const readDir = (dir: string, baseDir: string = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const relativePath = path.join(baseDir, entry.name);
          if (entry.isDirectory()) {
            readDir(path.join(dir, entry.name), relativePath);
          } else {
            if (!prefix || relativePath.startsWith(prefix)) {
              files.push(relativePath);
            }
          }
        }
      };

      readDir(containerPath);
      return files;
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        return [];
      }

      const blobs: string[] = [];
      const options = prefix ? { prefix } : undefined;

      for await (const blob of containerClient.listBlobsFlat(options)) {
        blobs.push(blob.name);
      }

      logger.debug(`Listed ${blobs.length} blobs in container ${containerName}`);
      return blobs;
    } catch (error) {
      logger.error(`Failed to list blobs:`, error);
      return [];
    }
  }

  /**
   * Get blob metadata
   */
  async getBlobMetadata(containerName: string, blobName: string): Promise<BlobMetadata | null> {
    // Mock storage - no metadata support
    if (this.useMockStorage) {
      return null;
    }

    try {
      const containerClient = await this.ensureContainer(containerName);
      if (!containerClient) {
        return null;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();

      return properties.metadata as BlobMetadata || null;
    } catch (error) {
      logger.error(`Failed to get blob metadata:`, error);
      return null;
    }
  }

  /**
   * Health check for Azure Blob Storage
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; provider: string }> {
    if (this.useMockStorage) {
      return {
        healthy: true,
        message: 'Mock storage is operational',
        provider: 'mock',
      };
    }

    try {
      if (!this.blobServiceClient) {
        return {
          healthy: false,
          message: 'Blob service client not initialized',
          provider: 'azure',
        };
      }

      // Try to list containers to verify connectivity
      const iterator = this.blobServiceClient.listContainers().byPage({ maxPageSize: 1 });
      await iterator.next();

      return {
        healthy: true,
        message: 'Azure Blob Storage is operational',
        provider: 'azure',
      };
    } catch (error) {
      logger.error('Azure Blob Storage health check failed:', error);
      return {
        healthy: false,
        message: `Azure Blob Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        provider: 'azure',
      };
    }
  }

  /**
   * Generate a unique blob name with timestamp and hash
   */
  generateBlobName(originalFilename: string, tenantId?: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    
    if (tenantId) {
      return `${tenantId}/${timestamp}-${random}-${sanitized}${ext}`;
    }
    
    return `${timestamp}-${random}-${sanitized}${ext}`;
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data: Buffer) => {
        chunks.push(data);
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  /**
   * Get storage mode (azure or mock)
   */
  getStorageMode(): 'azure' | 'mock' {
    return this.useMockStorage ? 'mock' : 'azure';
  }
}

// Export singleton instance
export const azureBlobStorageService = new AzureBlobStorageService();
export default azureBlobStorageService;
