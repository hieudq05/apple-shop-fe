import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  specifications?: Record<string, any>;
  features?: string[];
  rating?: number;
  slug?: string;
}

interface ProductComparisonContextType {
  comparisonProducts: ComparisonProduct[];
  addToComparison: (product: ComparisonProduct) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean;
}

const ProductComparisonContext = createContext<ProductComparisonContextType | undefined>(undefined);

export const useProductComparison = () => {
  const context = useContext(ProductComparisonContext);
  if (!context) {
    throw new Error('useProductComparison must be used within a ProductComparisonProvider');
  }
  return context;
};

interface ProductComparisonProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'product_comparison';
const MAX_COMPARISON_ITEMS = 4;

export const ProductComparisonProvider: React.FC<ProductComparisonProviderProps> = ({ children }) => {
  const [comparisonProducts, setComparisonProducts] = useState<ComparisonProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setComparisonProducts(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading comparison products:', error);
    }
  }, []);

  // Save to localStorage whenever comparisonProducts changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonProducts));
    } catch (error) {
      console.error('Error saving comparison products:', error);
    }
  }, [comparisonProducts]);

  const addToComparison = (product: ComparisonProduct) => {
    setComparisonProducts(prev => {
      // Check if already exists
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }

      // Check if we've reached the limit
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        // Remove the first item and add the new one
        return [...prev.slice(1), product];
      }

      // Add to the end
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonProducts(prev => prev.filter(item => item.id !== productId));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
  };

  const isInComparison = (productId: string) => {
    return comparisonProducts.some(item => item.id === productId);
  };

  const canAddMore = comparisonProducts.length < MAX_COMPARISON_ITEMS;

  const value = {
    comparisonProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
  };

  return (
    <ProductComparisonContext.Provider value={value}>
      {children}
    </ProductComparisonContext.Provider>
  );
};
