import type { RequestHandler } from "express";
import { storage } from "./storage";

/**
 * Creates a middleware that enforces role-based access control
 * @param allowedRoles - Array of roles allowed to access this route
 * @returns Express middleware that checks user role
 */
export function requireRoles(...allowedRoles: string[]): RequestHandler {
  return async (req: any, res, next) => {
    // Check if user is authenticated (should be used after isAuthenticated middleware)
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${user.role}` 
      });
    }

    // Attach user object to request for downstream handlers
    req.userRole = user.role;
    req.userId = userId;

    next();
  };
}

/**
 * Decorator-like helper for express to mark routes with required roles
 * Usage: app.post('/api/properties', isAuthenticated, withRoles('host', 'admin'), handler)
 */
export function withRoles(...allowedRoles: string[]) {
  return requireRoles(...allowedRoles);
}

/**
 * Common role constants for type safety
 */
export const ROLES = {
  GUEST: 'guest',
  HOST: 'host',
  ADMIN: 'admin',
} as const;
