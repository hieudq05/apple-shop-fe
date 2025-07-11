import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderHistoryService } from "../services/orderHistoryService";
import type { OrderDetail } from "../types/order";
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "../types/order";
import {
    ArrowLeftIcon,
    ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail(Number(orderId));
        }
    }, [orderId]);

    const fetchOrderDetail = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderHistoryService.getOrderDetailById(id);

            if (response.success && response.data) {
                setOrderDetail(response.data);
            } else {
                setError(response.message || "Không thể tải chi tiết đơn hàng");
            }
        } catch (err) {
            console.error("Error fetching order detail:", err);
            setError("Có lỗi xảy ra khi tải chi tiết đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You can add a toast notification here
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-100 text-green-800";
            case "PAID":
                return "bg-orange-100 text-orange-600";
            case "PENDING_PAYMENT":
                return "bg-yellow-100 text-yellow-600";
            case "SHIPPED":
                return "bg-blue-100 text-blue-600";
            case "CANCELLED":
                return "bg-red-100 text-red-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const formatAddress = (address: {
        address: string;
        ward?: string;
        district?: string;
        province?: string;
        country?: string;
    }) => {
        const parts = [address.address];
        if (address.ward) parts.push(address.ward);
        if (address.district) parts.push(address.district);
        if (address.province) parts.push(address.province);
        if (address.country) parts.push(address.country);
        return parts.join(", ");
    };

    const handleCancelOrder = async () => {
        if (!orderDetail || !orderId) return;

        try {
            setCancelling(true);
            const response = await orderHistoryService.cancelOrder(
                Number(orderId),
                cancelReason || "Khách hàng hủy đơn hàng"
            );

            if (response.success) {
                // Refresh order detail
                await fetchOrderDetail(Number(orderId));
                setShowCancelDialog(false);
                setCancelReason("");
            } else {
                setError(response.message || "Không thể hủy đơn hàng");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            setError("Có lỗi xảy ra khi hủy đơn hàng");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="py-6 bg-gray-100">
                    <div className="container mx-auto">
                        <div className="text-lg font-semibold">
                            Chi tiết đơn hàng
                        </div>
                    </div>
                </div>
                <div className="container mx-auto py-12">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="py-6 bg-gray-100">
                    <div className="container mx-auto">
                        <div className="text-lg font-semibold">
                            Chi tiết đơn hàng
                        </div>
                    </div>
                </div>
                <div className="container mx-auto py-12">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Có lỗi xảy ra</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() =>
                                orderId && fetchOrderDetail(Number(orderId))
                            }
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!orderDetail) {
        return (
            <>
                <div className="py-6 bg-gray-100">
                    <div className="container mx-auto">
                        <div className="text-lg font-semibold">
                            Chi tiết đơn hàng
                        </div>
                    </div>
                </div>
                <div className="container mx-auto py-12">
                    <p className="text-center text-gray-500">
                        Không tìm thấy đơn hàng
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="py-6 bg-gray-100">
                <div className="container mx-auto">
                    <div className="text-lg font-semibold">
                        Chi tiết đơn hàng
                    </div>
                </div>
            </div>
            <div className="container mx-auto py-12 max-w-4xl">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                        >
                            <ArrowLeftIcon className="size-5" />
                            Quay lại
                        </button>
                        <h1 className="text-3xl font-bold">
                            Đơn hàng #{orderDetail.orderNumber}
                        </h1>
                    </div>

                    {/* Cancel button for PENDING_PAYMENT orders */}
                    {orderDetail.status === "PENDING_PAYMENT" && (
                        <Button
                            variant={"destructive"}
                            onClick={() => setShowCancelDialog(true)}
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order status */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    Trạng thái đơn hàng
                                </h2>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        orderDetail.status
                                    )}`}
                                >
                                    {ORDER_STATUS_MAP[orderDetail.status] ||
                                        orderDetail.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>
                                    Ngày đặt hàng:{" "}
                                    {new Date(
                                        orderDetail.createdAt
                                    ).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                                {orderDetail.trackingCode && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <p>
                                            Mã vận đơn:{" "}
                                            {orderDetail.trackingCode}
                                        </p>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    orderDetail.trackingCode!
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <ClipboardDocumentIcon className="size-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order items */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Sản phẩm đã đặt
                            </h2>
                            <div className="space-y-4">
                                {orderDetail.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4 border rounded-lg"
                                    >
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium">
                                                {item.productName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Màu: {item.colorName}
                                            </p>
                                            {item.versionName && (
                                                <p className="text-sm text-gray-600">
                                                    Phiên bản:{" "}
                                                    {item.versionName}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                Số lượng: {item.quantity}
                                            </p>
                                            {item.note && (
                                                <p className="text-sm text-gray-600">
                                                    Ghi chú: {item.note}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {item.price.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                x{item.quantity}
                                            </p>
                                            <p className="font-semibold text-lg">
                                                {item.total.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Promotions */}
                        {(orderDetail.promotions.productPromotion ||
                            orderDetail.promotions.shippingPromotion) && (
                            <div className="bg-white rounded-lg border p-6">
                                <h2 className="text-xl font-semibold mb-4">
                                    Khuyến mãi đã áp dụng
                                </h2>
                                <div className="space-y-3">
                                    {orderDetail.promotions
                                        .productPromotion && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-green-800">
                                                    {
                                                        orderDetail.promotions
                                                            .productPromotion
                                                            .name
                                                    }
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    Mã:{" "}
                                                    {
                                                        orderDetail.promotions
                                                            .productPromotion
                                                            .code
                                                    }
                                                </p>
                                            </div>
                                            <p className="font-semibold text-green-800">
                                                -
                                                {orderDetail.pricing.productDiscountAmount.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {orderDetail.promotions
                                        .shippingPromotion && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-blue-800">
                                                    {
                                                        orderDetail.promotions
                                                            .shippingPromotion
                                                            .name
                                                    }
                                                </p>
                                                <p className="text-sm text-blue-600">
                                                    Mã:{" "}
                                                    {
                                                        orderDetail.promotions
                                                            .shippingPromotion
                                                            .code
                                                    }
                                                </p>
                                            </div>
                                            <p className="font-semibold text-blue-800">
                                                -
                                                {orderDetail.pricing.shippingDiscountAmount.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order summary */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Tóm tắt đơn hàng
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {orderDetail.pricing.subtotal.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển:</span>
                                    <span>
                                        {orderDetail.pricing.shippingFee.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </span>
                                </div>
                                {orderDetail.pricing.productDiscountAmount >
                                    0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá sản phẩm:</span>
                                        <span>
                                            -
                                            {orderDetail.pricing.productDiscountAmount.toLocaleString(
                                                "vi-VN",
                                                {
                                                    style: "currency",
                                                    currency: "VND",
                                                }
                                            )}
                                        </span>
                                    </div>
                                )}
                                {orderDetail.pricing.shippingDiscountAmount >
                                    0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Giảm giá vận chuyển:</span>
                                        <span>
                                            -
                                            {orderDetail.pricing.shippingDiscountAmount.toLocaleString(
                                                "vi-VN",
                                                {
                                                    style: "currency",
                                                    currency: "VND",
                                                }
                                            )}
                                        </span>
                                    </div>
                                )}
                                <hr className="my-3" />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">
                                        {orderDetail.pricing.finalTotal.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Customer info */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Thông tin khách hàng
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Họ tên:</span>{" "}
                                    {orderDetail.customer.firstName}{" "}
                                    {orderDetail.customer.lastName}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {orderDetail.customer.email}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Điện thoại:
                                    </span>{" "}
                                    {orderDetail.customer.phone}
                                </p>
                            </div>
                        </div>

                        {/* Shipping address */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Địa chỉ giao hàng
                            </h2>
                            <p className="text-sm">
                                {formatAddress(orderDetail.shippingAddress)}
                            </p>
                        </div>

                        {/* Payment info */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Thông tin thanh toán
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">
                                        Phương thức:
                                    </span>{" "}
                                    {PAYMENT_METHOD_MAP[
                                        orderDetail.paymentMethod
                                    ] || orderDetail.paymentMethod}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Order Dialog */}
                <Dialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn hủy đơn hàng #
                                {orderDetail.orderNumber}? Hành động này không
                                thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCancelDialog(false);
                                    setCancelReason("");
                                }}
                                disabled={cancelling}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                            >
                                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default OrderDetailPage;
