import { userRoleAPI, privateAPI } from "../utils/axios";

export interface CreatePaymentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: number;
    district: number;
    province: number;
    productPromotionCode?: string | null;
    shippingPromotionCode?: string | null;
}

export interface CreatePaymentResponse {
    success: boolean;
    msg: string;
    data: {
        code: string;
        message: string;
        paymentUrl: string;
    };
}

export interface PaymentVerificationRequest {
    vnp_Amount?: string;
    vnp_BankCode?: string;
    vnp_BankTranNo?: string;
    vnp_CardType?: string;
    vnp_OrderInfo?: string;
    vnp_PayDate?: string;
    vnp_ResponseCode?: string;
    vnp_TmnCode?: string;
    vnp_TransactionNo?: string;
    vnp_TransactionStatus?: string;
    vnp_TxnRef?: string;
    vnp_SecureHash?: string;
}

export interface PaymentVerificationResponse {
    success: boolean;
    msg: string;
    data: {
        isValid: boolean;
        orderId?: string;
        amount?: number;
        transactionStatus: string;
        message: string;
    };
}

const paymentService = {
    // Create VNPay payment URL
    createVNPayPayment: async (
        data: CreatePaymentRequest
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                "/payments/vnpay/create-payment-v1",
                data
            );
            return response;
        } catch (error) {
            console.error("Error creating VNPay payment:", error);
            throw error;
        }
    },

    createVNPayPaymentForOrder: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                `/payments/vnpay/create-payment-v1/order/${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating VNPay payment for order:", error);
            throw error;
        }
    },

    // Create PayPal payment URL
    createPayPalPayment: async (
        data: CreatePaymentRequest
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                "/payments/paypal/create-payment-v1",
                data
            );
            return response;
        } catch (error) {
            console.error("Error creating PayPal payment:", error);
            throw error;
        }
    },

    createPayPalPaymentForOrder: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                `/payments/paypal/create-payment-v1/order/${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating PayPal payment for order:", error);
            throw error;
        }
    },

    // Verify VNPay payment result
    verifyVNPayPayment: async (
        data: PaymentVerificationRequest
    ): Promise<PaymentVerificationResponse> => {
        try {
            const response = await userRoleAPI.post(
                "/payments/vnpay/verify-payment",
                data
            );
            return response.data;
        } catch (error) {
            console.error("Error verifying VNPay payment:", error);
            throw error;
        }
    },

    // Verify PayPal payment result
    verifyPayPalPayment: async (
        data: PaymentVerificationRequest
    ): Promise<PaymentVerificationResponse> => {
        try {
            const response = await userRoleAPI.post(
                "/payments/paypal/verify-payment",
                data
            );
            return response.data;
        } catch (error) {
            console.error("Error verifying PayPal payment:", error);
            throw error;
        }
    },

    // Create VNPay payment URL for existing order
    createVNPayPaymentForOrder: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                `/payments/vnpay/create-payment-v1/order/${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating VNPay payment for order:", error);
            throw error;
        }
    },

    // Create PayPal payment URL for existing order
    createPayPalPaymentForOrder: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await userRoleAPI.post(
                `/payments/paypal/create-payment-v1/order/${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating PayPal payment for order:", error);
            throw error;
        }
    },

    // Create VNPay payment URL for admin (using privateAPI)
    createAdminVNPayPaymentUrl: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await privateAPI.post(
                `/payments/vnpay/payment-url?orderId=${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating admin VNPay payment URL:", error);
            throw error;
        }
    },

    // Create PayPal payment URL for admin (using privateAPI)
    createAdminPayPalPaymentUrl: async (
        orderId: number
    ): Promise<CreatePaymentResponse> => {
        try {
            const response = await privateAPI.post(
                `/payments/paypal/payment-url?orderId=${orderId}`
            );
            return response;
        } catch (error) {
            console.error("Error creating admin PayPal payment URL:", error);
            throw error;
        }
    },
};

export default paymentService;
