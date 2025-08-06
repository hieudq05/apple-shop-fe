import React, { useState, useEffect, useCallback, useContext } from "react";

import {
    Star,
    Filter,
    MessageCircle,
    ChevronDown,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ReviewFormDialog from "@/components/ReviewFormDialog";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/AuthContext";
import reviewService from "@/services/reviewService";
import type { Review } from "@/types/review";

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    onReviewUpdate?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
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
                    parseInt(productId)
                );

                if (response.success && response.data) {
                    if (page === 1) {
                        setReviews(response.data.data || []);
                    } else {
                        setReviews((prev) => [
                            ...prev,
                            ...(response.data?.data || []),
                        ]);
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

    // Helper function to format time
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        } else if (diffInMinutes < 1440) {
            // 24 hours
            return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
        }
    };

    // Helper function to get user initials
    const getUserInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Reviews Section */}
            <Card className="bg-background border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        {reviews.length > 0 ? (
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-2xl">
                                    {reviews.length} đánh giá
                                </CardTitle>
                            </div>
                        ) : (
                            <></>
                        )}
                        {/* <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <Select
                                value={ratingFilter}
                                onValueChange={handleRatingFilterChange}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Lọc" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="5">
                                        ⭐⭐⭐⭐⭐ 5 sao
                                    </SelectItem>
                                    <SelectItem value="4">
                                        ⭐⭐⭐⭐ 4 sao
                                    </SelectItem>
                                    <SelectItem value="3">
                                        ⭐⭐⭐ 3 sao
                                    </SelectItem>
                                    <SelectItem value="2">
                                        ⭐⭐ 2 sao
                                    </SelectItem>
                                    <SelectItem value="1">⭐ 1 sao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>
                </CardHeader>

                <CardContent>
                    {loading && currentPage === 1 ? (
                        <div className="space-y-4 p-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <></>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {reviews.map((review) => (
                                <div key={review.id}>
                                    <div className="bg-foreground/3 p-6 flex gap-4 hover:bg-foreground/5 border rounded-4xl overflow-hidden">
                                        {/* Avatar */}
                                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                            <AvatarImage
                                                className="object-cover"
                                                src={review.user.image}
                                                alt={`${review.user.firstName} ${review.user.lastName}`}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                {getUserInitials(
                                                    review.user.firstName,
                                                    review.user.lastName
                                                )}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex flex-col gap-1">
                                                        <h4 className="font-semibold text-foreground">
                                                            {
                                                                review.user
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                review.user
                                                                    .lastName
                                                            }
                                                        </h4>
                                                        <div className="flex items-center gap-1 m-0">
                                                            {[...Array(5)].map(
                                                                (_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${
                                                                            i <
                                                                            review.rating
                                                                                ? "text-blue-500 fill-current"
                                                                                : "text-gray-300"
                                                                        }`}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span>
                                                            {formatTimeAgo(
                                                                review.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Variant Info */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="default">
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                review.stock
                                                                    .color
                                                                    .hexCode,
                                                        }}
                                                    ></div>
                                                    {review.stock.color.name}
                                                </Badge>
                                                {review.stock.instanceProperties.map(
                                                    (property) => (
                                                        <Badge
                                                            key={property.id}
                                                            variant="outline"
                                                            className="text-foreground"
                                                        >
                                                            {property.name}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>

                                            {/* Review Content */}
                                            <div className="space-y-3">
                                                <p className="text-foreground leading-relaxed">
                                                    {review.content}
                                                </p>
                                            </div>

                                            {/* Admin Reply */}
                                            {review.replyContent && (
                                                <div className="mt-4 p-4 bg-blue-500/10 rounded-2xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage
                                                                className="object-cover"
                                                                src={
                                                                    review
                                                                        .repliedBy
                                                                        ?.image
                                                                }
                                                                alt={`${review.repliedBy?.firstName} ${review.repliedBy?.lastName}`}
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                                {getUserInitials(
                                                                    review
                                                                        .repliedBy
                                                                        ?.firstName ||
                                                                        "Cửa hàng",
                                                                    review
                                                                        .repliedBy
                                                                        ?.lastName ||
                                                                        ""
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <h3 className="font-semibold">
                                                            {
                                                                review.repliedBy
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                review.repliedBy
                                                                    .lastName
                                                            }
                                                        </h3>
                                                        <Badge className="bg-blue-600 text-white">
                                                            Phản hồi từ cửa hàng
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                        {review.replyContent}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {hasMoreReviews && (
                                <div className="p-6 text-center border-t bg-gray-50/30">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-8"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4 mr-2" />
                                                Xem thêm đánh giá
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form Dialog */}
            <ReviewFormDialog
                open={showReviewForm}
                onOpenChange={setShowReviewForm}
                stockId=""
                orderId=""
                onSuccess={handleReviewSubmitted}
            />
        </div>
    );
};

export default ProductReviews;
