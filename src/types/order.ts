// Order-related type definitions

// API response structure từ backend
export interface ApiOrderDetail {
    id: number;
    product: {
        id: number;
    };
    productName: string;
    quantity: number;
    price: number;
    note?: string;
    colorName: string;
    versionName: string;
    image_url: string;
}

export interface ApiOrderHistory {
    id: number;
    createdAt: string;
    paymentType: string;
    status: string;
    orderDetails: ApiOrderDetail[];
    shippingTrackingCode?: string;
}

// API response structure chi tiết đơn hàng
export interface ApiOrderDetailResponse {
    id: number;
    createdAt: string;
    paymentType: string;
    status: string;
    orderDetails: ApiOrderDetail[];
    shippingTrackingCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    country: string;
    productProductPromotion?: {
        id: number;
        name: string;
        code: string;
    };
    shippingShippingPromotion?: {
        id: number;
        name: string;
        code: string;
    };
    shippingDiscountAmount: number;
    productDiscountAmount: number;
    subtotal: number;
    shippingFee: number;
    finalTotal: number;
}

// Interfaces cho UI components
export interface OrderHistoryItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    storageName?: string;
    colorName: string;
    versionName?: string;
    quantity: number;
    price: number;
    total: number;
    note?: string;
}

export interface OrderHistory {
    id: number;
    orderNumber?: string;
    status: string;
    totalAmount: number;
    shippingFee: number;
    discountAmount?: number;
    finalAmount: number;
    paymentMethod: string;
    paymentStatus?: string;
    shippingAddress:
        | {
              fullName?: string;
              phone?: string;
              address: string;
              ward?: string;
              district?: string;
              province?: string;
          }
        | string;
    items: OrderHistoryItem[];
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
}

// Interface cho Order Detail UI
export interface OrderDetail {
    id: number;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        address: string;
        ward: string;
        district: string;
        province: string;
        country: string;
    };
    items: OrderHistoryItem[];
    pricing: {
        subtotal: number;
        shippingFee: number;
        productDiscountAmount: number;
        shippingDiscountAmount: number;
        finalTotal: number;
    };
    promotions: {
        productPromotion?: {
            id: number;
            name: string;
            code: string;
        };
        shippingPromotion?: {
            id: number;
            name: string;
            code: string;
        };
    };
    trackingCode?: string;
}

// Cancel order response
export interface CancelOrderResponse {
    message: string;
    cancelled: boolean;
}

// Map status từ API thành status hiển thị tiếng Việt
export const ORDER_STATUS_MAP: Record<string, string> = {
    PENDING: "Đang chờ xử lý",
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
    PAID: "Đã thanh toán",
};

export const PAYMENT_STATUS_MAP: Record<string, string> = {
    PENDING: "Chờ thanh toán",
    PENDING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
    CASH: "Tiền mặt",
    COD: "Thanh toán khi nhận hàng",
    CARD: "Thẻ tín dụng",
    MOMO: "MoMo",
    VNPAY: "VNPay",
    PAYPAL: "PayPal",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

// Helper function để transform dữ liệu từ API thành format UI
export function transformApiOrderToOrderHistory(
    apiOrder: ApiOrderHistory
): OrderHistory {
    const items: OrderHistoryItem[] = apiOrder.orderDetails.map((detail) => ({
        id: detail.id,
        productId: detail.product.id,
        productName: detail.productName,
        productImage: detail.image_url,
        colorName: detail.colorName,
        versionName: detail.versionName,
        quantity: detail.quantity,
        price: detail.price,
        total: detail.price * detail.quantity,
        note: detail.note,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return {
        id: apiOrder.id,
        orderNumber: apiOrder.id.toString(),
        status: apiOrder.status,
        totalAmount,
        shippingFee: 0, // API không trả về, mặc định 0
        finalAmount: totalAmount,
        paymentMethod: apiOrder.paymentType,
        shippingAddress: "Địa chỉ giao hàng", // API không trả về, dùng placeholder
        items,
        createdAt: apiOrder.createdAt,
        updatedAt: apiOrder.createdAt, // API không có updatedAt, dùng createdAt
        trackingNumber: apiOrder.shippingTrackingCode,
    };
}

// Helper function để transform dữ liệu chi tiết đơn hàng từ API
export function transformApiOrderDetailToOrderDetail(
    apiOrderDetail: ApiOrderDetailResponse
): OrderDetail {
    const items: OrderHistoryItem[] = apiOrderDetail.orderDetails.map(
        (detail) => ({
            id: detail.id,
            productId: detail.product.id,
            productName: detail.productName,
            productImage: detail.image_url,
            colorName: detail.colorName,
            versionName: detail.versionName,
            quantity: detail.quantity,
            price: detail.price,
            total: detail.price * detail.quantity,
            note: detail.note,
        })
    );

    return {
        id: apiOrderDetail.id,
        orderNumber: apiOrderDetail.id.toString(),
        status: apiOrderDetail.status,
        paymentMethod: apiOrderDetail.paymentType,
        createdAt: apiOrderDetail.createdAt,
        customer: {
            firstName: apiOrderDetail.firstName,
            lastName: apiOrderDetail.lastName,
            email: apiOrderDetail.email,
            phone: apiOrderDetail.phone,
        },
        shippingAddress: {
            address: apiOrderDetail.address,
            ward: apiOrderDetail.ward,
            district: apiOrderDetail.district,
            province: apiOrderDetail.province,
            country: apiOrderDetail.country,
        },
        items,
        pricing: {
            subtotal: apiOrderDetail.subtotal,
            shippingFee: apiOrderDetail.shippingFee,
            productDiscountAmount: apiOrderDetail.productDiscountAmount,
            shippingDiscountAmount: apiOrderDetail.shippingDiscountAmount,
            finalTotal: apiOrderDetail.finalTotal,
        },
        promotions: {
            productPromotion: apiOrderDetail.productProductPromotion,
            shippingPromotion: apiOrderDetail.shippingShippingPromotion,
        },
        trackingCode: apiOrderDetail.shippingTrackingCode,
    };
}
