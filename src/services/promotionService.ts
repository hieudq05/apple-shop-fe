import type { ApiResponse } from "@/types/api";
import { privateAPI } from "../utils/axios";

export interface CreatedBy {
    id: number;
    firstName: string;
    lastName: string;
    image?: string;
}

export interface Promotion {
    id: number;
    name: string;
    code: string;
    promotionType: "PERCENTAGE" | "FIXED_AMOUNT" | "SHIPPING_DISCOUNT";
    value: number;
    maxDiscountAmount?: number;
    minOrderValue?: number;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    createdBy: CreatedBy;
}

export interface PromotionParams {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
}

export interface PromotionSearchParams {
    keyword?: string; // Tìm kiếm theo tên hoặc mã
    id?: number; // Tìm kiếm theo id
    code?: string; // Tìm kiếm chính xác theo mã
    promotionType?: "PERCENTAGE" | "FIXED_AMOUNT" | "SHIPPING_DISCOUNT"; // Loại giảm giá
    isActive?: boolean; // Trạng thái active
    applyOn?: boolean; // Áp dụng cho sản phẩm/danh mục cụ thể
    startDateFrom?: string; // Tìm kiếm theo ngày bắt đầu từ (yyyy-MM-dd HH:mm:ss)
    startDateTo?: string; // Tìm kiếm theo ngày bắt đầu đến
    endDateFrom?: string; // Tìm kiếm theo ngày kết thúc từ
    endDateTo?: string; // Tìm kiếm theo ngày kết thúc đến
    valueFrom?: number; // Giá trị giảm từ
    valueTo?: number; // Giá trị giảm đến
    minOrderValueFrom?: number; // Giá trị đơn hàng tối thiểu từ
    minOrderValueTo?: number; // Giá trị đơn hàng tối thiểu đến
    usageLimitFrom?: number; // Giới hạn sử dụng từ
    usageLimitTo?: number; // Giới hạn sử dụng đến
    usageCountFrom?: number; // Số lần đã sử dụng từ
    usageCountTo?: number; // Số lần đã sử dụng đến
    page?: number;
    size?: number;
}

export interface CreatePromotionData {
    name: string;
    code: string;
    promotionType: "PERCENTAGE" | "FIXED_AMOUNT" | "SHIPPING_DISCOUNT";
    value: number;
    maxDiscountAmount?: number;
    minOrderValue?: number;
    usageLimit: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const promotionService = {
    // Get all promotions with pagination and filters
    getPromotions: async (
        params: PromotionParams = {}
    ): Promise<ApiResponse<Promotion[]>> => {
        try {
            const searchParams = new URLSearchParams();

            if (params.page !== undefined)
                searchParams.append("page", params.page.toString());
            if (params.size !== undefined)
                searchParams.append("size", params.size.toString());
            if (params.search) searchParams.append("search", params.search);
            if (params.status) searchParams.append("status", params.status);

            const response = await privateAPI.get(
                `/promotions?page=${params.page || 0}&size=${params.size || 6}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching promotions:", error);
            throw error;
        }
    },

    // Advanced search promotions
    searchPromotions: async (
        searchParams: PromotionSearchParams = {}
    ): Promise<ApiResponse<Promotion[]>> => {
        try {
            const response = await privateAPI.post(
                `/promotions/search?page=${searchParams.page || 0}&size=${
                    searchParams.size || 6
                }`,
                searchParams
            );
            return response.data;
        } catch (error) {
            console.error("Error searching promotions:", error);
            throw error;
        }
    },

    // Get promotion by ID
    getPromotionById: async (id: number): Promise<ApiResponse<Promotion>> => {
        try {
            const response = await privateAPI.get(`/promotions/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching promotion:", error);
            throw error;
        }
    },

    // Create new promotion
    createPromotion: async (
        data: CreatePromotionData
    ): Promise<ApiResponse<Promotion>> => {
        try {
            const response = await privateAPI.post("/promotions", data);
            return response.data;
        } catch (error) {
            console.error("Error creating promotion:", error);
            throw error;
        }
    },

    // Update existing promotion
    updatePromotion: async (
        id: number,
        data: Partial<CreatePromotionData>
    ): Promise<ApiResponse<Promotion>> => {
        try {
            const response = await privateAPI.put(`/promotions/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating promotion:", error);
            throw error;
        }
    },

    // Delete promotion
    deletePromotion: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await privateAPI.delete(`/promotions/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting promotion:", error);
            throw error;
        }
    },

    // Toggle promotion status
    togglePromotionStatus: async (
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<void>> => {
        try {
            const response = await privateAPI.put(
                `/promotions/${id}/toggle-status`,
                { isActive }
            );
            return response.data;
        } catch (error) {
            console.error("Error toggling promotion status:", error);
            throw error;
        }
    },
};

export default promotionService;
