import { privateAPI } from "../utils/axios";
import type { ApiResponse, PaginationParams } from "../types/api";
import { toast } from "sonner";

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

export interface CreateAdminOrderRequest {
    createdByUserId: number;
    status:
        | "PENDING_PAYMENT"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED";
    paymentType: "VNPAY" | "MOMO" | "CASH" | "BANK_TRANSFER";
    customInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    orderDetails: Array<{
        stockId: number;
        quantity: number;
    }>;
    shippingFee: number;
    productPromotionCode?: string;
    shippingPromotionCode?: string;
}

export interface OrdersParams extends PaginationParams {
    status?: string;
    paymentStatus?: string;
    fromDate?: string;
    toDate?: string;
}

export interface OrderSearchCriteria {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
    country?: string;
    shippingTrackingCode?: string;
    createdAtFrom?: string; // ISO datetime string
    createdAtTo?: string; // ISO datetime string
    searchTerm?: string; // Tìm kiếm tổng quát
    status?: string; // OrderStatus
    paymentType?: string; // PaymentType
    approveAtFrom?: string; // ISO datetime string
    approveAtTo?: string; // ISO datetime string
    createdByName?: string;
    approvedByName?: string;
    createdById?: number;
    approvedById?: number;
}

export interface OrderSearchParams extends PaginationParams {
    // Criteria fields
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
    country?: string;
    shippingTrackingCode?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    searchTerm?: string;
    status?: string;
    paymentType?: string;
    approveAtFrom?: string;
    approveAtTo?: string;
    createdByName?: string;
    approvedByName?: string;
    createdById?: number;
    approvedById?: number;
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
            return response.data;
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
            return response.data;
        } catch (error) {
            console.error("Error fetching my orders:", error);
            throw error;
        }
    }

    /**
     * Search orders with advanced criteria for admin
     */
    async searchOrders(
        params: OrderSearchParams = {}
    ): Promise<ApiResponse<Order[]>> {
        try {
            // Build criteria object for request body
            const criteria: OrderSearchCriteria = {};

            // Map all search criteria fields
            if (params.customerName)
                criteria.customerName = params.customerName;
            if (params.customerEmail)
                criteria.customerEmail = params.customerEmail;
            if (params.customerPhone)
                criteria.customerPhone = params.customerPhone;
            if (params.shippingAddress)
                criteria.shippingAddress = params.shippingAddress;
            if (params.province) criteria.province = params.province;
            if (params.district) criteria.district = params.district;
            if (params.ward) criteria.ward = params.ward;
            if (params.country) criteria.country = params.country;
            if (params.shippingTrackingCode)
                criteria.shippingTrackingCode = params.shippingTrackingCode;
            if (params.createdAtFrom)
                criteria.createdAtFrom = params.createdAtFrom;
            if (params.createdAtTo) criteria.createdAtTo = params.createdAtTo;
            if (params.searchTerm) criteria.searchTerm = params.searchTerm;
            if (params.status) criteria.status = params.status;
            if (params.paymentType) criteria.paymentType = params.paymentType;
            if (params.approveAtFrom)
                criteria.approveAtFrom = params.approveAtFrom;
            if (params.approveAtTo) criteria.approveAtTo = params.approveAtTo;
            if (params.createdByName)
                criteria.createdByName = params.createdByName;
            if (params.approvedByName)
                criteria.approvedByName = params.approvedByName;
            if (params.createdById) criteria.createdById = params.createdById;
            if (params.approvedById)
                criteria.approvedById = params.approvedById;

            // Build query parameters for pagination
            const searchParams = new URLSearchParams();
            if (params.page !== undefined)
                searchParams.append("page", params.page.toString());
            if (params.size !== undefined)
                searchParams.append("size", params.size.toString());

            const response = await privateAPI.post<ApiResponse<Order[]>>(
                `/orders/search?${searchParams.toString()}`,
                criteria
            );
            return response.data;
        } catch (error) {
            console.error("Error searching orders:", error);
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
            return response.data;
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
            const response = await privateAPI.post<ApiResponse<any>>(
                `/api/v1/orders/${orderId}/cancel`,
                {
                    reason,
                }
            );
            return response.data;
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
            return response.data;
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
            return response.data;
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
            return response.data;
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
            return response.data;
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
            return response.data;
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
            return response.data;
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
            const response = await privateAPI.get("/orders", {
                params,
            });

            return response.data; // Axios interceptor already handles response.data
        } catch (error) {
            toast.error("Lỗi", {
                description: "Có lỗi xảy ra khi tải danh sách đơn hàng",
            });
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
                `/orders/${orderId}/status?status=${status}`
            );
            return response.data; // Handle both cases
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
            return response.data; // Handle both cases
        } catch (error) {
            console.error("Error fetching admin order details:", error);
            throw error;
        }
    }

    /**
     * Create order for admin/staff
     */
    async createAdminOrder(
        orderData: CreateAdminOrderRequest
    ): Promise<ApiResponse<Order>> {
        try {
            const response = await privateAPI.post<ApiResponse<Order>>(
                "/orders/v1",
                orderData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating admin order:", error);
            throw error;
        }
    }
}

const orderService = new OrderService();
export default orderService;
