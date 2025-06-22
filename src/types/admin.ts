// Admin-related type definitions

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birth: string;
  image: string;
  enabled: boolean;
  roles: Array<{
    id: number;
    authority: string;
    description: string;
  }>;
  totalOrders: number;
  totalSpent: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
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
  stocks: Array<{
    id: number;
    quantity: number;
    imageUrl: string;
    price: number;
  }>;
}

export interface AdminOrder {
  id: number;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  };
  createdAt: string;
  paymentType: string;
  approveAt?: string;
  approveBy?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  status: AdminOrderStatus;
  orderDetails: Array<{
    id: number;
    product: { id: number };
    productName: string;
    quantity: number;
    price: number;
    note: string;
    colorName: string;
    versionName: string;
    image_url: string;
  }>;
  shippingTrackingCode?: string;
}

export type AdminOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Product creation types
export interface ProductCreateRequest {
  name: string;
  description: string;
  createdBy: string;
  category: {
    id: number | null;
    name: string;
    image: string;
  };
  features: Array<{
    id: number | null;
    name: string;
    description: string;
    image: string;
  }>;
  stocks: Array<{
    color: {
      id: number | null;
      name: string;
      hexCode: string;
    };
    quantity: number;
    price: number;
    productPhotos: Array<{
      imageUrl: string;
      alt: string;
    }>;
    instanceProperties: Array<{
      id: number | null;
      name: string;
    }>;
  }>;
}

export interface ProductColor {
  id: number | null;
  name: string;
  hexCode: string;
}

export interface ProductFeature {
  id: number | null;
  name: string;
  description: string;
  image: string;
}

export interface ProductPhoto {
  imageUrl: string;
  alt: string;
}

export interface ProductInstanceProperty {
  id: number | null;
  name: string;
}

export interface ProductStock {
  color: ProductColor;
  quantity: number;
  price: number;
  productPhotos: ProductPhoto[];
  instanceProperties: ProductInstanceProperty[];
}

export interface ProductCategory {
  id: number | null;
  name: string;
  image: string;
}
