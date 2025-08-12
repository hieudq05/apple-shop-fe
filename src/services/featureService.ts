import { privateAPI, publicAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

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
export const fetchFeatures = async (): Promise<ApiResponse<Feature[]>> => {
    try {
        const response = await publicAPI.get<ApiResponse<Feature[]>>(
            "/features"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching features:", error);
        throw error;
    }
};

/**
 * Fetch features for admin from the API
 * @returns Promise with all features for admin
 */
export const fetchAdminFeatures = async (): Promise<ApiResponse<Feature[]>> => {
    try {
        const response = await privateAPI.get<ApiResponse<Feature[]>>(
            "/features",
            {
                params: {
                    size: 99,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching admin features:", error);
        throw error;
    }
};

/**
 * Create a new feature
 * @param feature Feature data with id=null for new feature
 * @param imageFile Image file for the feature
 * @returns Promise with the created feature
 */
export const createFeature = async (
    feature: { name: string; description: string; id: null },
    imageFile?: File
): Promise<ApiResponse<Feature>> => {
    try {
        if (imageFile) {
            const formData = new FormData();
            formData.append("name", feature.name);
            formData.append("description", feature.description);
            formData.append("image", imageFile);
            formData.append(
                "featureData",
                JSON.stringify({
                    id: null,
                    name: feature.name,
                    description: feature.description,
                })
            );

            const response = await privateAPI.post<ApiResponse<Feature>>(
                "/features",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } else {
            // Handle case when imageFile is not provided
            const response = await privateAPI.post<ApiResponse<Feature>>(
                "/features",
                {
                    id: null,
                    name: feature.name,
                    description: feature.description,
                }
            );
            return response.data;
        }
    } catch (error) {
        console.error("Error creating feature:", error);
        throw error;
    }
};

/**
 * Update an existing feature
 * @param feature Feature data with existing id
 * @param imageFile Optional new image file for the feature
 * @returns Promise with the updated feature
 */
export const updateFeature = async (
    feature: Feature,
    imageFile?: File
): Promise<ApiResponse<Feature>> => {
    try {
        if (imageFile) {
            const formData = new FormData();
            formData.append("name", feature.name);
            formData.append("description", feature.description);
            formData.append("image", imageFile);
            formData.append(
                "featureData",
                JSON.stringify({
                    id: feature.id,
                    name: feature.name,
                    description: feature.description,
                })
            );

            const response = await privateAPI.put<ApiResponse<Feature>>(
                `/features/${feature.id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } else {
            // Update feature without changing image
            const response = await privateAPI.put<ApiResponse<Feature>>(
                `/features/${feature.id}`,
                {
                    id: feature.id,
                    name: feature.name,
                    description: feature.description,
                    image: feature.image,
                }
            );
            return response.data;
        }
    } catch (error) {
        console.error("Error updating feature:", error);
        throw error;
    }
};

/**
 * Delete a feature
 * @param id Feature ID to delete
 * @returns Promise with success message
 */
export const deleteFeature = async (id: number): Promise<ApiResponse<void>> => {
    try {
        const response = await privateAPI.delete(`/features/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting feature:", error);
        throw error;
    }
};
