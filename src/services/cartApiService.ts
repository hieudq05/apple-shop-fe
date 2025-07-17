// Cart API service for shopping cart management
import { userRoleAPI } from "../utils/axios";

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
    async getCart(): Promise<CartItem[]> {
        try {
            const response = await userRoleAPI.get<CartResponseAPI>("/cart");

            if (response.success) {
                return response.data.map((item) =>
                    this.transformCartItem(item)
                );
            } else {
                throw new Error(response.msg || "Failed to get cart");
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            throw error;
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(item: AddToCartRequest): Promise<void> {
        try {
            const response = await userRoleAPI.post("/cart/items", item);

            if (!response.success) {
                throw new Error(
                    response.msg || "Failed to add item to cart"
                );
            }
            return response
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
    ): Promise<void> {
        try {
            const response = await userRoleAPI.put(`/cart/items/${itemId}`, data);

            if (!response.success) {
                throw new Error(
                    response.msg || "Failed to update cart item"
                );
            }
        } catch (error) {
            console.error("Error updating cart item:", error);
            throw error;
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId: number): Promise<void> {
        try {
            const response = await userRoleAPI.delete(`/cart/items/${itemId}`);

            if (!response.success) {
                throw new Error(
                    response.msg || "Failed to remove item from cart"
                );
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart(): Promise<void> {
        try {
            const response = await userRoleAPI.delete("/cart");

            if (!response.success) {
                throw new Error(response.msg || "Failed to clear cart");
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }
}

export const cartApiService = new CartApiService();
export default cartApiService;
