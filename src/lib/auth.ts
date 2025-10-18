// Authentication utilities
import { NextRequest } from "next/server";

// Simple password hashing (in production, use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, using a simple hash
  // In production, use: import bcrypt from 'bcryptjs'; return bcrypt.hash(password, 10);
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_key_secret");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // For demo purposes
  // In production, use: import bcrypt from 'bcryptjs'; return bcrypt.compare(password, hashedPassword);
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// JWT token generation (simplified for demo)
export function generateToken(
  userId: string,
  email: string,
  role: string
): string {
  const payload = {
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  // In production, use proper JWT library like jsonwebtoken or jose
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyToken(
  token: string
): { userId: string; email: string; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

// Get user from request
export function getUserFromRequest(
  request: NextRequest
): { userId: string; email: string; role: string } | null {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Authorization middleware
export function requireAuth(
  request: NextRequest,
  requiredRole?: string
): { userId: string; email: string; role: string } | null {
  const user = getUserFromRequest(request);
  if (!user) return null;

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return null; // User doesn't have required role
  }

  return user;
}

// Role hierarchy: admin > vendor > viewer
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: { [key: string]: number } = {
    admin: 3,
    vendor: 2,
    viewer: 1,
  };
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}
