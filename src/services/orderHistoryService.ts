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
            const response = await userRoleAPI.get<
                ApiResponse<ApiOrderHistory[]>
            >("/orders/me", { params });

            if (
                response.data.success &&
                response.data &&
                (response.data.data?.length ?? 0) > 0
            ) {
                // Transform API data thành UI format
                const transformedOrders = response.data.data?.map(
                    transformApiOrderToOrderHistory
                );

                return {
                    success: true,
                    message: "Success",
                    data: transformedOrders,
                    meta: response.data.meta, // Include pagination metadata
                };
            }

            return {
                success: true,
                message: "Không có dữ liệu",
                data: [],
                meta: response.data.meta,
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

            if (response.data.success && response.data) {
                const transformedOrder = response.data.data
                    ? transformApiOrderToOrderHistory(response.data.data)
                    : undefined;

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
            const response = await userRoleAPI.get<
                ApiResponse<ApiOrderDetailResponse>
            >(`/orders/${orderId}`);

            if (response.data.success) {
                let transformedOrderDetail: OrderDetail | undefined = undefined;
                if (response.data.data) {
                    transformedOrderDetail =
                        transformApiOrderDetailToOrderDetail(
                            response.data.data
                        );
                }

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
            const response = await userRoleAPI.post<
                ApiResponse<CancelOrderResponse>
            >(`/orders/${orderId}/cancel`, { reason });

            return response.data;
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
            const response = await userRoleAPI.post<
                ApiResponse<ApiOrderHistory[]>
            >("/orders/search?size=10&page=" + searchParams.page, searchParams);

            if (
                response.data.success &&
                response.data.data &&
                (response.data.data?.length ?? 0) > 0
            ) {
                // Transform API data thành UI format
                const transformedOrders = response.data.data.map(
                    transformApiOrderToOrderHistory
                );

                return {
                    success: true,
                    message: "Tìm kiếm thành công",
                    data: transformedOrders,
                    meta: response.data.meta,
                };
            }

            return {
                success: true,
                message: "Không tìm thấy đơn hàng nào",
                data: [],
                meta: response.data.meta,
            };
        } catch (error) {
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
