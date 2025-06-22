// API response types

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta?: {
    currentPage: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
  };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
}

export interface AdminProductsParams extends PaginationParams {
  categoryId?: number;
}

export interface AdminOrdersParams extends PaginationParams {
  customerEmail?: string;
  status?: string;
}

export interface AdminUsersParams extends PaginationParams {
  role?: string;
  enabled?: boolean;
}

export interface ProductDetailAdminResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  };
  updatedAt: string;
  updatedBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  };
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
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}
