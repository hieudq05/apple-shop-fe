import React, { useState, useEffect, useCallback, useContext } from "react";
import { Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StarRating from "@/components/StarRating";
import ReviewFormDialog from "@/components/ReviewFormDialog";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/AuthContext";
import reviewService from "@/services/reviewService";
import type { Review } from "@/types/review";

type ReviewStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const UserReviews: React.FC = () => {
    const { toast } = useToast();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [reviews, setReviews] = useState<Review[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReviewStatus>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(false);

    const pageSize = 10;

    const fetchUserReviews = useCallback(
        async (page = 1) => {
            if (!user?.email) return;

            try {
                setLoading(true);

                const params = {
                    page: page - 1,
                    size: pageSize,
                };

                const response = await reviewService.getUserReviews(params);

                if (response.success && response.data) {
                    if (page === 1) {
                        setReviews(response.data);
                    } else {
                        setReviews((prev) => [...prev, ...response.data]);
                    }
                    setHasMoreReviews(page < response.meta?.totalPages);
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error("Error fetching user reviews:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải đánh giá của bạn",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        },
        [user?.email, toast]
    );

    useEffect(() => {
        if (user?.email) {
            fetchUserReviews();
        }
    }, [fetchUserReviews, user?.email]);

    useEffect(() => {
        let filtered = reviews;

        // Filter by status
        if (activeTab !== "ALL") {
            filtered = filtered.filter((review) => review.status === activeTab);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (review) =>
                    review.product.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    review.content
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        setFilteredReviews(filtered);
    }, [reviews, activeTab, searchTerm]);

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        fetchUserReviews(nextPage);
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowEditDialog(true);
    };

    const handleDeleteReview = async (reviewId: number) => {
        try {
            const response = await reviewService.deleteReview(reviewId);

            if (response.success) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa đánh giá",
                });

                // Remove the deleted review from state
                setReviews((prev) =>
                    prev.filter((review) => review.id !== reviewId)
                );
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa đánh giá",
                variant: "destructive",
            });
        }
    };

    const handleReviewUpdated = () => {
        setShowEditDialog(false);
        setEditingReview(null);
        fetchUserReviews();
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: {
                label: "Đang chờ",
                color: "bg-yellow-100 text-yellow-800",
            },
            APPROVED: {
                label: "Đã duyệt",
                color: "bg-green-100 text-green-800",
            },
            REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-800" },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return null;

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getTabCounts = () => {
        return {
            ALL: reviews?.length,
        };
    };

    const tabCounts = getTabCounts();

    if (!user) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-gray-500">
                        Vui lòng đăng nhập để xem đánh giá của bạn
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Đánh giá của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as ReviewStatus)
                        }
                    >
                        <TabsList className="grid w-full grid-cols-1">
                            <TabsTrigger value="ALL">
                                Tất cả ({tabCounts.ALL})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {loading && currentPage === 1 ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="border rounded-lg p-4 animate-pulse"
                                        >
                                            <div className="flex space-x-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredReviews?.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        {searchTerm
                                            ? "Không tìm thấy đánh giá nào phù hợp"
                                            : activeTab === "ALL"
                                            ? "Bạn chưa có đánh giá nào"
                                            : `Bạn chưa có đánh giá nào ở trạng thái này`}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredReviews?.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border rounded-lg p-4 space-y-4"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex space-x-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">
                                                            {review.productName}{" "}
                                                        </h4>
                                                        <div>
                                                            {
                                                                review.stock
                                                                    .color.name
                                                            }{" "}
                                                            •{" "}
                                                            {review.stock?.instanceProperties.map(
                                                                (prop) => {
                                                                    return (
                                                                        <span
                                                                            key={
                                                                                prop.id
                                                                            }
                                                                        >
                                                                            {
                                                                                prop.name
                                                                            }{" "}
                                                                        </span>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <StarRating
                                                                rating={
                                                                    review.rating
                                                                }
                                                                size="sm"
                                                            />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(
                                                                    review.createdAt
                                                                )}
                                                            </span>
                                                            {getStatusBadge(
                                                                review.status
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Xóa đánh giá
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Bạn có chắc
                                                                    chắn muốn
                                                                    xóa đánh giá
                                                                    này không?
                                                                    Hành động
                                                                    này không
                                                                    thể hoàn
                                                                    tác.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Hủy
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        handleDeleteReview(
                                                                            review.id
                                                                        )
                                                                    }
                                                                >
                                                                    Xóa
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-gray-700">
                                                    {review.content}
                                                </p>

                                                {review.adminReply && (
                                                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                                                        <p className="text-sm font-medium text-blue-700">
                                                            Phản hồi từ cửa
                                                            hàng:
                                                        </p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            {
                                                                review
                                                                    .adminReply
                                                                    .content
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
                                                    : "Xem thêm"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Edit Review Dialog */}
            <ReviewFormDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                productId={editingReview?.productId || 0}
                productName={editingReview?.productName || ""}
                review={editingReview || undefined}
                onSuccess={handleReviewUpdated}
            />
        </div>
    );
};

export default UserReviews;
