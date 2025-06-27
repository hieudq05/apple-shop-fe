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
    description: string;
    createdBy: string;
    category: {
        id?: number;
        name?: string;
        image?: any;
    };
    features: Array<{
        id?: number;
        name?: string;
        description?: string;
        image: any;
    }>;
    stocks: Array<{
        color: {
            id?: number;
            name?: string;
            hexCode?: string;
        };
        quantity: number;
        price: number;
        productPhotos: Array<{
            imageUrl: any;
            alt?: string;
        }>;
        instanceProperties: Array<{
            id?: number;
            name?: string;
        }>;
    }>;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: number;
}

// Normalization interfaces for complete product data
interface CompleteCategory {
    id: number;
    name: string;
    image?: string;
}

interface CompleteFeature {
    id: number;
    name: string;
    description?: string;
    image?: string;
}

interface CompleteColor {
    id: number;
    name: string;
    hex?: string;
    hexCode?: string;
}

interface CompleteInstanceProperty {
    id: number;
    name: string;
    value?: string;
}

interface CompleteStock {
    id: number | null;
    color: CompleteColor;
    instanceProperties?: CompleteInstanceProperty[];
    quantity: number;
    price: number;
    productPhotos?: any[];
    photos?: string[];
}

interface CompleteProductData {
    id?: number;
    name: string;
    title?: string;
    description?: string;
    category: CompleteCategory;
    features?: CompleteFeature[];
    stocks: CompleteStock[];
    isActive?: boolean;
}

/**
 * Product Data Normalization Service
 * Ensures data integrity by filling missing fields with complete information
 */
class ProductDataNormalizer {
    private static instance: ProductDataNormalizer;
    private categoryCache = new Map<number, CompleteCategory>();
    private colorCache = new Map<number, CompleteColor>();
    private featureCache = new Map<number, CompleteFeature>();

    static getInstance(): ProductDataNormalizer {
        if (!ProductDataNormalizer.instance) {
            ProductDataNormalizer.instance = new ProductDataNormalizer();
        }
        return ProductDataNormalizer.instance;
    }

    /**
     * Fetch and cache category data
     */
    private async fetchCategoryData(categoryId: number): Promise<CompleteCategory> {
        if (this.categoryCache.has(categoryId)) {
            return this.categoryCache.get(categoryId)!;
        }

        try {
            const response = await privateAPI.get<ApiResponse<CompleteCategory>>(`/categories/${categoryId}`);
            const category = response.data.data;
            this.categoryCache.set(categoryId, category);
            return category;
        } catch (error) {
            console.warn(`Failed to fetch category ${categoryId}:`, error);
            // Return minimal category data as fallback
            return { id: categoryId, name: `Category ${categoryId}` };
        }
    }

    /**
     * Fetch and cache color data
     */
    private async fetchColorData(colorId: number): Promise<CompleteColor> {
        if (this.colorCache.has(colorId)) {
            return this.colorCache.get(colorId)!;
        }

        try {
            const response = await privateAPI.get<ApiResponse<CompleteColor>>(`/colors/${colorId}`);
            const color = response.data.data;
            this.colorCache.set(colorId, color);
            return color;
        } catch (error) {
            console.warn(`Failed to fetch color ${colorId}:`, error);
            // Return minimal color data as fallback
            return { id: colorId, name: `Color ${colorId}`, hex: "#000000" };
        }
    }

    /**
     * Fetch and cache feature data
     */
    private async fetchFeatureData(featureId: number): Promise<CompleteFeature> {
        if (this.featureCache.has(featureId)) {
            return this.featureCache.get(featureId)!;
        }

        try {
            const response = await privateAPI.get<ApiResponse<CompleteFeature>>(`/features/${featureId}`);
            const feature = response.data.data;
            this.featureCache.set(featureId, feature);
            return feature;
        } catch (error) {
            console.warn(`Failed to fetch feature ${featureId}:`, error);
            // Return minimal feature data as fallback
            return { id: featureId, name: `Feature ${featureId}` };
        }
    }

    /**
     * Normalize category data
     */
    private async normalizeCategory(category: any, categoryId?: number): Promise<CompleteCategory> {
        if (!category || !category.id) {
            if (categoryId) {
                return await this.fetchCategoryData(categoryId);
            }
            throw new Error("Category data is required");
        }

        // If category data is incomplete, fetch complete data
        if (!category.name || !category.image) {
            const completeCategory = await this.fetchCategoryData(category.id);
            return {
                ...category,
                ...completeCategory
            };
        }

        return category;
    }

    /**
     * Normalize features data
     */
    private async normalizeFeatures(features: any[]): Promise<CompleteFeature[]> {
        if (!features || !Array.isArray(features)) {
            return [];
        }

        const normalizedFeatures = await Promise.all(
            features.map(async (feature) => {
                if (!feature || !feature.id) {
                    return null;
                }

                // If feature data is incomplete, fetch complete data
                if (!feature.description || !feature.image) {
                    const completeFeature = await this.fetchFeatureData(feature.id);
                    return {
                        ...feature,
                        ...completeFeature
                    };
                }

                return feature;
            })
        );

        return normalizedFeatures.filter(Boolean) as CompleteFeature[];
    }

