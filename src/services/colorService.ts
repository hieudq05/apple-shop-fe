import {privateAPI, publicAPI} from '../utils/axios';
import type {ApiResponse} from '../types/api';

export interface Color {
    id: number | null;
    name: string;
    hexCode: string;
}

/**
 * Fetch all colors from the API
 * @returns Promise with all colors
 */
export const fetchColors = async (): Promise<Color[]> => {
    try {
        const response = await publicAPI.get<ApiResponse<Color[]>>('/colors');
        return response;
    } catch (error) {
        console.error('Error fetching colors:', error);
        throw error;
    }
};

/**
 * Fetch colors for admin from the API
 * @returns Promise with all colors for admin
 */
export const fetchAdminColors = async (): Promise<Color[]> => {
    try {
        const response = await privateAPI.get<ApiResponse<Color[]>>('/colors', {
            params: {
                size: 99
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching admin colors:', error);
        throw error;
    }
};

/**
 * Create a new color
 * @param color Color data with id=null for new color
 * @returns Promise with the created color
 */
export const createColor = async (color: { name: string, hexCode: string, id: null }): Promise<Color> => {
    try {
        const response = await privateAPI.post<ApiResponse<Color>>('/colors', {
            id: null,
            name: color.name,
            hexCode: color.hexCode
        });
        return response;
    } catch (error) {
        console.error('Error creating color:', error);
        throw error;
    }
};
