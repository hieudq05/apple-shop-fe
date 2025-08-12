import { privateAPI, publicAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

export interface Color {
    id: number | null;
    name: string;
    hexCode: string;
}

/**
 * Fetch all colors from the API
 * @returns Promise with all colors
 */
export const fetchColors = async (): Promise<ApiResponse<Color[]>> => {
    try {
        const response = await publicAPI.get<ApiResponse<Color[]>>("/colors");
        return response.data;
    } catch (error) {
        console.error("Error fetching colors:", error);
        throw error;
    }
};

/**
 * Fetch colors for admin from the API
 * @returns Promise with all colors for admin
 */
export const fetchAdminColors = async (): Promise<ApiResponse<Color[]>> => {
    try {
        const response = await privateAPI.get<ApiResponse<Color[]>>("/colors", {
            params: {
                size: 99,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching admin colors:", error);
        throw error;
    }
};

/**
 * Create a new color
 * @param color Color data with id=null for new color
 * @returns Promise with the created color
 */
export const createColor = async (color: {
    name: string;
    hexCode: string;
    id: null;
}): Promise<ApiResponse<Color>> => {
    try {
        const response = await privateAPI.post<ApiResponse<Color>>("/colors", {
            id: null,
            name: color.name,
            hexCode: color.hexCode,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating color:", error);
        throw error;
    }
};

/**
 * Update an existing color
 * @param color Color data with existing id
 * @returns Promise with the updated color
 */
export const updateColor = async (color: Color): Promise<Color> => {
    try {
        const response = await privateAPI.put<ApiResponse<Color>>(
            `/colors/${color.id}`,
            {
                id: color.id,
                name: color.name,
                hexCode: color.hexCode,
            }
        );
        return response.data.data as Color;
    } catch (error) {
        console.error("Error updating color:", error);
        throw error;
    }
};

/**
 * Delete a color
 * @param id Color ID to delete
 * @returns Promise with success message
 */
export const deleteColor = async (id: number): Promise<void> => {
    try {
        await privateAPI.delete(`/colors/${id}`);
    } catch (error) {
        console.error("Error deleting color:", error);
        throw error;
    }
};
