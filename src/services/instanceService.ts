import { privateAPI, publicAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

export interface Instance {
    id: number | null;
    name: string;
    description?: string;
}

/**
 * Fetch all instances from the API
 * @returns Promise with all instances
 */
export const fetchInstances = async (): Promise<ApiResponse<Instance[]>> => {
    try {
        const response = await publicAPI.get<ApiResponse<Instance[]>>(
            "/instances"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching instances:", error);
        throw error;
    }
};

/**
 * Fetch instances for admin from the API
 * @returns Promise with all instances for admin
 */
export const fetchAdminInstances = async (): Promise<
    ApiResponse<Instance[]>
> => {
    try {
        const response = await privateAPI.get<ApiResponse<Instance[]>>(
            "/instances",
            {
                params: {
                    size: 99,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching admin instances:", error);
        throw error;
    }
};

/**
 * Create a new instance
 * @param instance Instance data with id=null for new instance
 * @returns Promise with the created instance
 */
export const createInstance = async (instance: {
    name: string;
    description?: string;
    id: null;
}): Promise<ApiResponse<Instance>> => {
    try {
        const response = await privateAPI.post<ApiResponse<Instance>>(
            "/instances",
            {
                id: null,
                name: instance.name,
                description: instance.description || "",
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating instance:", error);
        throw error;
    }
};

/**
 * Update an existing instance
 * @param instance Instance data with existing id
 * @returns Promise with the updated instance
 */
export const updateInstance = async (
    instance: Instance
): Promise<ApiResponse<Instance>> => {
    try {
        const response = await privateAPI.put<ApiResponse<Instance>>(
            `/instances/${instance.id}`,
            {
                id: instance.id,
                name: instance.name,
                description: instance.description || "",
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating instance:", error);
        throw error;
    }
};

/**
 * Delete an instance
 * @param id Instance ID to delete
 * @returns Promise with success message
 */
export const deleteInstance = async (
    id: number
): Promise<ApiResponse<void>> => {
    try {
        const response = await privateAPI.delete(`/instances/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting instance:", error);
        throw error;
    }
};
