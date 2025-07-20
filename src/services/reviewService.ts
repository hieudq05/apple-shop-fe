// Review service
import { privateAPI, publicAPI, userRoleAPI } from "../utils/axios";
import type { ApiResponse, PaginationParams } from "../types/api";
import type {
    Review,
    ReviewDetails,
    CreateReviewRequest,
    UpdateReviewRequest,
    ProductReviewStatistics,
} from "../types/review";

const reviewService = {
    // Admin review methods
    getAllReviews: async (
        params?: PaginationParams & {
            approved?: boolean;
            rating?: number;
            search?: string;
        }
    ): Promise<ApiResponse<Review[]>> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page !== undefined)
                queryParams.append("page", params.page.toString());
            if (params?.size)
                queryParams.append("size", params.size.toString());
            if (params?.approved !== undefined)
                queryParams.append("approved", params.approved.toString());
            if (params?.rating)
                queryParams.append("rating", params.rating.toString());
            if (params?.search) queryParams.append("search", params.search);

            const response = await privateAPI.get<Review[]>(
                `/reviews?${queryParams.toString()}`
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải danh sách đánh giá",
            };
        }
    },

    getReviewById: async (
        reviewId: number
    ): Promise<ApiResponse<ReviewDetails>> => {
        try {
            const response = await privateAPI.get<ReviewDetails>(
                `/reviews/${reviewId}`
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error fetching review detail:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải chi tiết đánh giá",
            };
        }
    },

    approveReview: async (reviewId: number): Promise<ApiResponse<Review>> => {
        try {
            const response = await privateAPI.put<Review>(
                `/reviews/${reviewId}/approve`
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error approving review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể duyệt đánh giá",
            };
        }
    },

    rejectReview: async (
        reviewId: number,
        reason?: string
    ): Promise<ApiResponse<Review>> => {
        try {
            const response = await privateAPI.put<Review>(
                `/reviews/${reviewId}/reject`,
                { reason }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error rejecting review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể từ chối đánh giá",
            };
        }
    },

    replyToReview: async (
        reviewId: number,
        replyContent: string
    ): Promise<ApiResponse<Review>> => {
        try {
            const response = await privateAPI.put<Review>(
                `/reviews/reply/${reviewId}`,
                { replyContent }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error replying to review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể gửi phản hồi",
            };
        }
    },

    // User review methods
    createReview: async (
        reviewData: CreateReviewRequest
    ): Promise<ApiResponse<Review>> => {
        try {
            const response = await privateAPI.post<Review>(
                "/reviews",
                reviewData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tạo đánh giá",
            };
        }
    },

    updateReview: async (
        reviewId: number,
        reviewData: UpdateReviewRequest
    ): Promise<ApiResponse<Review>> => {
        try {
            const response = await privateAPI.put<Review>(
                `/reviews/${reviewId}`,
                reviewData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể cập nhật đánh giá",
            };
        }
    },

    deleteReview: async (reviewId: number): Promise<ApiResponse<void>> => {
        try {
            await privateAPI.delete(`/reviews/${reviewId}`);
            return { success: true };
        } catch (error) {
            console.error("Error deleting review:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể xóa đánh giá",
            };
        }
    },

    getUserReviews: async (
        params?: PaginationParams
    ): Promise<
        ApiResponse<{
            reviews: Review[];
            totalPages: number;
            totalElements: number;
        }>
    > => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page !== undefined)
                queryParams.append("page", params.page.toString());
            if (params?.size)
                queryParams.append("size", params.size.toString());

            const response = await userRoleAPI.get<{
                reviews: Review[];
                totalPages: number;
                totalElements: number;
            }>(`/reviews/my?${queryParams.toString()}`);
            return response;
        } catch (error) {
            console.error("Error fetching user reviews:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải đánh giá của bạn",
            };
        }
    },

    getProductReviews: async (
        productId: number,
        params?: PaginationParams & { rating?: number; status?: string }
    ): Promise<
        ApiResponse<{
            reviews: Review[];
            totalPages: number;
            totalElements: number;
        }>
    > => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page !== undefined)
                queryParams.append("page", params.page.toString());
            if (params?.size)
                queryParams.append("size", params.size.toString());
            // if (params?.rating)
            //     queryParams.append("rating", params.rating.toString());

            const response = await publicAPI.get<{
                reviews: Review[];
                totalPages: number;
                totalElements: number;
            }>(`/reviews/product/${productId}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            console.error("Error fetching product reviews:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải đánh giá sản phẩm",
            };
        }
    },

    getProductStatistics: async (
        productId: number
    ): Promise<ApiResponse<ProductReviewStatistics>> => {
        try {
            const response = await privateAPI.get<
                ApiResponse<ReviewStatistics>
            >(`/reviews/statistics/avg-review/${productId}`);
            return response;
        } catch (error) {
            console.error("Error fetching product review statistics:", error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải thống kê đánh giá sản phẩm",
            };
        }
    },
};

export default reviewService;
