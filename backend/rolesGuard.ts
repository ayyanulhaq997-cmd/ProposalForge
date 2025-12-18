import type { RequestHandler } from "express";

/**
 * Creates a middleware that enforces role-based access control
 * Works with both local auth (req.user.role) and OAuth (req.user.claims)
 * @param allowedRoles - Array of roles allowed to access this route
 * @returns Express middleware that checks user role
 */
export function requireRoles(...allowedRoles: string[]): RequestHandler {
  return (req: any, res, next) => {
    // Check if user is authenticated (should be used after isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Support both local auth (req.user.role) and OAuth (req.user.claims)
    const userRole = req.user.role?.toLowerCase() || "guest";
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${userRole}` 
      });
    }

    // Attach user data to request for downstream handlers
    req.userRole = userRole;
    req.userId = req.user.id;

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
