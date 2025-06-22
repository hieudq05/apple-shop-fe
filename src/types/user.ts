// User-related type definitions

export interface UserRole {
  id?: number;
  authority: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birth: string;
  image: string;
  enabled: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birth: string;
  image: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birth?: string;
  image?: string;
}
