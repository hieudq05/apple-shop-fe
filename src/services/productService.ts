import { publicAPI, privateAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    categoryId: number;
    features: Array<{
        id: number;
        name: string;
        description: string;
        image: string;
    }>;
    stocks: Array<{
        id: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        quantity: number;
        price: number;
        productPhotos: Array<{
            id: number;
            imageUrl: string;
            alt: string;
        }>;
        instanceProperties: Array<{
            id: number;
            name: string;
        }>;
    }>;
    rating?: number;
    reviewCount?: number;
    isWishlisted?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    image: string;
    productCount?: number;
}

export interface Params {
    page?: number;
    size?: number;
}

class ProductService {
    /**
     * Get all products with pagination and filters
     */
    async getProducts(params: Params = {}): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                "/api/v1/products",
                {
                    params,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    async getProductById(
        productId: number,
        categoryId: number
    ): Promise<ApiResponse<Product>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product>>(
                `/products/${categoryId}/${productId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(
        categoryId: number,
        params: Params = {}
    ): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                `/products/${categoryId}`,
                {
                    params,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching products by category:", error);
            throw error;
        }
    }

    /**
     * Search products
     */
    async searchProducts(
        query: string,
        params: Params = {}
    ): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                "/api/v1/products/search",
                {
                    params: { ...params, search: query },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error searching products:", error);
            throw error;
        }
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<ApiResponse<Category[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Category[]>>(
                "/api/v1/categories"
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId: number): Promise<ApiResponse<Category>> {
        try {
            const response = await publicAPI.get<ApiResponse<Category>>(
                `/api/v1/categories/${categoryId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching category:", error);
            throw error;
        }
    }

    /**
     * Get featured products
     */
    async getFeaturedProducts(
        limit: number = 8
    ): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                "/api/v1/products/featured",
                {
                    params: { limit },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching featured products:", error);
            throw error;
        }
    }

    /**
     * Get related products
     */
    async getRelatedProducts(
        productId: number,
        limit: number = 4
    ): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                `/api/v1/products/${productId}/related`,
                {
                    params: { limit },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching related products:", error);
            throw error;
        }
    }

    /**
     * Get top selling products by category
     */
    async getTopSellingProducts(
        categoryId: number,
        page: number = 0,
        size: number = 10
    ): Promise<ApiResponse<Product[]>> {
        try {
            const response = await publicAPI.get<ApiResponse<Product[]>>(
                `/products/${categoryId}/top_selling`,
                {
                    params: { page, size },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching top selling products:", error);
            throw error;
        }
    }

    /**
     * Add product to wishlist (requires authentication)
     */
    async addToWishlist(productId: number): Promise<ApiResponse<unknown>> {
        try {
            const response = await privateAPI.post<ApiResponse<unknown>>(
                `/api/v1/user/wishlist/${productId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    }

    /**
     * Remove product from wishlist (requires authentication)
     */
    async removeFromWishlist(productId: number): Promise<ApiResponse<unknown>> {
        try {
            const response = await privateAPI.delete<ApiResponse<unknown>>(
                `/api/v1/user/wishlist/${productId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    }

    /**
     * Get user's wishlist (requires authentication)
     */
    async getWishlist(): Promise<ApiResponse<Product[]>> {
        try {
            const response = await privateAPI.get<ApiResponse<Product[]>>(
                "/api/v1/user/wishlist"
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            throw error;
        }
    }
}

const productService = new ProductService();
export default productService;
