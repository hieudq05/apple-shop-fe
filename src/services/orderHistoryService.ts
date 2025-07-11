// Simple order history service
import { privateAPI, userRoleAPI } from "../utils/axios";
import type { ApiResponse } from "../types/api";
import type {
    OrderHistory,
    ApiOrderHistory,
    OrderDetail,
    ApiOrderDetailResponse,
    CancelOrderResponse,
} from "../types/order";
import {
    transformApiOrderToOrderHistory,
    transformApiOrderDetailToOrderDetail,
} from "../types/order";

export interface OrderHistoryParams {
    page?: number;
    size?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

export interface OrderSearchParams {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    province?: string; // Province code/ID
    district?: string; // District code/ID
    ward?: string; // Ward code/ID
    country?: string;
    shippingTrackingCode?: string;
    createdAtFrom?: string; // ISO date string
    createdAtTo?: string; // ISO date string
    searchTerm?: string;
    status?: string;
    page?: number;
    size?: number;
}

class OrderHistoryService {
    /**
     * Get user's order history
     */
    async getOrderHistory(
        params: OrderHistoryParams = {}
    ): Promise<ApiResponse<OrderHistory[]>> {
        try {
            const response = await userRoleAPI.get<ApiOrderHistory[]>(
                "/orders/me",
                { params }
            );

            if (response.data && response.data.length > 0) {
                // Transform API data thành UI format
                const transformedOrders = response.data.map(
                    transformApiOrderToOrderHistory
                );

                return {
                    success: true,
                    message: "Success",
                    data: transformedOrders,
                };
            }

            return {
                success: true,
                message: "Không có dữ liệu",
                data: [],
            };
        } catch (error) {
            console.error("Error fetching order history:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi tải lịch sử đơn hàng",
                data: [],
            };
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId: number): Promise<ApiResponse<OrderHistory>> {
        try {
            const response = await privateAPI.get<ApiResponse<ApiOrderHistory>>(
                `/api/v1/orders/${orderId}`
            );

            if (response.data.success && response.data.data) {
                const transformedOrder = transformApiOrderToOrderHistory(
                    response.data.data
                );

                return {
                    success: response.data.success,
                    message:
                        response.data.message || response.data.msg || "Success",
                    data: transformedOrder,
                };
            }

            return {
                success: false,
                message:
                    response.data.message ||
                    response.data.msg ||
                    "Không tìm thấy đơn hàng",
                data: undefined,
            };
        } catch (error) {
            console.error("Error fetching order details:", error);
            throw error;
        }
    }

    /**
     * Get order detail by ID (with full information)
     */
    async getOrderDetailById(
        orderId: number
    ): Promise<ApiResponse<OrderDetail>> {
        try {
            const response = await userRoleAPI.get<ApiOrderDetailResponse>(
                `/orders/${orderId}`
            );

            if (response.data) {
                const transformedOrderDetail =
                    transformApiOrderDetailToOrderDetail(response.data);

                return {
                    success: true,
                    message: "Success",
                    data: transformedOrderDetail,
                };
            }

            return {
                success: false,
                message: "Không tìm thấy đơn hàng",
                data: undefined,
            };
        } catch (error) {
            console.error("Error fetching order detail:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi tải chi tiết đơn hàng",
                data: undefined,
            };
        }
    }

    /**
     * Cancel order by ID
     */
    async cancelOrder(
        orderId: number,
        reason?: string
    ): Promise<ApiResponse<CancelOrderResponse>> {
        try {
            const response = await userRoleAPI.patch<CancelOrderResponse>(
                `/orders/${orderId}/cancel`,
                { reason }
            );

            return {
                success: true,
                message: "Đơn hàng đã được hủy thành công",
                data: response.data || {
                    message: "Đơn hàng đã được hủy thành công",
                    cancelled: true,
                },
            };
        } catch (error) {
            console.error("Error cancelling order:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi hủy đơn hàng",
                data: {
                    message: "Có lỗi xảy ra khi hủy đơn hàng",
                    cancelled: false,
                },
            };
        }
    }

    /**
     * Search orders with detailed criteria
     */
    async searchOrders(
        searchParams: OrderSearchParams
    ): Promise<ApiResponse<OrderHistory[]>> {
        try {
            const response = await userRoleAPI.post<ApiOrderHistory[]>(
                "/orders/search",
                searchParams
            );

            if (response.data && response.data.length > 0) {
                // Transform API data thành UI format
                const transformedOrders = response.data.map(
                    transformApiOrderToOrderHistory
                );

                return {
                    success: true,
                    message: "Tìm kiếm thành công",
                    data: transformedOrders,
                };
            }

            return {
                success: true,
                message: "Không tìm thấy đơn hàng nào",
                data: [],
            };
        } catch (error) {
            console.error("Error searching orders:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi tìm kiếm đơn hàng",
                data: [],
            };
        }
    }
}

export const orderHistoryService = new OrderHistoryService();
export default orderHistoryService;
