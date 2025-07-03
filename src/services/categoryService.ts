import {privateAPI, publicAPI} from '../utils/axios';
import type {ApiResponse, MetadataResponse} from '../types/api';

export interface Category {
    id: number | null;
    name: string;
    image: string;
}

/**
 * Fetch all categories from the API
 * @returns Promise with all categories
 */
export const fetchCategories = async (): Promise<Category[]> => {
    try {
        // Sử dụng publicAPI vì đây là thông tin không yêu cầu quyền admin
        const response = await publicAPI.get<ApiResponse<Category[]>>('/categories');
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Fetch categories for admin from the API with pagination
 * @param page Page number (0-based)
 * @param size Number of items per page
 * @returns Promise with paginated categories and metadata
 */
export const fetchAdminCategories = async (params): Promise<{}> => {
    try {
        // Sử dụng privateAPI vì đây là thông tin yêu cầu quyền admin
        return await privateAPI.get<ApiResponse<Category[]>>('/categories', {
            params
        });
    } catch (error) {
        console.error('Error fetching admin categories:', error);
        throw error;
    }
};

/**
 * Create a new category
 * @param category Category data with id=null for new category
 * @param imageFile Image file for the category
 * @returns Promise with the created category
 */
export const createCategory = async (category: { name: string, id: null }, imageFile: File): Promise<Category> => {
    try {
        const formData = new FormData();
        formData.append('name', category.name);
        formData.append('image', imageFile);
        // id là null khi tạo mới category
        formData.append('categoryData', JSON.stringify({id: null, name: category.name}));

        const response = await privateAPI.post<ApiResponse<Category>>('/categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data.data) {
            throw new Error('No category data returned from server');
        }
        return response.data.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Update an existing category
 * @param category Category data with existing id
 * @param imageFile Optional image file if updating the image
 * @returns Promise with the updated category
 */
export const updateCategory = async (category: Category, imageFile?: File): Promise<Category> => {
    try {
        const formData = new FormData();
        formData.append('name', category.name);

        // Chỉ thêm ảnh nếu có cung cấp
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Đảm bảo id được truyền cho category đã tồn tại
        formData.append('categoryData', JSON.stringify({
            id: category.id,
            name: category.name
        }));

        const response = await privateAPI.put<ApiResponse<Category>>(`/categories/${category.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data.data) {
            throw new Error('No category data returned from server');
        }
        return response.data.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

/**
 * Get a category by its ID
 * @param id Category ID
 * @returns Promise with the category
 */
export const getCategoryById = async (id: number): Promise<Category> => {
    try {
        const response = await publicAPI.get<ApiResponse<Category>>(`/categories/${id}`);
        if (!response.data.data) {
            throw new Error('Category not found');
        }
        return response.data.data;
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
export const deleteCategory = async (id: number): Promise<void> => {
    try {
        await privateAPI.delete(`/categories/${id}`);
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};
