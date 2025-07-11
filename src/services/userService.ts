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
    search?: string;
    role?: string;
    status?: string;
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
            const searchParams = new URLSearchParams();

            if (params.page !== undefined)
                searchParams.append("page", params.page.toString());
            if (params.size !== undefined)
                searchParams.append("size", params.size.toString());
            if (params.search) searchParams.append("search", params.search);
            if (params.role) searchParams.append("role", params.role);
            if (params.status) searchParams.append("status", params.status);

            const response = await privateAPI.get(
                `/users?${searchParams.toString()}`
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
        id: number,
        enabled: boolean
    ): Promise<{ success: boolean; message: string; data: User }> => {
        try {
            const response = await privateAPI.patch(`/users/${id}/status`, {
                enabled,
            });
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
