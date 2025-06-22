// Centralized role checking utilities
import type { User } from '../types/user';

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  STAFF: 'ROLE_STAFF',
  USER: 'ROLE_USER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Check if user has specific role
 */
export const hasRole = (user: User | null, role: Role): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r.authority === role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: Role[]): boolean => {
  if (!user || !user.roles) return false;
  return roles.some(role => hasRole(user, role));
};

/**
 * Check if user is admin (ADMIN or STAFF)
 */
export const isAdmin = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.STAFF]);
};

/**
 * Check if user is regular user
 */
export const isUser = (user: User | null): boolean => {
  return hasRole(user, ROLES.USER);
};

/**
 * Check if user can access admin area
 */
export const canAccessAdmin = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Get user's primary role (highest priority)
 */
export const getPrimaryRole = (user: User | null): Role | null => {
  if (!user || !user.roles || user.roles.length === 0) return null;
  
  // Priority order: ADMIN > STAFF > USER
  if (hasRole(user, ROLES.ADMIN)) return ROLES.ADMIN;
  if (hasRole(user, ROLES.STAFF)) return ROLES.STAFF;
  if (hasRole(user, ROLES.USER)) return ROLES.USER;
  
  return null;
};

/**
 * Validate role transition (for role updates)
 */
export const canChangeRole = (currentUserRole: Role | null): boolean => {
  // Only ADMIN can change roles
  if (currentUserRole !== ROLES.ADMIN) return false;

  // ADMIN can change any role to any role
  return true;
};
