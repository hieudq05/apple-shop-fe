// Admin service for API calls
import { privateAPI } from '../utils/axios';
import type { 
  ApiResponse, 
  AdminProductsParams, 
  AdminOrdersParams, 
  AdminUsersParams,
  ProductDetailAdminResponse,
  DashboardStats
} from '../types/api';
import type { 
  AdminProduct, 
  AdminOrder, 
  AdminUser,
  ProductCreateRequest
} from '../types/admin';

class AdminService {
  /**
   * Get admin products with pagination and filters
   */
  async getAdminProducts(params: AdminProductsParams): Promise<ApiResponse<AdminProduct[]>> {
    try {
      const response = await privateAPI.get<ApiResponse<AdminProduct[]>>('/api/v1/admin/products', {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  }

  /**
   * Get admin product detail
   */
  async getAdminProductDetail(categoryId: number, productId: number): Promise<ApiResponse<ProductDetailAdminResponse>> {
    try {
      const response = await privateAPI.get<ApiResponse<ProductDetailAdminResponse>>(
        `/api/v1/admin/products/${categoryId}/${productId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching admin product detail:', error);
      throw error;
    }
  }

  /**
   * Create new product with FormData (for file uploads)
   */
  async createProduct(productData: ProductCreateRequest, files?: { [key: string]: File }): Promise<ApiResponse<AdminProduct>> {
    try {
      const formData = new FormData();

      // Add product JSON data
      formData.append('product', JSON.stringify(productData));

      // Add image files if they exist
      if (files) {
        Object.entries(files).forEach(([key, file]) => {
          formData.append(key, file);
        });
      }

      const response = await privateAPI.post<ApiResponse<AdminProduct>>(
        '/api/v1/admin/products',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Create new product with JSON (simpler approach)
   */
  async createProductJSON(productData: ProductCreateRequest): Promise<ApiResponse<AdminProduct>> {
    try {
      const response = await privateAPI.post<ApiResponse<AdminProduct>>(
        '/api/v1/admin/products',
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId: number, productData: Partial<ProductCreateRequest>): Promise<ApiResponse<AdminProduct>> {
    try {
      const response = await privateAPI.put<ApiResponse<AdminProduct>>(
        `/api/v1/admin/products/${productId}`,
        productData
      );
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number): Promise<ApiResponse<void>> {
    try {
      const response = await privateAPI.delete<ApiResponse<void>>(
        `/api/v1/admin/products/${productId}`
      );
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get admin orders with pagination and filters
   */
  async getAdminOrders(params: AdminOrdersParams): Promise<ApiResponse<{ items: AdminOrder[]; pagination: any }>> {
    try {
      const response = await privateAPI.get<ApiResponse<{ items: AdminOrder[]; pagination: any }>>(
        '/api/v1/admin/orders',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(data: { orderId: number; status: string }): Promise<ApiResponse<AdminOrder>> {
    try {
      const response = await privateAPI.patch<ApiResponse<AdminOrder>>(
        `/api/v1/admin/orders/${data.orderId}/status`,
        { status: data.status }
      );
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get admin users with pagination and filters
   */
  async getAdminUsers(params: AdminUsersParams): Promise<ApiResponse<{ items: AdminUser[]; pagination: any }>> {
    try {
      const response = await privateAPI.get<ApiResponse<{ items: AdminUser[]; pagination: any }>>(
        '/api/v1/admin/users',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userData: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await privateAPI.put<ApiResponse<AdminUser>>(
        `/api/v1/admin/users/${userData.id}`,
        userData
      );
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await privateAPI.get<ApiResponse<DashboardStats>>('/api/v1/admin/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default new AdminService();
