// Saved Product service for managing saved/favorite products
import { userRoleAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

export interface SavedProduct {
    stock: {
        id: number;
        product: {
            id: number;
            name: string;
        };
        categoryId: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        price: number;
        productPhotos: {
            id: number;
            imageUrl: string;
            alt?: string;
        }[];
        instanceProperties: {
            id: number;
            name: string;
            value?: string;
        }[];
    };
    createdAt: string;
}

export interface SavedProductRequest {
    stockId: number;
}

export interface SavedProductStatus {
    isSaved: boolean;
    savedProductId?: number;
}

class SavedProductService {
    /**
     * Check if a stock is saved by the current user
     */
    async checkSavedStatus(
        stockId: number
    ): Promise<ApiResponse<SavedProductStatus>> {
        try {
            const response = await userRoleAPI.get<
                ApiResponse<SavedProductStatus>
            >(`/saved-products/${stockId}/is-saved`);
            return response.data;
        } catch (error) {
            console.error("Error checking saved status:", error);
            throw error;
        }
    }

    /**
     * Save a product (add to favorites)
     */
    async saveProduct(stockId: number): Promise<ApiResponse<SavedProduct>> {
        try {
            const response = await userRoleAPI.post<ApiResponse<SavedProduct>>(
                "/saved-products/" + stockId
            );
            return response.data;
        } catch (error) {
            console.error("Error saving product:", error);
            throw error;
        }
    }

    /**
     * Unsave a product (remove from favorites)
     */
    async unsaveProduct(stockId: number): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.delete<ApiResponse<void>>(
                `/saved-products/${stockId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error unsaving product:", error);
            throw error;
        }
    }

    /**
     * Get user's saved products
     */
    async getSavedProducts(): Promise<ApiResponse<SavedProduct[]>> {
        try {
            const response = await userRoleAPI.get<ApiResponse<SavedProduct[]>>(
                "/saved-products"
            );

            return response.data;
        } catch (error: unknown) {
            console.error("Error getting saved products:", error);
            const err = error as { response?: { data?: { message?: string } } };
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Không thể tải danh sách sản phẩm đã lưu",
            };
        }
    }

    /**
     * Clear all saved products
     */
    async clearAllSavedProducts(): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.delete(
                "/saved-products/clear-all"
            );
            return response.data;
        } catch (error: unknown) {
            console.error("Error clearing all saved products:", error);
            throw error;
        }
    }
}

// Export a singleton instance
const savedProductService = new SavedProductService();
export default savedProductService;
