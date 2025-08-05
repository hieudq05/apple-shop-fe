import React, { useState, useEffect, useCallback, useContext } from "react";
import { Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ReviewCard from "@/components/ReviewCard";
import ReviewFormDialog from "@/components/ReviewFormDialog";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/AuthContext";
import reviewService from "@/services/reviewService";
import type { Review, ReviewStatistics } from "@/types/review";

interface ProductReviewsProps {
    productId: number;
    productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
    productId,
    productName,
}) => {
    const { toast } = useToast();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(false);

    const pageSize = 10;

    const fetchReviews = useCallback(
        async (page = 1, rating?: number) => {
            try {
                setLoading(true);

                const params = {
                    page: page - 1,
                    size: pageSize,
                    rating,
                };

                const response = await reviewService.getProductReviews(
                    productId,
                    params
                );

                if (response.success && response.data) {
                    if (page === 1) {
                        setReviews(response.data);
                    } else {
                        setReviews((prev) => [...prev, ...response.data]);
                    }
                    setHasMoreReviews(page < response.data.totalPages);
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải đánh giá",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        },
        [productId, toast]
    );

    useEffect(() => {
        fetchReviews(
            1,
            ratingFilter !== "ALL" ? parseInt(ratingFilter) : undefined
        );
    }, [fetchReviews, ratingFilter]);

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        fetchReviews(
            nextPage,
            ratingFilter !== "ALL" ? parseInt(ratingFilter) : undefined
        );
    };

    const handleRatingFilterChange = (value: string) => {
        setRatingFilter(value);
        setCurrentPage(1);
    };

    const handleReviewSubmitted = () => {
        fetchReviews(
            1,
            ratingFilter !== "ALL" ? parseInt(ratingFilter) : undefined
        );
    };

    const canWriteReview = user !== null;

    return (
        <div className="space-y-6">
            {/* Write Review Section */}
            {/* {canWriteReview && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="font-medium mb-2">
                                Chia sẻ đánh giá của bạn
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Giúp khách hàng khác bằng cách chia sẻ trải
                                nghiệm của bạn về sản phẩm này
                            </p>
                            <Button onClick={() => setShowReviewForm(true)}>
                                Viết đánh giá
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )} */}

            {/* Reviews List */}
            {reviews.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Đánh giá ({reviews.length || 0})
                            </CardTitle>
                            {/* <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4" />
                            <Select
                                value={ratingFilter}
                                onValueChange={handleRatingFilterChange}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Lọc theo sao" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="5">5 sao</SelectItem>
                                    <SelectItem value="4">4 sao</SelectItem>
                                    <SelectItem value="3">3 sao</SelectItem>
                                    <SelectItem value="2">2 sao</SelectItem>
                                    <SelectItem value="1">1 sao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && currentPage === 1 ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border rounded-lg p-4 animate-pulse"
                                    >
                                        <div className="flex space-x-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    {ratingFilter !== "ALL"
                                        ? `Chưa có đánh giá ${ratingFilter} sao nào`
                                        : "Chưa có đánh giá nào cho sản phẩm này"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onReviewUpdate={handleReviewSubmitted}
                                    />
                                ))}

                                {hasMoreReviews && (
                                    <div className="text-center pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Đang tải..."
                                                : "Xem thêm đánh giá"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Review Form Dialog */}
            <ReviewFormDialog
                open={showReviewForm}
                onOpenChange={setShowReviewForm}
                productId={productId}
                productName={productName}
                onSuccess={handleReviewSubmitted}
            />
        </div>
    );
};

export default ProductReviews;
