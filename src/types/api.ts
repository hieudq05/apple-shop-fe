// API Types based on backend structure

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    msg?: string; // Backend có thể dùng msg thay vì message
    data?: T;
    meta?: MetadataResponse;
}

export interface ErrorResponse {
    errorCode: string;
    errorMessage: string;
    errors?: ValidationErrorDetail[];
}

export interface MetadataResponse {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPage: number;
}

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface ValidationErrorDetail {
    field: string;
    message: string;
}

// Authentication Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    birth: string; // LocalDate format: YYYY-MM-DD
    email: string;
    phone: string;
    password: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    refreshToken: string;
}

export interface OtpResponse {
    email: string;
    expiredIn: number; // seconds
}

export interface OtpValidationRequest {
    email: string;
    otp: string;
}

export interface OtpValidationResponse {
    isValid: boolean;
}

export interface GgTokenRequest {
    token: string;
}

// Product Types
export interface ProductUserResponse {
    id: number;
    name: string;
    title: string;
    description?: string;
    category: CategoryResponse;
    features: FeatureResponse[];
    stocks: ProductStockResponse[];
    instanceProperties: InstancePropertyResponse[];
}

export interface CategoryResponse {
    id: number;
    name: string;
    slug: string;
}

export interface FeatureResponse {
    id: number;
    name: string;
    value: string;
}

export interface ProductStockResponse {
    id: number;
    color: ColorResponse;
    quantity: number;
    price: number;
    photos: string[];
}

export interface ColorResponse {
    id: number;
    name: string;
    hex: string;
}

export interface InstancePropertyResponse {
    id: number;
    name: string;
    value: string;
}

// Cart Types
export interface AddCartItemRequest {
    productId: number;
    colorId: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CartItemResponse {
    id: number;
    product: ProductUserResponse;
    color: ColorResponse;
    quantity: number;
    price: number;
    totalPrice: number;
}

// Order Types
export interface UserCreateOrderRequest {
    shippingAddress: ShippingAddressRequest;
    paymentMethod: string;
    note?: string;
}

export interface ShippingAddressRequest {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
}

export interface OrderUserResponse {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingAddress: ShippingAddressRequest;
    items: OrderItemResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItemResponse {
    id: number;
    product: ProductUserResponse;
    color: ColorResponse;
    quantity: number;
    price: number;
    totalPrice: number;
}

// Pagination
export interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Admin Types
export interface CreateProductRequest {
    name: string;
    title: string;
    description?: string;
    categoryId: number;
    features: CreateFeatureRequest[];
    stocks: CreateProductStockRequest[];
    instanceProperties: CreateInstancePropertyRequest[];
}

export interface CreateFeatureRequest {
    name: string;
    value: string;
}

export interface CreateProductStockRequest {
    colorId: number;
    quantity: number;
    price: number;
    photos: string[];
}

export interface CreateInstancePropertyRequest {
    name: string;
    value: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: number;
}

// Blog Types
export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    author: {
        id: number;
        name: string;
        email: string;
    };
    category: {
        id: number;
        name: string;
    };
    tags: string[];
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    commentCount: number;
}

export interface CreateBlogRequest {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    categoryId: number;
    tags: string[];
    status: "DRAFT" | "PUBLISHED";
}

export interface UpdateBlogRequest extends CreateBlogRequest {
    id: number;
}
