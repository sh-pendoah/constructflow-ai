import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface TenantRequest extends Request {
  tenantId: mongoose.Types.ObjectId;
  user?: { id: string; email: string; role: string; tenantId?: string };
}

/**
 * Tenant middleware - ensures tenant isolation on all requests
 * Requires auth middleware to be called first
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as any; // Cast to access user property

  if (!authReq.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!authReq.user.tenantId) {
    res.status(403).json({ error: 'No tenant associated with user' });
    return;
  }

  // Validate tenantId format
  if (!mongoose.Types.ObjectId.isValid(authReq.user.tenantId)) {
    res.status(400).json({ error: 'Invalid tenant ID format' });
    return;
  }

  // Attach tenantId to request for use in routes
  (req as TenantRequest).tenantId = new mongoose.Types.ObjectId(authReq.user.tenantId);

  next();
}
