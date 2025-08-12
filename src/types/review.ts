// Review types
export interface Review {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        image?: string;
    };
    content: string;
    rating: number;
    createdAt: string;
    replyContent?: string;
    repliedBy?: {
        id: number;
        firstName: string;
        lastName: string;
        image?: string;
    };
    productId: number;
    productName: string;
    stock: {
        id: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        instanceProperties: Array<{
            id: number;
            name: string;
        }>;
    };
    isApproved?: boolean;
}

export interface ReviewDetails {
    id: number;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    content: string;
    rating: number;
    createdAt: string;
    isApproved: boolean;
    approvedBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    approvedAt?: string;
    replyContent?: string;
    repliedBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    stock: StockDto;
}

export interface StockDto {
    id: number;
    product: {
        id: number;
        name: string;
    };
    productPhotos: {
        id: number;
        imageUrl: string;
        alt: string;
    }[];
}

export interface CreateReviewRequest {
    stockId: number;
    rating: number;
    orderId: number;
    content: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    title?: string;
    content?: string;
}

export interface ProductReviewStatistics {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        rating: number;
        count: number;
        percentage: number;
    }[];
}

export interface AdminReplyRequest {
    reviewId: number;
    content: string;
}

export interface ReviewsResponse {
    reviews: Review[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface ReviewStatistics {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        rating: number;
        count: number;
        percentage: number;
    }[];
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
}
