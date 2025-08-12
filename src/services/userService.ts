import { privateAPI, userRoleAPI } from "../utils/axios";

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

export interface MyInfo {
    email: string;
    image: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    birth: string | null;
    id: number;
}

export interface UpdateMyInfoData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    image?: string;
    birth?: string;
}

export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

export interface CreateShippingAddressData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    isDefault: boolean;
}

export interface UpdateShippingAddressData
    extends Partial<CreateShippingAddressData> {
    id?: number;
}

export interface ShippingAddressResponse {
    success: boolean;
    message: string;
    data: MyShippingAddress;
}

export interface MyShippingAddress {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    isDefault: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface MyShippingAddressResponse {
    success: boolean;
    message: string;
    data: MyShippingAddress[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

export interface MyInfoResponse {
    success: boolean;
    message: string;
    data: MyInfo;
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
    id?: number;
    email?: string;
    phone?: string;
    name?: string;
    enabled?: boolean;
    birthFrom?: string; // ISO date string
    birthTo?: string; // ISO date string
    createdAtFrom?: string; // ISO datetime string
    createdAtTo?: string; // ISO datetime string
    roleName?: string[]; // Array of role names
    search?: string; // For backward compatibility
    role?: string; // For backward compatibility
    status?: string; // For backward compatibility
}

export interface UserSearchCriteria {
    id?: number;
    email?: string;
    phone?: string;
    name?: string;
    enabled?: boolean;
    birthFrom?: string;
    birthTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    roleName?: string[];
}

const userService = {
    getMe: async (): Promise<MyInfoResponse> => {
        try {
            const response = await userRoleAPI.get("/users/me");
            return response;
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    },

    updateMyInfo: async (
        updateData: UpdateMyInfoData,
        imageFile?: File
    ): Promise<MyInfoResponse> => {
        try {
            const formData = new FormData();

            formData.append(
                "user",
                new Blob([JSON.stringify(updateData)], {
                    type: "application/json",
                })
            );

            formData.append(
                "imageFile",
                imageFile ? imageFile : new File([], "")
            );

            const response = await userRoleAPI.patch<MyInfoResponse>(
                "/users/me",
                formData
            );
            return response;
        } catch (error) {
            console.error("Error updating user info:", error);
            throw error;
        }
    },

    changePassword: async (
        data: ChangePasswordData
    ): Promise<ChangePasswordResponse> => {
        try {
            const response = await userRoleAPI.post<ChangePasswordResponse>(
                "/users/change-password",
                data
            );
            return response;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    },

    getMyShippingAddress: async (): Promise<MyShippingAddressResponse> => {
        try {
            const response = await userRoleAPI.get("/shipping-infos");
            return response;
        } catch (error) {
            console.error("Error fetching shipping addresses:", error);
            throw error;
        }
    },

    // Create new shipping address
    createShippingAddress: async (
        data: CreateShippingAddressData
    ): Promise<ShippingAddressResponse> => {
        try {
            const response = await userRoleAPI.post("/shipping-infos", data);
            return response;
        } catch (error) {
            console.error("Error creating shipping address:", error);
            throw error;
        }
    },

    // Update shipping address
    updateShippingAddress: async (
        id: number,
        data: UpdateShippingAddressData
    ): Promise<ShippingAddressResponse> => {
        try {
            const response = await userRoleAPI.put(
                `/shipping-infos/${id}`,
                data
            );
            return response;
        } catch (error) {
            console.error("Error updating shipping address:", error);
            throw error;
        }
    },

    // Delete shipping address
    deleteShippingAddress: async (
        id: number
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await userRoleAPI.delete(`/shipping-infos/${id}`);
            return response;
        } catch (error) {
            console.error("Error deleting shipping address:", error);
            throw error;
        }
    },

    // Set default shipping address
    setDefaultShippingAddress: async (
        id: number
    ): Promise<ShippingAddressResponse> => {
        try {
            const response = await userRoleAPI.put(
                `/shipping-infos/${id}/default`
            );
            return response;
        } catch (error) {
            console.error("Error setting default shipping address:", error);
            throw error;
        }
    },

    // Get all users with pagination and filters
    getUsers: async (params: UserParams = {}): Promise<UserResponse> => {
        try {
            // Build criteria object for request body
            const criteria: UserSearchCriteria = {};

            // UserSearchCriteria fields
            if (params.id !== undefined) criteria.id = params.id;
            if (params.email) criteria.email = params.email;
            if (params.phone) criteria.phone = params.phone;
            if (params.name) criteria.name = params.name;
            if (params.enabled !== undefined) criteria.enabled = params.enabled;
            if (params.birthFrom) criteria.birthFrom = params.birthFrom;
            if (params.birthTo) criteria.birthTo = params.birthTo;
            if (params.createdAtFrom)
                criteria.createdAtFrom = params.createdAtFrom;
            if (params.createdAtTo) criteria.createdAtTo = params.createdAtTo;
            if (params.roleName && params.roleName.length > 0) {
                criteria.roleName = params.roleName;
            }

            // Build query parameters for pagination
            const searchParams = new URLSearchParams();
            if (params.page !== undefined)
                searchParams.append("page", params.page.toString());
            if (params.size !== undefined)
                searchParams.append("size", params.size.toString());

            // Backward compatibility - add to criteria
            if (params.search) criteria.name = params.search; // Map search to name
            if (params.role) {
                const roleMap: { [key: string]: string } = {
                    "1": "ROLE_ADMIN",
                    "2": "ROLE_STAFF",
                    "3": "ROLE_USER",
                };
                criteria.roleName = [roleMap[params.role] || params.role];
            }
            if (params.status) {
                criteria.enabled = params.status === "1";
            }

            const response = await privateAPI.post(
                `/users/search?${searchParams.toString()}`,
                criteria
            );
            return response;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (
        id: number
    ): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.get(`/users/${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    // Toggle user status (enable/disable)
    toggleUserStatus: async (
        id: number
    ): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.put(
                `/users/${id}/toggle-enabled`
            );
            return response;
        } catch (error) {
            console.error("Error toggling user status:", error);
            throw error;
        }
    },

    // Update user role
    updateUserRole: async (
        id: number,
        role: string
    ): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.patch(`/users/${id}/role`, {
                role,
            });
            return response;
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    },
};

export default userService;
