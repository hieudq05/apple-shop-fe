import {privateAPI, publicAPI} from '../utils/axios';
import type {ApiResponse} from '../types/api';

export interface Instance {
    id: number | null;
    name: string;
    description?: string;
}

/**
 * Fetch all instances from the API
 * @returns Promise with all instances
 */
export const fetchInstances = async (): Promise<Instance[]> => {
    try {
        const response = await publicAPI.get<ApiResponse<Instance[]>>('/instances');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching instances:', error);
        throw error;
    }
};

/**
 * Fetch instances for admin from the API
 * @returns Promise with all instances for admin
 */
export const fetchAdminInstances = async (): Promise<Instance[]> => {
    try {
        const response = await privateAPI.get<ApiResponse<Instance[]>>('/instances', {
            params: {
                size: 99
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching admin instances:', error);
        throw error;
    }
};

/**
 * Create a new instance
 * @param instance Instance data with id=null for new instance
 * @returns Promise with the created instance
 */
export const createInstance = async (instance: { name: string, description?: string, id: null }): Promise<Instance> => {
    try {
        const response = await privateAPI.post<ApiResponse<Instance>>('/instances', {
            id: null,
            name: instance.name,
            description: instance.description || ''
        });
        return response.data;
    } catch (error) {
        console.error('Error creating instance:', error);
        throw error;
    }
};
