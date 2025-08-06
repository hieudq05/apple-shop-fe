import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Eye,
    Check,
    X,
    Star,
    Send,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import reviewService from "@/services/reviewService";
import type { Review, ReviewDetails } from "@/types/review";
import { Helmet } from "react-helmet-async";

const AdminReviewsPage: React.FC = () => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedReview, setSelectedReview] = useState<ReviewDetails | null>(
        null
    );
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");
    const [activeTab, setActiveTab] = useState("all");

    const pageSize = 10;

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: currentPage - 1,
                size: pageSize,
                approved:
                    activeTab === "approved"
                        ? true
                        : activeTab === "pending"
                        ? false
                        : undefined,
                rating:
                    ratingFilter !== "ALL" ? parseInt(ratingFilter) : undefined,
                search: searchQuery || undefined,
            };

            const response = await reviewService.getAllReviews(params);

            if (response.success && response.data) {
                setReviews(response.data.reviews || response.data);
                setTotalPages(
                    response.meta?.totalPage ||
                        Math.ceil((response.data.length || 0) / pageSize)
                );
                setTotalElements(
                    response.meta?.totalElements || response.data.length || 0
                );
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách đánh giá",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, ratingFilter, searchQuery, activeTab, toast]);

    const fetchReviewDetail = async (reviewId: number) => {
        try {
            const response = await reviewService.getReviewById(reviewId);
            if (response.success && response.data) {
                setSelectedReview(response.data);
                setReplyContent(response.data.replyContent || "");
                setShowDetailDialog(true);
            }
        } catch (error) {
            console.error("Error fetching review detail:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải chi tiết đánh giá",
                variant: "destructive",
            });
        }
    };

    const handleApproveReview = async (reviewId: number, approve: boolean) => {
        try {
            const response = await reviewService.approveReview(reviewId);

            if (response.success) {
                toast({
                    title: "Thành công",
                    description: approve
                        ? "Đã duyệt đánh giá"
                        : "Đã từ chối đánh giá",
                });
                fetchReviews();
                if (selectedReview?.id === reviewId) {
                    setShowDetailDialog(false);
                }
            }
        } catch (error) {
            console.error("Error updating review status:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật trạng thái đánh giá",
                variant: "destructive",
            });
        }
    };

    const handleReplyToReview = async () => {
        if (!selectedReview || !replyContent.trim()) return;

        try {
            const response = await reviewService.replyToReview(
                selectedReview.id,
                replyContent.trim()
            );

            if (response.success) {
                toast({
                    title: "Thành công",
                    description: "Đã gửi phản hồi",
                });
                setShowDetailDialog(false);
                fetchReviews();
            }
        } catch (error) {
            console.error("Error replying to review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể gửi phản hồi",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchReviews();
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (isApproved: boolean) => {
        return isApproved ? (
            <Badge className="bg-green-500/10 text-green-500 border">
                Đã duyệt
            </Badge>
        ) : (
            <Badge className="bg-yellow-500/10 text-yellow-500">
                Chờ duyệt
            </Badge>
        );
    };

    const filteredReviews = reviews.filter((review) => {
        if (activeTab === "approved") return review.isApproved;
        if (activeTab === "pending") return !review.isApproved;
        return true;
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Helmet>
                <title>Quản lý đánh giá - Apple</title>
            </Helmet>
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    Quản lý đánh giá
                </h2>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng đánh giá
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalElements}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Chờ duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {reviews.filter((r) => !r.isApproved).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đã phê duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {reviews.filter((r) => r.isApproved).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đánh giá trung bình
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl font-bold">
                                {reviews.length > 0
                                    ? (
                                          reviews.reduce(
                                              (sum, r) => sum + r.rating,
                                              0
                                          ) / reviews.length
                                      ).toFixed(1)
                                    : "0.0"}
                            </div>
                            <StarRating
                                rating={
                                    reviews.length > 0
                                        ? reviews.reduce(
                                              (sum, r) => sum + r.rating,
                                              0
                                          ) / reviews.length
                                        : 0
                                }
                                size="sm"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tên người dùng..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </form>
                        <Select
                            value={ratingFilter}
                            onValueChange={setRatingFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Lọc theo sao" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả sao</SelectItem>
                                <SelectItem value="5">5 sao</SelectItem>
                                <SelectItem value="4">4 sao</SelectItem>
                                <SelectItem value="3">3 sao</SelectItem>
                                <SelectItem value="2">2 sao</SelectItem>
                                <SelectItem value="1">1 sao</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" onClick={handleSearch}>
                            <Filter className="w-4 h-4 mr-2" />
                            Lọc
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đánh giá</CardTitle>
                    <CardDescription>
                        Hiển thị {filteredReviews.length} trên {totalElements}{" "}
                        đánh giá
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="all">
                                Tất cả ({reviews.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending">
                                Chờ duyệt (
                                {reviews.filter((r) => !r.isApproved).length})
                            </TabsTrigger>
                            <TabsTrigger value="approved">
                                Đã duyệt (
                                {reviews.filter((r) => r.isApproved).length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value={activeTab}
                            className="space-y-4 mt-4"
                        >
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
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
                            ) : filteredReviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        Không có đánh giá nào
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border rounded-2xl hover:bg-foreground/3 p-4 space-y-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="size-12">
                                                        <AvatarImage
                                                            className="object-cover size-12"
                                                            src={
                                                                review.user
                                                                    .image
                                                            }
                                                            alt={`${review.user.firstName} ${review.user.lastName}`}
                                                        />
                                                        <AvatarFallback>
                                                            {review.user.firstName.charAt(
                                                                0
                                                            )}
                                                            {review.user.lastName.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex gap-1 items-end-safe flex-wrap">
                                                            <h4 className="font-medium">
                                                                {
                                                                    review.user
                                                                        .firstName
                                                                }{" "}
                                                                {
                                                                    review.user
                                                                        .lastName
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                (
                                                                {
                                                                    review.user
                                                                        .email
                                                                }
                                                                )
                                                            </p>
                                                        </div>
                                                        <div className="space-x-2 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                {review.rating}{" "}
                                                                <Star className="size-4 text-blue-500 fill-current" />
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(
                                                                    review.createdAt
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {getStatusBadge(
                                                        review.isApproved
                                                    )}

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    fetchReviewDetail(
                                                                        review.id
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Chi tiết
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Chi tiết
                                                                    đánh giá
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Xem chi tiết
                                                                    và quản lý
                                                                    đánh giá của
                                                                    khách hàng
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            {selectedReview && (
                                                                <div className="space-y-4">
                                                                    {/* User info */}
                                                                    <div className="flex items-center space-x-4">
                                                                        <Avatar className="size-12">
                                                                            <AvatarImage
                                                                                src={
                                                                                    selectedReview
                                                                                        .user
                                                                                        .image
                                                                                }
                                                                                className="object-cover size-12"
                                                                                alt={`${selectedReview.user.firstName} ${selectedReview.user.lastName}`}
                                                                            />
                                                                            <AvatarFallback>
                                                                                {selectedReview.user.firstName.charAt(
                                                                                    0
                                                                                )}
                                                                                {selectedReview.user.lastName.charAt(
                                                                                    0
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <h4 className="font-medium">
                                                                                {
                                                                                    selectedReview
                                                                                        .user
                                                                                        .firstName
                                                                                }{" "}
                                                                                {
                                                                                    selectedReview
                                                                                        .user
                                                                                        .lastName
                                                                                }
                                                                            </h4>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {
                                                                                    selectedReview
                                                                                        .user
                                                                                        .email
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Product info */}
                                                                    {selectedReview.stock && (
                                                                        <div className="border rounded-lg p-3">
                                                                            <div className="flex items-center space-x-3">
                                                                                {selectedReview
                                                                                    .stock
                                                                                    .productPhotos?.[0] && (
                                                                                    <img
                                                                                        src={
                                                                                            selectedReview
                                                                                                .stock
                                                                                                .productPhotos[0]
                                                                                                .imageUrl
                                                                                        }
                                                                                        alt={
                                                                                            selectedReview
                                                                                                .stock
                                                                                                .productPhotos[0]
                                                                                                .alt
                                                                                        }
                                                                                        className="w-12 h-12 object-cover rounded"
                                                                                    />
                                                                                )}
                                                                                <div>
                                                                                    <h5 className="font-medium">
                                                                                        {
                                                                                            selectedReview
                                                                                                .stock
                                                                                                .product
                                                                                                .name
                                                                                        }
                                                                                    </h5>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Review content */}
                                                                    <div>
                                                                        <div className="flex items-center space-x-2 mb-2">
                                                                            <StarRating
                                                                                rating={
                                                                                    selectedReview.rating
                                                                                }
                                                                                size="sm"
                                                                            />
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {formatDate(
                                                                                    selectedReview.createdAt
                                                                                )}
                                                                            </span>
                                                                            {getStatusBadge(
                                                                                selectedReview.isApproved
                                                                            )}
                                                                        </div>
                                                                        <p className="text-foreground">
                                                                            {
                                                                                selectedReview.content
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    {/* Admin reply */}
                                                                    {selectedReview.replyContent && (
                                                                        <div className="bg-blue-500/10 p-3 rounded border-l-4 border-blue-500">
                                                                            <p className="text-sm font-medium text-blue-400">
                                                                                Phản
                                                                                hồi
                                                                                từ
                                                                                cửa
                                                                                hàng:
                                                                            </p>
                                                                            <p className="text-sm text-foreground mt-1">
                                                                                {
                                                                                    selectedReview.replyContent
                                                                                }
                                                                            </p>
                                                                            {selectedReview.repliedBy && (
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    Bởi:{" "}
                                                                                    {
                                                                                        selectedReview
                                                                                            .repliedBy
                                                                                            .firstName
                                                                                    }{" "}
                                                                                    {
                                                                                        selectedReview
                                                                                            .repliedBy
                                                                                            .lastName
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Action buttons */}
                                                                    <div className="flex justify-between items-center pt-4 border-t">
                                                                        {/* Reply section */}
                                                                        <div className="flex-1 ml-4">
                                                                            <div className="flex space-x-2">
                                                                                <Textarea
                                                                                    placeholder="Viết phản hồi..."
                                                                                    value={
                                                                                        replyContent
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setReplyContent(
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="min-h-[60px]"
                                                                                />
                                                                                <div className="flex flex-col items-end gap-2">
                                                                                    <Button
                                                                                        onClick={
                                                                                            handleReplyToReview
                                                                                        }
                                                                                        disabled={
                                                                                            !replyContent.trim()
                                                                                        }
                                                                                        className="w-full flex justify-start gap-2"
                                                                                    >
                                                                                        <Send className="w-4 h-4" />
                                                                                        Gửi
                                                                                    </Button>
                                                                                    <div className="flex space-x-2">
                                                                                        {!selectedReview.isApproved && (
                                                                                            <Button
                                                                                                onClick={() =>
                                                                                                    handleApproveReview(
                                                                                                        selectedReview.id,
                                                                                                        true
                                                                                                    )
                                                                                                }
                                                                                                className="bg-green-600 text-white hover:bg-green-700 flex justify-start gap-2"
                                                                                            >
                                                                                                <Check className="w-4 h-4" />
                                                                                                Duyệt
                                                                                            </Button>
                                                                                        )}
                                                                                        {selectedReview.isApproved && (
                                                                                            <Button
                                                                                                variant="destructive"
                                                                                                onClick={() =>
                                                                                                    handleApproveReview(
                                                                                                        selectedReview.id,
                                                                                                        false
                                                                                                    )
                                                                                                }
                                                                                                className="flex justify-start gap-2"
                                                                                            >
                                                                                                <XCircle className="w-4 h-4 text-white " />
                                                                                                Từ
                                                                                                chối
                                                                                            </Button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>

                                                    {!review.isApproved && (
                                                        <div className="flex space-x-1">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleApproveReview(
                                                                        review.id,
                                                                        true
                                                                    )
                                                                }
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    handleApproveReview(
                                                                        review.id,
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Trang {currentPage} trên {totalPages}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Trước
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            Sau
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReviewsPage;
