import { privateAPI, publicAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

export interface Category {
    id: number | null;
    name: string;
    description: string;
    image: string;
    products?: Array<{
        id: number;
        name: string;
    }>;
}

export interface CategoryRequest {
    name: string;
    description?: string;
    image?: string; // Optional image file for new categories
}

/**
 * Fetch all categories from the API
 * @returns Promise with all categories
 */
export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
    try {
        // Sử dụng publicAPI vì đây là thông tin không yêu cầu quyền admin
        const response = await publicAPI.get<ApiResponse<Category[]>>(
            "/categories"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

/**
 * Fetch categories for admin from the API with pagination
 * @param page Page number (0-based)
 * @param size Number of items per page
 * @returns Promise with paginated categories and metadata
 */
export const fetchAdminCategories = async (
    params?: Record<string, any>
): Promise<ApiResponse<Category[]>> => {
    try {
        // Sử dụng privateAPI vì đây là thông tin yêu cầu quyền admin
        const response = await privateAPI.get<ApiResponse<Category[]>>(
            "/categories",
            {
                params,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching admin categories:", error);
        throw error;
    }
};

/**
 * Create a new category
 * @param category Category data with id=null for new category
 * @param imageFile Image file for the category
 * @returns Promise with the created category
 */
export const createCategory = async (
    category: CategoryRequest,
    imageFile: File
): Promise<ApiResponse<Category>> => {
    try {
        const formData = new FormData();

        formData.append(
            "category",
            new Blob([JSON.stringify(category)], { type: "application/json" })
        );

        formData.append("image", imageFile ? imageFile : new File([], ""));

        const response = await privateAPI.post<ApiResponse<Category>>(
            "/categories",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (!response.data.success) {
            throw new Error("No category data returned from server");
        }
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

/**
 * Update an existing category
 * @param category Category data with existing id
 * @param imageFile Optional image file if updating the image
 * @returns Promise with the updated category
 */
export const updateCategory = async (
    category: CategoryRequest,
    categoryId: number,
    imageFile?: File
): Promise<ApiResponse<Category>> => {
    try {
        const formData = new FormData();

        formData.append(
            "category",
            new Blob([JSON.stringify(category)], { type: "application/json" })
        );

        formData.append("image", imageFile ? imageFile : new File([], ""));

        const response = await privateAPI.put<ApiResponse<Category>>(
            `/categories/${categoryId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.data.success === false) {
            throw new Error("No category data returned from server");
        }
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

/**
 * Get a category by its ID
 * @param id Category ID
 * @returns Promise with the category
 */
export const getCategoryById = async (
    id: number
): Promise<ApiResponse<Category>> => {
    try {
        const response = await publicAPI.get<ApiResponse<Category>>(
            `/categories/${id}`
        );
        if (!response.data.success) {
            throw new Error("Category not found");
        }
        return response.data;
    } catch (error) {
        console.error(`Error fetching category with id ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a category by its ID
 * @param id Category ID to delete
 * @returns Promise with void
 */
export const deleteCategory = async (
    id: number
): Promise<ApiResponse<void>> => {
    try {
        const response = await privateAPI.delete<ApiResponse<void>>(
            `/categories/${id}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};
