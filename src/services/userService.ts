import { privateAPI } from '../utils/axios';

export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    birth: string | null;
    image: string | null;
    enabled: boolean;
    createdAt?: string;
    roles: Role[];
}

export interface Role {
    id: string;
    name: string;
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

export interface UserParams {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    status?: string;
}

const userService = {
    // Get all users with pagination and filters
    getUsers: async (params: UserParams = {}): Promise<UserResponse> => {
        try {
            const searchParams = new URLSearchParams();
            
            if (params.page !== undefined) searchParams.append('page', params.page.toString());
            if (params.size !== undefined) searchParams.append('size', params.size.toString());
            if (params.search) searchParams.append('search', params.search);
            if (params.role) searchParams.append('role', params.role);
            if (params.status) searchParams.append('status', params.status);

            const response = await privateAPI.get(`/users?${searchParams.toString()}`);
            return response;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (id: number): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.get(`/users/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Toggle user status (enable/disable)
    toggleUserStatus: async (id: number, enabled: boolean): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.patch(`/users/${id}/status`, { enabled });
            return response;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    },

    // Update user role
    updateUserRole: async (id: number, role: string): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.patch(`/users/${id}/role`, { role });
            return response;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },
};

export default userService;
