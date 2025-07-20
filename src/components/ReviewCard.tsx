import React, { useState, useContext } from "react";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Reply,
    Check,
    X,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import ReviewFormDialog from "@/components/ReviewFormDialog";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/AuthContext";
import reviewService from "@/services/reviewService";
import type { Review, ReviewDetails } from "@/types/review";

interface ReviewCardProps {
    review: ReviewDetails;
    onReviewUpdate?: () => void;
    isAdmin?: boolean;
    showProductInfo?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    onReviewUpdate,
    isAdmin = false,
    showProductInfo = false,
}) => {
    const { toast } = useToast();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState(
        review.adminReply?.content || ""
    );
    const [loading, setLoading] = useState(false);

    const isOwner = user?.email === review.user?.email;
    const canEdit = isOwner && review.status === "PENDING";
    const canDelete = isOwner;

    const getStatusBadge = (status: Review["status"]) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Chờ duyệt
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                    >
                        <Check className="w-3 h-3 mr-1" />
                        Đã duyệt
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Huỳ phê duyệt
                    </Badge>
                );
            default:
                return null;
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await reviewService.deleteReview(review.id);
            toast({
                title: "Thành công",
                description: "Đã xóa đánh giá",
            });
            onReviewUpdate?.();
        } catch (error) {
            console.error("Error deleting review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa đánh giá",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            await reviewService.approveReview(review.id);
            toast({
                title: "Thành công",
                description: "Đã phê duyệt đánh giá",
            });
            onReviewUpdate?.();
        } catch (error) {
            console.error("Error approving review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể phê duyệt đánh giá",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await reviewService.rejectReview(review.id);
            toast({
                title: "Thành công",
                description: "Đã từ chối đánh giá",
            });
            onReviewUpdate?.();
        } catch (error) {
            console.error("Error rejecting review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể từ chối đánh giá",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập nội dung phản hồi",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            if (review.adminReply) {
                await reviewService.updateReply(review.id, replyContent);
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật phản hồi",
                });
            } else {
                await reviewService.replyToReview({
                    reviewId: review.id,
                    content: replyContent,
                });
                toast({
                    title: "Thành công",
                    description: "Đã gửi phản hồi",
                });
            }
            setShowReplyForm(false);
            onReviewUpdate?.();
        } catch (error) {
            console.error("Error replying to review:", error);
            toast({
                title: "Lỗi",
                description: "Không thể gửi phản hồi",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) return "vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;

        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={review.user?.image} />
                        <AvatarFallback>
                            {review.user?.lastName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-medium">
                                {review.user?.firstName} {review.user?.lastName}
                            </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <StarRating rating={review.rating} size="sm" />
                            <span>•</span>
                            <span>{formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isAdmin && (
                                <>
                                    {review.isApproved === false && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={handleApprove}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Phê duyệt
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleReject}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Huỷ phê duyệt
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => setShowReplyForm(true)}
                                    >
                                        <Reply className="w-4 h-4 mr-2" />
                                        {review.isApproved
                                            ? "Sửa phản hồi"
                                            : "Phản hồi"}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {canEdit && isAdmin && (
                                <DropdownMenuItem
                                    onClick={() => setShowEditDialog(true)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                            )}
                            {canDelete && isAdmin && (
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Product info */}
            {showProductInfo && (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <img
                        src={review.stock?.productPhotos[0]?.imageUrl}
                        alt={review.stock?.productPhotos[0]?.alt}
                        className="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-sm font-medium">
                        {review.stock?.product?.name}
                    </span>
                </div>
            )}

            {/* Review content */}
            <div className="space-y-2">
                <h5 className="font-medium">{review.content}</h5>
                <p className="text-gray-700">{review.content}</p>
            </div>

            {/* Admin reply */}
            {review.replyContent && (
                <div className="flex gap-0.5">
                    <div className="w-1 bg-blue-400 rounded-sm"></div>
                    <div className="p-3 rounded-sm w-full">
                        <div className="flex items-center space-x-2 text-sm text-blue-700 mb-1">
                            <span className="font-medium">
                                Phản hồi từ {review.repliedBy?.firstName}{" "}
                                {review.repliedBy?.lastName}
                            </span>
                        </div>
                        <p className="text-blue-900">{review.replyContent}</p>
                    </div>
                </div>
            )}

            {/* Reply form */}
            {showReplyForm && isAdmin && (
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <Textarea
                        placeholder="Nhập phản hồi..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReplyForm(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleReply}
                            disabled={loading || !replyContent.trim()}
                        >
                            {loading ? "Đang gửi..." : "Gửi phản hồi"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <ReviewFormDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                review={review}
                onSuccess={onReviewUpdate}
            />

            {/* Delete Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đánh giá này? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ReviewCard;