    /**
     * Normalize color data
     */
    private async normalizeColor(color: any): Promise<CompleteColor> {
        if (!color || !color.id) {
            throw new Error("Color data is required");
        }

        // If color data is incomplete, fetch complete data
        if (!color.hex && !color.hexCode) {
            const completeColor = await this.fetchColorData(color.id);
            return {
                ...color,
                ...completeColor
            };
        }

        return color;
    }

    /**
     * Normalize stocks data
     */
    private async normalizeStocks(stocks: any[]): Promise<CompleteStock[]> {
        if (!stocks || !Array.isArray(stocks)) {
            return [];
        }

        const normalizedStocks = await Promise.all(
            stocks.map(async (stock) => {
                if (!stock) {
                    return null;
                }

                // Normalize color data
                const normalizedColor = await this.normalizeColor(stock.color);

                return {
                    id: stock.id,
                    color: normalizedColor,
                    instanceProperties: stock.instanceProperties || [],
                    quantity: stock.quantity || 0,
                    price: stock.price || 0,
                    productPhotos: stock.productPhotos || [],
                    photos: stock.photos || []
                };
            })
        );

        return normalizedStocks.filter(Boolean) as CompleteStock[];
    }

    /**
     * Main normalization function
     */
    async normalizeProductData(productData: any, categoryId?: number): Promise<CompleteProductData> {
        try {
            // Normalize category
            const normalizedCategory = await this.normalizeCategory(productData.category, categoryId);

            // Normalize features
            const normalizedFeatures = await this.normalizeFeatures(productData.features);

            // Normalize stocks
            const normalizedStocks = await this.normalizeStocks(productData.stocks);

            return {
                id: productData.id,
                name: productData.name || '',
                title: productData.title || productData.name || '',
                description: productData.description || '',
                category: normalizedCategory,
                features: normalizedFeatures,
                stocks: normalizedStocks,
                isActive: productData.isActive ?? true
            };
        } catch (error) {
            console.error("Error normalizing product data:", error);
            throw new Error(`Product data normalization failed: ${error}`);
        }
    }

    /**
     * Clear cache (useful for testing or when data is updated)
     */
    clearCache(): void {
        this.categoryCache.clear();
        this.colorCache.clear();
        this.featureCache.clear();
    }
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
     * Create new product with proper form-data format
     */
    async createProduct(
        productData: CreateProductRequest,
        imageFiles: { [key: string]: File }
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            // Create FormData instance
            const formData = new FormData();

            // Add product data as JSON string
            formData.append('product', JSON.stringify(productData));

            // Add image files with their placeholder keys
            Object.entries(imageFiles).forEach(([placeholder, file]) => {
                if (file instanceof File) {
                    formData.append(placeholder, file);
                }
            });

            const response = await privateAPI.post<ApiResponse<AdminProduct>>(
                "/products",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }

    /**
     * Legacy createProduct method (keeping for backward compatibility)
     */
    async createProductLegacy(
        productData: FormData
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            const response = await privateAPI.post<ApiResponse<AdminProduct>>(
                "/products",
                productData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }

    /**
     * Update existing product with multipart/form-data
     */
    async updateProduct(
        productId: number,
        categoryId: number,
        productData: any, // The complete product object
        newImageFiles: Record<string, File> = {}, // Map of placeholder -> File
        photoDeletionIds: number[] = [] // Array of photo IDs to delete
    ): Promise<ApiResponse<AdminProduct>> {
        try {
            // Create FormData
            const formData = new FormData();

            // Add product as JSON string - this matches @RequestPart("product") String productJson
            formData.append('product', JSON.stringify(productData));

            // Add photo deletions as separate RequestPart - backend expects @RequestPart("productPhotoDeletions") Integer[]
            // We need to send this as a JSON string that can be parsed to Integer array
            const deletionsBlob = new Blob([JSON.stringify(photoDeletionIds)], { type: 'application/json' });
            formData.append('productPhotoDeletions', deletionsBlob);

            // Add new image files with their placeholder keys - these go to @RequestParam Map<String, MultipartFile> files
            Object.entries(newImageFiles).forEach(([placeholder, file]) => {
                formData.append(placeholder, file);
            });

            console.log('Product data sent to API:', productData);

            const response = await privateAPI.put<ApiResponse<AdminProduct>>(
                `/products/${categoryId}/${productId}`,
                formData,
                {
                    headers: {
                        'Content-Type': "multipart/form-data",
                    },
                }
            );
            return response.data;
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
            return response.data;
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
            return response.data;
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
            return response.data;
        } catch (error) {
            console.error("Error fetching product statistics:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const adminProductService = new AdminProductService();
export default adminProductService;

// Export singleton instance
export const productDataNormalizer = ProductDataNormalizer.getInstance();
