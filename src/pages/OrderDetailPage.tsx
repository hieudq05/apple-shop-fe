import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderHistoryService } from "../services/orderHistoryService";
import paymentService from "../services/paymentService";
import type { OrderDetail } from "../types/order";
import { PAYMENT_METHOD_MAP } from "../types/order";
import { ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import OrderStatusTimeline from "../components/OrderStatusTimeline";

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>("vnpay");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState("");
    const [showPaymentUrl, setShowPaymentUrl] = useState(false);

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

    const handlePayment = async (paymentMethod: string) => {
        setIsProcessingPayment(true);

        try {
            let paymentResponse;
            if (paymentMethod === "vnpay") {
                paymentResponse =
                    await paymentService.createVNPayPaymentForOrder(
                        orderDetail?.id || 0
                    );
            } else if (paymentMethod === "paypal") {
                paymentResponse =
                    await paymentService.createPayPalPaymentForOrder(
                        orderDetail?.id || 0
                    );
            } else {
                alert("Phương thức thanh toán không hỗ trợ");
                return;
            }

            if (paymentResponse.success && paymentResponse.data.paymentUrl) {
                // Show payment URL and QR code instead of redirecting
                setPaymentUrl(paymentResponse.data.paymentUrl);
                setShowPaymentModal(false);
                setShowPaymentUrl(true);
            } else {
                alert(paymentResponse.msg || "Không thể tạo URL thanh toán");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            alert("Có lỗi xảy ra khi tạo thanh toán");
        } finally {
            setIsProcessingPayment(false);
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

                    {/* Action buttons for PENDING_PAYMENT orders */}
                    {orderDetail.status === "PENDING_PAYMENT" && (
                        <div className="flex gap-3">
                            <Button
                                variant="default"
                                onClick={() => setShowPaymentModal(true)}
                                className="flex items-center gap-2"
                            >
                                <CreditCardIcon className="size-4" />
                                Thanh toán
                            </Button>
                            <Button
                                variant={"destructive"}
                                onClick={() => setShowCancelDialog(true)}
                            >
                                Hủy đơn hàng
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order status timeline */}
                        <OrderStatusTimeline
                            currentStatus={orderDetail.status}
                            orderDate={orderDetail.createdAt}
                            trackingCode={orderDetail.trackingCode}
                        />

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
                                <div>
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Tổng cộng :</span>
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
                                    <span className="text-sm font-normal">
                                        (Đã bao gồm{" "}
                                        {(
                                            orderDetail.pricing.finalTotal -
                                            (orderDetail.pricing
                                                .productDiscountAmount +
                                                orderDetail.pricing
                                                    .shippingDiscountAmount -
                                                orderDetail.pricing
                                                    .shippingFee +
                                                orderDetail.pricing.subtotal)
                                        ).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}{" "}
                                        thuế VAT)
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

                {/* Payment Modal */}
                <Dialog
                    open={showPaymentModal}
                    onOpenChange={setShowPaymentModal}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Chọn phương thức thanh toán
                            </DialogTitle>
                            <DialogDescription>
                                Vui lòng chọn phương thức thanh toán để hoàn tất
                                đơn hàng.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    Phương thức thanh toán
                                </Label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="vnpay"
                                            checked={
                                                selectedPaymentMethod ===
                                                "vnpay"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span>VNPay</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="paypal"
                                            checked={
                                                selectedPaymentMethod ===
                                                "paypal"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span>PayPal</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowPaymentModal(false)}
                                disabled={isProcessingPayment}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() =>
                                    handlePayment(selectedPaymentMethod)
                                }
                                disabled={isProcessingPayment}
                            >
                                {isProcessingPayment
                                    ? "Đang xử lý..."
                                    : "Thanh toán"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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

                {/* Payment URL Dialog */}
                <Dialog open={showPaymentUrl} onOpenChange={setShowPaymentUrl}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                            <DialogDescription>
                                Sử dụng QR code hoặc URL để thanh toán
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* QR Code */}
                            <div className="flex justify-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                        paymentUrl
                                    )}`}
                                    alt="QR Code thanh toán"
                                    className="border rounded"
                                />
                            </div>

                            {/* Payment URL */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Đường dẫn thanh toán:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={paymentUrl}
                                        readOnly
                                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                paymentUrl
                                            );
                                            alert(
                                                "Đã sao chép URL thanh toán!"
                                            );
                                        }}
                                    >
                                        Sao chép
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowPaymentUrl(false)}
                            >
                                Đóng
                            </Button>
                            <Button
                                onClick={() => {
                                    window.open(paymentUrl, "_blank");
                                }}
                            >
                                Thanh toán ngay
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default OrderDetailPage;
