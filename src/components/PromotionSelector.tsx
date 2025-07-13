import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Loader2, Search, Tag, X } from "lucide-react";
import promotionService, { type Promotion } from "../services/promotionService";

interface PromotionSelectorProps {
    selectedProductPromotion?: Promotion | null;
    selectedShippingPromotion?: Promotion | null;
    onProductPromotionSelect: (promotion: Promotion | null) => void;
    onShippingPromotionSelect: (promotion: Promotion | null) => void;
    cartTotal: number;
    disabled?: boolean;
}

const PromotionSelector: React.FC<PromotionSelectorProps> = ({
    selectedProductPromotion,
    selectedShippingPromotion,
    onProductPromotionSelect,
    onShippingPromotionSelect,
    cartTotal,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPromotions = useCallback(
        async (page: number, reset: boolean = false) => {
            try {
                setLoading(true);
                setError(null);

                const response = await promotionService.getPromotions({
                    page: page - 1, // API expects 0-based page
                    size: 10,
                    search: searchTerm.trim() || undefined,
                    status: "active",
                });

                if (response.success) {
                    const newPromotions = response.data.filter(
                        (promotion) =>
                            promotion.isActive &&
                            new Date(promotion.startDate) <= new Date() &&
                            new Date(promotion.endDate) >= new Date() &&
                            promotion.usageCount < promotion.usageLimit &&
                            (!promotion.minOrderValue ||
                                cartTotal >= promotion.minOrderValue)
                    );

                    if (reset) {
                        setPromotions(newPromotions);
                        setCurrentPage(1);
                    } else {
                        setPromotions((prev) => [...prev, ...newPromotions]);
                    }

                    setHasMorePages(
                        response.meta.currentPage < response.meta.totalPage - 1
                    );
                    setCurrentPage(page);
                } else {
                    setError(response.msg || "Lỗi khi tải promotions");
                }
            } catch (error) {
                console.error("Error loading promotions:", error);
                setError("Lỗi khi tải promotions");
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, cartTotal]
    );

    // Reset when dialog opens/closes
    useEffect(() => {
        if (isOpen && promotions.length === 0) {
            loadPromotions(1, true);
        }
    }, [isOpen, promotions.length, loadPromotions]);

    // Search debounce effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen) {
                loadPromotions(1, true);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, isOpen, loadPromotions]);

    const loadMorePromotions = () => {
        if (!loading && hasMorePages) {
            loadPromotions(currentPage + 1, false);
        }
    };

    const handleProductPromotionSelect = (promotion: Promotion) => {
        onProductPromotionSelect(promotion);
        setIsOpen(false);
    };

    const handleShippingPromotionSelect = (promotion: Promotion) => {
        onShippingPromotionSelect(promotion);
        setIsOpen(false);
    };

    const handleRemoveProductPromotion = () => {
        onProductPromotionSelect(null);
    };

    const handleRemoveShippingPromotion = () => {
        onShippingPromotionSelect(null);
    };

    const formatDiscountValue = (promotion: Promotion) => {
        if (promotion.promotionType === "PERCENTAGE") {
            return `${promotion.value}%`;
        } else if (promotion.promotionType === "FIXED_AMOUNT") {
            return `${promotion.value.toLocaleString("vi-VN")}đ`;
        } else {
            return "Miễn phí ship";
        }
    };

    const calculateDiscount = (promotion: Promotion) => {
        if (promotion.promotionType === "PERCENTAGE") {
            const discount = (cartTotal * promotion.value) / 100;
            return promotion.maxDiscountAmount
                ? Math.min(discount, promotion.maxDiscountAmount)
                : discount;
        } else if (promotion.promotionType === "FIXED_AMOUNT") {
            return Math.min(promotion.value, cartTotal);
        } else if (promotion.promotionType === "SHIPPING_DISCOUNT") {
            const shippingFee = 50000; // 50,000 VND shipping fee
            if (promotion.value === 100) {
                // 100% discount
                return promotion.maxDiscountAmount
                    ? Math.min(shippingFee, promotion.maxDiscountAmount)
                    : shippingFee;
            }
            const discount = (shippingFee * promotion.value) / 100;
            return promotion.maxDiscountAmount
                ? Math.min(discount, promotion.maxDiscountAmount)
                : discount;
        }
        return 0;
    };

    const isPromotionEligible = (promotion: Promotion) => {
        return !promotion.minOrderValue || cartTotal >= promotion.minOrderValue;
    };

    return (
        <div className="space-y-4">
            {/* Selected Product Promotion Display */}
            {selectedProductPromotion && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Tag className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">
                                        {selectedProductPromotion.name}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Mã sản phẩm:{" "}
                                        {selectedProductPromotion.code} • Giảm{" "}
                                        {formatDiscountValue(
                                            selectedProductPromotion
                                        )}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Tiết kiệm:{" "}
                                        {calculateDiscount(
                                            selectedProductPromotion
                                        ).toLocaleString("vi-VN")}
                                        đ
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveProductPromotion}
                                className="text-green-600 hover:text-green-800"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selected Shipping Promotion Display */}
            {selectedShippingPromotion && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Tag className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-blue-800">
                                        {selectedShippingPromotion.name}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Mã vận chuyển:{" "}
                                        {selectedShippingPromotion.code} • Giảm{" "}
                                        {formatDiscountValue(
                                            selectedShippingPromotion
                                        )}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Tiết kiệm phí ship:{" "}
                                        {calculateDiscount(
                                            selectedShippingPromotion
                                        ).toLocaleString("vi-VN")}
                                        đ
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveShippingPromotion}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Promotion Selector Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant={
                            selectedProductPromotion ||
                            selectedShippingPromotion
                                ? "outline"
                                : "default"
                        }
                        className="w-full"
                        disabled={disabled}
                    >
                        <Tag className="mr-2 h-4 w-4" />
                        {selectedProductPromotion || selectedShippingPromotion
                            ? "Thay đổi mã giảm giá"
                            : "Chọn mã giảm giá"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chọn mã giảm giá</DialogTitle>
                        <DialogDescription>
                            Tổng đơn hàng: {cartTotal.toLocaleString("vi-VN")}đ
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm mã giảm giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Promotion List */}
                    <div className="max-h-[400px] overflow-y-auto pr-4">
                        {error && (
                            <div className="text-center py-4 text-red-500">
                                {error}
                            </div>
                        )}

                        {promotions.length === 0 && !loading && !error && (
                            <div className="text-center py-8 text-gray-500">
                                Không tìm thấy mã giảm giá phù hợp
                            </div>
                        )}

                        <div className="space-y-3">
                            {promotions.map((promotion) => {
                                const eligible = isPromotionEligible(promotion);
                                const discount = calculateDiscount(promotion);
                                const isShippingPromo =
                                    promotion.promotionType ===
                                    "SHIPPING_DISCOUNT";
                                const isAlreadySelected = isShippingPromo
                                    ? selectedShippingPromotion?.id ===
                                      promotion.id
                                    : selectedProductPromotion?.id ===
                                      promotion.id;
                                const canSelect = isShippingPromo
                                    ? !selectedShippingPromotion ||
                                      selectedShippingPromotion.id ===
                                          promotion.id
                                    : !selectedProductPromotion ||
                                      selectedProductPromotion.id ===
                                          promotion.id;

                                return (
                                    <Card
                                        key={promotion.id}
                                        className={`cursor-pointer transition-colors gap-1 ${
                                            eligible && canSelect
                                                ? "hover:border-primary"
                                                : "opacity-50 cursor-not-allowed"
                                        } ${
                                            isAlreadySelected
                                                ? "border-primary bg-primary/5"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            if (eligible && canSelect) {
                                                if (isShippingPromo) {
                                                    handleShippingPromotionSelect(
                                                        promotion
                                                    );
                                                } else {
                                                    handleProductPromotionSelect(
                                                        promotion
                                                    );
                                                }
                                            }
                                        }}
                                    >
                                        <CardHeader className="pb-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-sm">
                                                        {promotion.name}
                                                    </CardTitle>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${
                                                            isShippingPromo
                                                                ? "border-blue-500 text-blue-600"
                                                                : "border-green-500 text-green-600"
                                                        }`}
                                                    >
                                                        {isShippingPromo
                                                            ? "Vận chuyển"
                                                            : "Sản phẩm"}
                                                    </Badge>
                                                </div>
                                                <Badge
                                                    variant={
                                                        eligible && canSelect
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {formatDiscountValue(
                                                        promotion
                                                    )}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                Mã: {promotion.code}
                                                {!canSelect && (
                                                    <span className="text-amber-600 ml-2">
                                                        (Đã chọn{" "}
                                                        {isShippingPromo
                                                            ? "mã vận chuyển"
                                                            : "mã sản phẩm"}{" "}
                                                        khác)
                                                    </span>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-1 text-xs text-gray-600">
                                                {promotion.minOrderValue && (
                                                    <p>
                                                        Đơn tối thiểu:{" "}
                                                        {promotion.minOrderValue.toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                        đ
                                                    </p>
                                                )}
                                                {promotion.maxDiscountAmount &&
                                                    promotion.promotionType ===
                                                        "PERCENTAGE" && (
                                                        <p>
                                                            Giảm tối đa:{" "}
                                                            {promotion.maxDiscountAmount.toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </p>
                                                    )}
                                                <p>
                                                    Còn lại:{" "}
                                                    {promotion.usageLimit -
                                                        promotion.usageCount}{" "}
                                                    lượt
                                                </p>
                                                <p>
                                                    HSD:{" "}
                                                    {new Date(
                                                        promotion.endDate
                                                    ).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </p>
                                                {eligible && discount > 0 && (
                                                    <p className="font-medium text-green-600">
                                                        Tiết kiệm:{" "}
                                                        {discount.toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                        đ
                                                    </p>
                                                )}
                                                {!eligible &&
                                                    promotion.minOrderValue && (
                                                        <p className="text-red-500">
                                                            Cần mua thêm{" "}
                                                            {(
                                                                promotion.minOrderValue -
                                                                cartTotal
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </p>
                                                    )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {hasMorePages && (
                            <div className="flex justify-center py-4">
                                <Button
                                    variant="outline"
                                    onClick={loadMorePromotions}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </>
                                    ) : (
                                        "Tải thêm"
                                    )}
                                </Button>
                            </div>
                        )}

                        {loading && promotions.length === 0 && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromotionSelector;
