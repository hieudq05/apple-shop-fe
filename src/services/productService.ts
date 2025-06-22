// Product service for public product operations
import { publicAPI, privateAPI } from '../utils/axios';
import type { ApiResponse, PaginationParams } from '../types/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: {
    id: number;
    name: string;
    image: string;
  };
  features: Array<{
    id: number;
    name: string;
    description: string;
    image: string;
  }>;
  stocks: Array<{
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
    instanceProperties: Array<{
      id: number;
      name: string;
    }>;
  }>;
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image: string;
  productCount?: number;
}

export interface ProductsParams extends PaginationParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params: ProductsParams = {}): Promise<ApiResponse<Product[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product[]>>('/api/v1/products', {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<ApiResponse<Product>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product>>(`/api/v1/products/${productId}`);
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number, params: ProductsParams = {}): Promise<ApiResponse<Product[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product[]>>(`/api/v1/products/category/${categoryId}`, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string, params: ProductsParams = {}): Promise<ApiResponse<Product[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product[]>>('/api/v1/products/search', {
        params: { ...params, search: query }
      });
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Category[]>>('/api/v1/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: number): Promise<ApiResponse<Category>> {
    try {
      const response = await publicAPI.get<ApiResponse<Category>>(`/api/v1/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse<Product[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product[]>>('/api/v1/products/featured', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: number, limit: number = 4): Promise<ApiResponse<Product[]>> {
    try {
      const response = await publicAPI.get<ApiResponse<Product[]>>(`/api/v1/products/${productId}/related`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  }

  /**
   * Add product to wishlist (requires authentication)
   */
  async addToWishlist(productId: number): Promise<ApiResponse<any>> {
    try {
      const response = await privateAPI.post<ApiResponse<any>>(`/api/v1/user/wishlist/${productId}`);
      return response;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove product from wishlist (requires authentication)
   */
  async removeFromWishlist(productId: number): Promise<ApiResponse<any>> {
    try {
      const response = await privateAPI.delete<ApiResponse<any>>(`/api/v1/user/wishlist/${productId}`);
      return response;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  /**
   * Get user's wishlist (requires authentication)
   */
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await privateAPI.get<ApiResponse<Product[]>>('/api/v1/user/wishlist');
      return response;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }
}

const productService = new ProductService();
export default productService;
