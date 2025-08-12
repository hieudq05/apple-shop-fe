import type { ProductSelling } from "@/pages/admin/AdminDashboard";
import type { ApiResponse } from "@/types/api";
import { privateAPI } from "@/utils/axios";

const statisticsService = {
    getTotalRevenue: async (
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<number>> => {
        try {
            const response = await privateAPI.get<ApiResponse<number>>(
                "/orders/statistics/all-total-revenue?fromDate=" +
                    fromDate +
                    "&toDate=" +
                    toDate
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch total revenue");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching total revenue:", error);
            throw error;
        }
    },
    getNumberOfOrders: async (
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<number>> => {
        try {
            const response = await privateAPI.get<ApiResponse<number>>(
                "/orders/statistics/all-number-orders?fromDate=" +
                    fromDate +
                    "&toDate=" +
                    toDate
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch total orders");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching total orders:", error);
            throw error;
        }
    },
    getNumberOfNewUsers: async (
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<number>> => {
        try {
            const response = await privateAPI.get<ApiResponse<number>>(
                "/users/statistics/new-user-count?fromDate=" +
                    fromDate +
                    "&toDate=" +
                    toDate
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch total new users");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching total new users:", error);
            throw error;
        }
    },
    getNumberOfProductsSold: async (
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<number>> => {
        try {
            const response = await privateAPI.get<ApiResponse<number>>(
                "/orders/statistics/number-products-sold?fromDate=" +
                    fromDate +
                    "&toDate=" +
                    toDate
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch total products sold");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching total products sold:", error);
            throw error;
        }
    },
    getTopSellingProducts: async (
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<ProductSelling[]>> => {
        try {
            const response = await privateAPI.get<
                ApiResponse<ProductSelling[]>
            >(
                "/products/statistics/top-selling?fromDate=" +
                    fromDate +
                    "&toDate=" +
                    toDate
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch top selling products");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching top selling products:", error);
            throw error;
        }
    },
    getOrdersByStatus: async (
        status: string,
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<number>> => {
        try {
            const response = await privateAPI.get<ApiResponse<number>>(
                `/orders/statistics/number-orders?status=${status}&fromDate=${fromDate}&toDate=${toDate}`
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch orders by status");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching orders by status:", error);
            throw error;
        }
    },
};

export default statisticsService;
