// Cart service for shopping cart management
import { privateAPI } from "@/utils/axios";
import type { ApiResponse } from "../types/api";

export interface CartItemAPI {
    id: number;
    product: {
        id: number;
        name: string;
        description: string;
    };
    stock: {
        id: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        quantity: number;
        price: number;
        productPhotos: Array<{
            id: number;
            imageUrl: string;
            alt: string;
        }>;
        instance: Array<{
            id: number;
            name: string;
        }>;
    };
    quantity: number;
}

export interface CartResponseAPI {
    success: boolean;
    msg: string;
    data: CartItemAPI[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

// Transformed cart item for UI
export interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productDescription: string;
    productImage: string;
    stockId: number;
    color: {
        id: number;
        name: string;
        hexCode: string;
    };
    price: number;
    quantity: number;
    maxQuantity: number;
    total: number;
    instances: Array<{
        id: number;
        name: string;
    }>;
}

export interface AddToCartRequest {
    productId: number;
    stockId: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

class CartService {
    /**
     * Get user's cart
     */
    async getCart(): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.get<ApiResponse<CartItem>>(
                "/api/v1/user/cart"
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching cart:", error);
            throw error;
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(item: AddToCartRequest): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.post<ApiResponse<CartItem>>(
                "/api/v1/user/cart/items",
                item
            );
            return response.data;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(
        itemId: number,
        data: UpdateCartItemRequest
    ): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.patch<ApiResponse<CartItem>>(
                `/api/v1/user/cart/items/${itemId}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error("Error updating cart item:", error);
            throw error;
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId: number): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.delete<ApiResponse<CartItem>>(
                `/api/v1/user/cart/items/${itemId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart(): Promise<ApiResponse<any>> {
        try {
            const response = await privateAPI.delete<ApiResponse<any>>(
                "/api/v1/user/cart"
            );
            return response.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }

    /**
     * Apply coupon to cart
     */
    async applyCoupon(couponCode: string): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.post<ApiResponse<CartItem>>(
                "/api/v1/user/cart/coupon",
                {
                    couponCode,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error applying coupon:", error);
            throw error;
        }
    }

    /**
     * Remove coupon from cart
     */
    async removeCoupon(): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.delete<ApiResponse<CartItem>>(
                "/api/v1/user/cart/coupon"
            );
            return response.data;
        } catch (error) {
            console.error("Error removing coupon:", error);
            throw error;
        }
    }

    /**
     * Get cart item count
     */
    async getCartItemCount(): Promise<ApiResponse<{ count: number }>> {
        try {
            const response = await privateAPI.get<
                ApiResponse<{ count: number }>
            >("/api/v1/user/cart/count");
            return response.data;
        } catch (error) {
            console.error("Error fetching cart count:", error);
            throw error;
        }
    }

    /**
     * Validate cart before checkout
     */
    async validateCart(): Promise<
        ApiResponse<{
            isValid: boolean;
            errors: Array<{
                itemId: number;
                productName: string;
                error: string;
            }>;
        }>
    > {
        try {
            const response = await privateAPI.post<ApiResponse<any>>(
                "/api/v1/user/cart/validate"
            );
            return response.data;
        } catch (error) {
            console.error("Error validating cart:", error);
            throw error;
        }
    }

    /**
     * Calculate shipping fee
     */
    async calculateShipping(address: {
        province: string;
        district: string;
        ward: string;
    }): Promise<
        ApiResponse<{
            shippingFee: number;
            estimatedDelivery: string;
            shippingMethods: Array<{
                id: string;
                name: string;
                fee: number;
                estimatedDays: number;
            }>;
        }>
    > {
        try {
            const response = await privateAPI.post<ApiResponse<any>>(
                "/api/v1/user/cart/shipping",
                address
            );
            return response.data;
        } catch (error) {
            console.error("Error calculating shipping:", error);
            throw error;
        }
    }

    /**
     * Save cart for later (for guest users)
     */
    async saveCartForLater(): Promise<
        ApiResponse<{ cartToken: string }>
    > {
        try {
            const response = await privateAPI.post<ApiResponse<any>>(
                "/api/v1/cart/save"
            );
            return response.data;
        } catch (error) {
            console.error("Error saving cart:", error);
            throw error;
        }
    }

    /**
     * Restore saved cart (for guest users)
     */
    async restoreCart(
        cartToken: string
    ): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.post<ApiResponse<CartItem>>(
                "/api/v1/cart/restore",
                {
                    cartToken,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error restoring cart:", error);
            throw error;
        }
    }

    /**
     * Merge guest cart with user cart (after login)
     */
    async mergeCart(
        guestCartItems: Array<{
            productId: number;
            colorId: number;
            quantity: number;
        }>
    ): Promise<ApiResponse<CartItem>> {
        try {
            const response = await privateAPI.post<ApiResponse<CartItem>>(
                "/api/v1/user/cart/merge",
                {
                    items: guestCartItems,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error merging cart:", error);
            throw error;
        }
    }
}

const cartService = new CartService();
export default cartService;
