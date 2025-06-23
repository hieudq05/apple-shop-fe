// Admin Product service for admin product operations
import { privateAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

// Admin Product interfaces
export interface AdminProduct {
    id: number;
    name: string;
    title: string;
    description?: string;
    category: {
        id: number;
        name: string;
        slug?: string;
    };
    features?: Array<{
        id: number;
        name: string;
        value: string;
    }>;
    stocks: Array<{
        id: number;
        color: {
            id: number;
            name: string;
            hex: string;
        };
        instanceProperties?: Array<{
            id: number;
            name: string;
        }>;
        quantity: number;
        price: number;
        photos?: string[];
    }>;
    createdAt: string;
    updatedAt: string;
    isActive?: boolean;
    totalSold?: number;
    totalRevenue?: number;
    averageRating?: number;
    reviewCount?: number;
}

export interface AdminProductsParams {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
}

export interface CreateProductRequest {
    name: string;
    title: string;
    description: string;
    categoryId: number;
    features: Array<{
        name: string;
        value: string;
    }>;
    stocks: Array<{
        colorId: number;
        quantity: number;
        price: number;
        photos: string[];
    }>;
    instanceProperties: Array<{
        name: string;
        value: string;
    }>;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: number;
}

export class AdminProductService {
    /**
     * Get all products for admin with pagination and filters
     */
    async getAdminProducts(
        params: AdminProductsParams = {}
    ): Promise<ApiResponse<AdminProduct[]>> {
        try {
            const response = await privateAPI.get<ApiResponse<AdminProduct[]>>(
                "/products",
                {
                    params,
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching admin products:", error);
            throw error;
        }
    }

    /**
     * Get product by ID for admin
     */
    async getAdminProductById(
        categoryId: number,
        productId: number
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            const response = await privateAPI.get<ApiResponse<AdminProduct>>(
                `/products/${categoryId}/${productId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching admin product:", error);
            throw error;
        }
    }

    /**
     * Create new product
     */
    async createProduct(
        productData: CreateProductRequest
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            const response = await privateAPI.post<ApiResponse<AdminProduct>>(
                "/products",
                productData
            );
            return response;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }

    /**
     * Update existing product
     */
    async updateProduct(
        productId: number,
        productData: UpdateProductRequest
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            const response = await privateAPI.put<ApiResponse<AdminProduct>>(
                `/products/${productId}`,
                productData
            );
            return response;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(productId: number): Promise<ApiResponse<void>> {
        try {
            const response = await privateAPI.delete<ApiResponse<void>>(
                `/products/${productId}`
            );
            return response;
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    }

    /**
     * Toggle product active status
     */
    async toggleProductStatus(
        productId: number
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            const response = await privateAPI.patch<ApiResponse<AdminProduct>>(
                `/products/${productId}/toggle-status`
            );
            return response;
        } catch (error) {
            console.error("Error toggling product status:", error);
            throw error;
        }
    }

    /**
     * Get product statistics
     */
    async getProductStatistics(productId: number): Promise<ApiResponse<any>> {
        try {
            const response = await privateAPI.get<ApiResponse<any>>(
                `/products/${productId}/statistics`
            );
            return response;
        } catch (error) {
            console.error("Error fetching product statistics:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const adminProductService = new AdminProductService();
export default adminProductService;
