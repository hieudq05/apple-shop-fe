import React, {createContext, useContext, useState, useEffect} from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    color: {
        id: string;
        name: string;
        hex: string;
    };
    storage: {
        id: string;
        name: string;
    };
    quantity: number;
    imageUrl: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, colorId: string, storageId: string) => void;
    updateQuantity: (itemId: string, colorId: string, storageId: string, quantity: number) => void;
    clearCart: () => void;
    getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
                console.log('Cart loaded from localStorage:', parsedCart);
            } catch (error) {
                console.error('Failed to parse cart data:', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
            console.log('Cart saved to localStorage:', cartItems);
        } else {
            localStorage.removeItem('cart');
        }
    }, [cartItems]);

    const addToCart = (newItem: CartItem) => {
        // Ensure newItem has quantity property
        const itemToAdd = {
            ...newItem,
            quantity: newItem.quantity || 1
        };

        setCartItems(prevItems => {
            // Check if item with same id, color, and storage already exists
            const existingItemIndex = prevItems.findIndex(
                item => item.id === itemToAdd.id &&
                    item.color.id === itemToAdd.color.id &&
                    item.storage.id === itemToAdd.storage.id
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                return updatedItems;
            } else {
                return [...prevItems, itemToAdd];
            }
        });
    };

    // Fixed to remove items based on all unique identifiers
    const removeFromCart = (itemId: string, colorId: string, storageId: string) => {
        setCartItems(prevItems => prevItems.filter(item =>
            !(item.id === itemId && item.color.id === colorId && item.storage.id === storageId)
        ));
    };

    // Add ability to update quantity directly
    const updateQuantity = (itemId: string, colorId: string, storageId: string, quantity: number) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.id === itemId &&
                    item.color.id === colorId &&
                    item.storage.id === storageId
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                if (quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    updatedItems.splice(existingItemIndex, 1);
                } else {
                    updatedItems[existingItemIndex].quantity = quantity;
                }
                return updatedItems;
            }
            return prevItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
