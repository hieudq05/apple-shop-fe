import { userRoleAPI } from "../utils/axios";
import type { ApiResponse } from "@/types/api";
import { toast } from "sonner";

export interface CartItemAPI {
    id: number;
    product: {
        id: number;
        name: string;
        description: string;
        categoryId: number;
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
    categoryId: number;
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

class CartApiService {
    /**
     * Transform API cart item to UI cart item
     */
    private transformCartItem(apiItem: CartItemAPI): CartItem {
        return {
            id: apiItem.id,
            productId: apiItem.product.id,
            productName: apiItem.product.name,
            categoryId: apiItem.product.categoryId,
            productDescription: apiItem.product.description,
            productImage: apiItem.stock.productPhotos[0]?.imageUrl || "",
            stockId: apiItem.stock.id,
            color: apiItem.stock.color,
            price: apiItem.stock.price,
            quantity: apiItem.quantity,
            maxQuantity: apiItem.stock.quantity,
            total: apiItem.stock.price * apiItem.quantity,
            instances: apiItem.stock.instance || [],
        };
    }

    /**
     * Get user's cart
     */
    async getCart(): Promise<ApiResponse<CartItem[]>> {
        try {
            const response = await userRoleAPI.get<CartResponseAPI>("/cart");

            if (response.data.success) {
                return {
                    ...response.data,
                    data: response.data.data.map(this.transformCartItem),
                };
            } else {
                toast.error(response.data.msg || "Failed to get cart");
                return {
                    ...response.data,
                    data: [],
                };
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            return {
                success: false,
                msg: "Error fetching cart",
                data: [],
                meta: {
                    currentPage: 1,
                    pageSize: 0,
                    totalPage: 0,
                    totalElements: 0,
                },
            };
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(item: AddToCartRequest): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.post("/cart/items", item);

            if (!response.data.success) {
                throw new Error(
                    response.data.msg || "Failed to add item to cart"
                );
            }

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
    ): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.put(
                `/cart/items/${itemId}`,
                data
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.msg || "Failed to update cart item"
                );
            }

            return response.data;
        } catch (error) {
            console.error("Error updating cart item:", error);
            throw error;
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId: number): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.delete(`/cart/items/${itemId}`);

            if (!response.data.success) {
                throw new Error(
                    response.data.msg || "Failed to remove item from cart"
                );
            }

            return response.data;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart(): Promise<ApiResponse<void>> {
        try {
            const response = await userRoleAPI.delete("/cart");

            if (!response.data.success) {
                throw new Error(response.data.msg || "Failed to clear cart");
            }

            return response.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }
}

export const cartApiService = new CartApiService();
export default cartApiService;
