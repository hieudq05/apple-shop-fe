import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import reviewService from "@/services/reviewService";
import type {
    CreateReviewRequest,
    UpdateReviewRequest,
    Review,
} from "@/types/review";

interface ReviewFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId?: number;
    productName?: string;
    review?: Review; // For editing existing review
    onSuccess?: () => void;
}

const ReviewFormDialog: React.FC<ReviewFormDialogProps> = ({
    open,
    onOpenChange,
    productId,
    productName,
    review,
    onSuccess,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating: review?.rating || 0,
        title: review?.title || "",
        content: review?.content || "",
    });

    const isEditing = !!review;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn số sao đánh giá",
                variant: "destructive",
            });
            return;
        }

        if (!formData.title.trim() || !formData.content.trim()) {
            toast({
                title: "Lỗi",
                description:
                    "Vui lòng điền đầy đủ tiêu đề và nội dung đánh giá",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const updateData: UpdateReviewRequest = {
                    rating: formData.rating,
                    title: formData.title,
                    content: formData.content,
                };
                await reviewService.updateReview(review.id, updateData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật đánh giá thành công",
                });
            } else {
                if (!productId) {
                    throw new Error("Product ID is required");
                }
                const createData: CreateReviewRequest = {
                    productId,
                    rating: formData.rating,
                    title: formData.title,
                    content: formData.content,
                };
                await reviewService.createReview(createData);
                toast({
                    title: "Thành công",
                    description: "Tạo đánh giá thành công",
                });
            }

            onOpenChange(false);
            onSuccess?.();

            // Reset form
            if (!isEditing) {
                setFormData({
                    rating: 0,
                    title: "",
                    content: "",
                });
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Lỗi",
                description: isEditing
                    ? "Không thể cập nhật đánh giá"
                    : "Không thể tạo đánh giá",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật đánh giá của bạn về sản phẩm"
                            : `Chia sẻ đánh giá của bạn về ${productName}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Đánh giá sao</Label>
                        <StarRating
                            rating={formData.rating}
                            interactive
                            size="lg"
                            onRatingChange={(rating) =>
                                setFormData((prev) => ({ ...prev, rating }))
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề đánh giá</Label>
                        <Input
                            id="title"
                            placeholder="Nhập tiêu đề đánh giá..."
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Nội dung đánh giá</Label>
                        <Textarea
                            id="content"
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                            value={formData.content}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                }))
                            }
                            rows={4}
                            maxLength={1000}
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {formData.content.length}/1000
                        </div>
                    </div>

                    <Alert>
                        <AlertDescription>
                            Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển
                            thị công khai.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Đang xử lý..."
                                : isEditing
                                ? "Cập nhật"
                                : "Gửi đánh giá"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewFormDialog;
