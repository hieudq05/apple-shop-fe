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
            >("/orders/me", {
                params,
            });

            if (response.success && response.data) {
                // Transform API data thành UI format
                const transformedOrders = response.data.map(
                    transformApiOrderToOrderHistory
                );

                return {
                    success: response.success,
                    message: response.message || response.msg || "Success",
                    data: transformedOrders,
                };
            }

            return {
                success: false,
                message: response.error.msg || "Không có dữ liệu",
                data: [],
            };
        } catch (error) {
            console.error("Error fetching order history:", error);
            throw error;
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
            const response = await userRoleAPI.get<
                ApiResponse<ApiOrderDetailResponse>
            >(`/orders/${orderId}`);

            if (response.success && response.data) {
                const transformedOrderDetail =
                    transformApiOrderDetailToOrderDetail(response.data);

                return {
                    success: response.success,
                    message: response.msg || "Success",
                    data: transformedOrderDetail,
                };
            }

            return {
                success: false,
                message: response.error.msg || "Không tìm thấy đơn hàng",
                data: undefined,
            };
        } catch (error) {
            console.error("Error fetching order detail:", error);
            throw error;
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

            return {
                success: response.success || false,
                message: response.msg || "Đơn hàng đã được hủy thành công",
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
}

export const orderHistoryService = new OrderHistoryService();
export default orderHistoryService;
