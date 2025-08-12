import type { ApiResponse } from "@/types/api";
import { publicAPI } from "../utils/axios";

export interface SearchFilters {
    name?: string;
    description?: string;
    categoryId?: number[];
    categoryName?: string[];
    featureIds?: number[];
    featureNames?: string[];
    colorIds?: number[];
    colorNames?: string[];
    minPrice?: number;
    maxPrice?: number;
    instancePropertyIds?: number[];
    instancePropertyNames?: string[];
    searchKeyword?: string;
    hasReviews?: boolean;
    minRating?: number;
    maxRating?: number;
    inStock?: boolean;
    page?: number;
}

export interface Color {
    id: number;
    name: string;
    hexCode: string;
}

export interface ProductPhoto {
    id: number;
    imageUrl: string;
    alt: string;
}

export interface InstanceProperty {
    id: number;
    name: string;
}

export interface Stock {
    id: number;
    color: Color;
    quantity: number;
    price: number;
    productPhotos: ProductPhoto[];
    instanceProperty: InstanceProperty[];
}

export interface SearchProduct {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    stocks: Stock[];
}

class SearchService {
    async searchProducts(
        filters: SearchFilters
    ): Promise<ApiResponse<SearchProduct[]>> {
        try {
            // Prepare request body with all filters
            const requestBody: Partial<SearchFilters> = {};

            // Add search parameters
            if (filters.name) requestBody.name = filters.name;
            if (filters.description)
                requestBody.description = filters.description;
            if (filters.searchKeyword)
                requestBody.searchKeyword = filters.searchKeyword;

            // Category filters
            if (filters.categoryId?.length) {
                requestBody.categoryId = filters.categoryId;
            }
            if (filters.categoryName?.length) {
                requestBody.categoryName = filters.categoryName;
            }

            // Feature filters
            if (filters.featureIds?.length) {
                requestBody.featureIds = filters.featureIds;
            }
            if (filters.featureNames?.length) {
                requestBody.featureNames = filters.featureNames;
            }

            // Color filters
            if (filters.colorIds?.length) {
                requestBody.colorIds = filters.colorIds;
            }
            if (filters.colorNames?.length) {
                requestBody.colorNames = filters.colorNames;
            }

            // Price range
            if (filters.minPrice !== undefined)
                requestBody.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined)
                requestBody.maxPrice = filters.maxPrice;

            // Instance property filters
            if (filters.instancePropertyIds?.length) {
                requestBody.instancePropertyIds = filters.instancePropertyIds;
            }
            if (filters.instancePropertyNames?.length) {
                requestBody.instancePropertyNames =
                    filters.instancePropertyNames;
            }

            // Advanced filters
            if (filters.hasReviews !== undefined)
                requestBody.hasReviews = filters.hasReviews;
            if (filters.minRating !== undefined)
                requestBody.minRating = filters.minRating;
            if (filters.maxRating !== undefined)
                requestBody.maxRating = filters.maxRating;
            if (filters.inStock !== undefined)
                requestBody.inStock = filters.inStock;

            const response = await publicAPI.post(
                "/products/search",
                requestBody
            );
            return response.data;
        } catch (error) {
            console.error("Error searching products:", error);
            throw error;
        }
    }
}

export default new SearchService();
