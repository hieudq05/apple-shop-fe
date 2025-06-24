import {privateAPI, publicAPI} from '../utils/axios';
import type {ApiResponse} from '../types/api';

export interface Feature {
    id: number | null;
    name: string;
    description: string;
    image: string;
}

/**
 * Fetch all features from the API
 * @returns Promise with all features
 */
export const fetchFeatures = async (): Promise<Feature[]> => {
    try {
        const response = await publicAPI.get<ApiResponse<Feature[]>>('/features');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching features:', error);
        throw error;
    }
};

/**
 * Fetch features for admin from the API
 * @returns Promise with all features for admin
 */
export const fetchAdminFeatures = async (): Promise<Feature[]> => {
    try {
        const response = await privateAPI.get<ApiResponse<Feature[]>>('/features', {
            params: {
                size: 99
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin features:', error);
        throw error;
    }
};

/**
 * Create a new feature
 * @param feature Feature data with id=null for new feature
 * @param imageFile Image file for the feature
 * @returns Promise with the created feature
 */
export const createFeature = async (feature: { name: string, description: string, id: null }, imageFile: File): Promise<Feature> => {
    try {
        const formData = new FormData();
        formData.append('name', feature.name);
        formData.append('description', feature.description);
        formData.append('image', imageFile);
        formData.append('featureData', JSON.stringify({
            id: null,
            name: feature.name,
            description: feature.description
        }));

        const response = await privateAPI.post<ApiResponse<Feature>>('/features', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating feature:', error);
        throw error;
    }
};
