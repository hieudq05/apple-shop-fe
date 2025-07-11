// Order service for order management
import { privateAPI } from "../utils/axios";
import type { ApiResponse, PaginationParams } from "../types/api";

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    color: {
        id: number;
        name: string;
        hexCode: string;
    };
    quantity: number;
    price: number;
    total: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    status:
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED";
    totalAmount: number;
    shippingFee: number;
    discountAmount: number;
    finalAmount: number;
    paymentMethod: "CASH" | "CARD" | "MOMO" | "BANK_TRANSFER";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
}

export interface CreateOrderRequest {
    items: Array<{
        productId: number;
        colorId: number;
        quantity: number;
    }>;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    paymentMethod: "CASH" | "CARD" | "MOMO" | "BANK_TRANSFER";
    note?: string;
}

export interface OrdersParams extends PaginationParams {
    status?: string;
    paymentStatus?: string;
    fromDate?: string;
    toDate?: string;
}

class OrderService {
    /**
     * Create a new order
     */
    async createOrder(
        orderData: CreateOrderRequest
    ): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.post<ApiResponse<Order>>(
                "/api/v1/orders",
                orderData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    }

    /**
     * Get user's orders with pagination
     */
    async getUserOrders(
        params: OrdersParams = {}
    ): Promise<ApiResponse<Order[]>> {
        try {
            const response = await privateAPI.get<ApiResponse<Order[]>>(
                "/api/v1/user/orders",
                {
                    params,
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw error;
        }
    }

    /**
     * Get user's order history (simplified endpoint)
     */
    async getMyOrders(
        params: OrdersParams = {}
    ): Promise<ApiResponse<Order[]>> {
        try {
            const response = await privateAPI.get<ApiResponse<Order[]>>(
                "/api/v1/orders/me",
                {
                    params,
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching my orders:", error);
            throw error;
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId: number): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.get<ApiResponse<Order>>(
                `/api/v1/orders/${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    }

    /**
     * Cancel an order
     */
    async cancelOrder(
        orderId: number,
        reason?: string
    ): Promise<ApiResponse<any>> {
        try {
            const response = await privateAPI.patch<ApiResponse<any>>(
                `/api/v1/orders/${orderId}/cancel`,
                {
                    reason,
                }
            );
            return response;
        } catch (error) {
            console.error("Error cancelling order:", error);
            throw error;
        }
    }

    /**
     * Track order status
     */
    async trackOrder(orderNumber: string): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.get<ApiResponse<Order>>(
                `/api/v1/orders/track/${orderNumber}`
            );
            return response;
        } catch (error) {
            console.error("Error tracking order:", error);
            throw error;
        }
    }

    /**
     * Get order statistics for user
     */
    async getOrderStats(): Promise<
        ApiResponse<{
            totalOrders: number;
            pendingOrders: number;
            completedOrders: number;
            totalSpent: number;
        }>
    > {
        try {
            const response = await privateAPI.get<ApiResponse<any>>(
                "/api/v1/user/orders/stats"
            );
            return response;
        } catch (error) {
            console.error("Error fetching order stats:", error);
            throw error;
        }
    }

    /**
     * Reorder - create new order from existing order
     */
    async reorder(orderId: number): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.post<ApiResponse<Order>>(
                `/api/v1/orders/${orderId}/reorder`
            );
            return response;
        } catch (error) {
            console.error("Error reordering:", error);
            throw error;
        }
    }

    /**
     * Rate and review order
     */
    async reviewOrder(
        orderId: number,
        review: {
            rating: number;
            comment: string;
            productReviews: Array<{
                productId: number;
                rating: number;
                comment: string;
            }>;
        }
    ): Promise<ApiResponse<any>> {
        try {
            const response = await privateAPI.post<ApiResponse<any>>(
                `/api/v1/orders/${orderId}/review`,
                review
            );
            return response;
        } catch (error) {
            console.error("Error reviewing order:", error);
            throw error;
        }
    }

    /**
     * Get order invoice
     */
    async getOrderInvoice(orderId: number): Promise<Blob> {
        try {
            const response = await privateAPI.get(
                `/api/v1/orders/${orderId}/invoice`,
                {
                    responseType: "blob",
                }
            );
            return response as any;
        } catch (error) {
            console.error("Error fetching order invoice:", error);
            throw error;
        }
    }

    /**
     * Request order return/refund
     */
    async requestReturn(
        orderId: number,
        returnData: {
            items: Array<{
                orderItemId: number;
                quantity: number;
                reason: string;
            }>;
            reason: string;
            description?: string;
        }
    ): Promise<ApiResponse<any>> {
        try {
            const response = await privateAPI.post<ApiResponse<any>>(
                `/api/v1/orders/${orderId}/return`,
                returnData
            );
            return response;
        } catch (error) {
            console.error("Error requesting return:", error);
            throw error;
        }
    }

    // ============= ADMIN METHODS =============

    /**
     * Get all orders for admin with pagination and filters
     */
    async getAdminOrders(params: OrdersParams = {}): Promise<any> {
        try {
            console.log("=== ORDER SERVICE DEBUG ===");
            console.log("Calling admin orders API with params:", params);
            console.log(
                "privateAPI baseURL:",
                (privateAPI as any).defaults?.baseURL
            );

            const response = await privateAPI.get("/orders", {
                params,
            });

            console.log("Service raw response:", response);
            console.log("Service response type:", typeof response);

            return response; // Axios interceptor already handles response.data
        } catch (error) {
            console.error("Error fetching admin orders:", error);
            throw error;
        }
    }

    /**
     * Update order status (Admin only)
     */
    async updateOrderStatus(
        orderId: number,
        status: Order["status"]
    ): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.patch(
                `/orders/${orderId}/status`,
                {
                    status,
                }
            );
            return response.data || response; // Handle both cases
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    }

    /**
     * Get order details for admin
     */
    async getAdminOrderById(orderId: number): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.get(`/orders/${orderId}`);
            return response.data || response; // Handle both cases
        } catch (error) {
            console.error("Error fetching admin order details:", error);
            throw error;
        }
    }
}

const orderService = new OrderService();
export default orderService;
