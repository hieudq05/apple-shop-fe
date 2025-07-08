import { privateAPI } from '../utils/axios';

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
    promotionType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SHIPPING_DISCOUNT';
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

export interface PromotionResponse {
    success: boolean;
    msg: string;
    data: Promotion[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

export interface PromotionParams {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
}

export interface CreatePromotionData {
    name: string;
    code: string;
    promotionType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SHIPPING_DISCOUNT';
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
    getPromotions: async (params: PromotionParams = {}): Promise<PromotionResponse> => {
        try {
            const searchParams = new URLSearchParams();
            
            if (params.page !== undefined) searchParams.append('page', params.page.toString());
            if (params.size !== undefined) searchParams.append('size', params.size.toString());
            if (params.search) searchParams.append('search', params.search);
            if (params.status) searchParams.append('status', params.status);

            const response = await privateAPI.get(`/promotions?${searchParams.toString()}`);
            return response;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error;
        }
    },

    // Get promotion by ID
    getPromotionById: async (id: number): Promise<{ success: boolean; msg: string; data: Promotion }> => {
        try {
            const response = await privateAPI.get(`/promotions/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching promotion:', error);
            throw error;
        }
    },

    // Create new promotion
    createPromotion: async (data: CreatePromotionData): Promise<{ success: boolean; msg: string; data: Promotion }> => {
        try {
            const response = await privateAPI.post('/promotions', data);
            return response;
        } catch (error) {
            console.error('Error creating promotion:', error);
            throw error;
        }
    },

    // Update existing promotion
    updatePromotion: async (id: number, data: Partial<CreatePromotionData>): Promise<{ success: boolean; msg: string; data: Promotion }> => {
        try {
            const response = await privateAPI.put(`/promotions/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating promotion:', error);
            throw error;
        }
    },

    // Delete promotion
    deletePromotion: async (id: number): Promise<{ success: boolean; msg: string }> => {
        try {
            const response = await privateAPI.delete(`/promotions/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    },

    // Toggle promotion status
    togglePromotionStatus: async (id: number, isActive: boolean): Promise<{ success: boolean; msg: string; data: Promotion }> => {
        try {
            const response = await privateAPI.patch(`/promotions/${id}/status`, { isActive });
            return response;
        } catch (error) {
            console.error('Error toggling promotion status:', error);
            throw error;
        }
    },
};

export default promotionService;
