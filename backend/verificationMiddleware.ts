import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";

export const requireVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = (req.user as any).id;
    const verification = await storage.getIdVerification(userId);

    // Allow if verified
    if (verification?.status === 'verified') {
      return next();
    }

    // Block if not verified or pending
    return res.status(403).json({ 
      message: "Account verification required",
      verificationStatus: verification?.status || 'none'
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification check failed" });
  }
};

export function applyVerificationMiddleware(app: Express) {
  // Core features require verification
  app.use('/api/host', requireVerification);
  app.use('/api/bookings', requireVerification);
  app.use('/api/checkout', requireVerification);
}
