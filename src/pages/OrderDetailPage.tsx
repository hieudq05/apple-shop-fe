import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {orderHistoryService} from "../services/orderHistoryService";
import paymentService from "../services/paymentService";
import type {OrderDetail} from "../types/order";
import {PAYMENT_METHOD_MAP} from "../types/order";
import {CreditCardIcon} from "@heroicons/react/24/outline";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {Button} from "../components/ui/button";
import {Label} from "../components/ui/label";
import OrderStatusTimeline, {ORDER_STATUS_FLOW} from "../components/OrderStatusTimeline";
import {AlertCircleIcon, ChevronLeft, X} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge.tsx";

const OrderDetailPage: React.FC = () => {
    const {orderId} = useParams<{ orderId: string }>();
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

    const getStepStatus = (
        stepIndex: number,
        stepKey: string
    ): "completed" | "current" | "upcoming" | "cancelled" => {
        if (orderDetail?.status === "CANCELLED" || orderDetail?.status === "FAILED_PAYMENT") {
            if (stepIndex === 0 && stepKey === "PENDING_PAYMENT") {
                return "completed";
            }
            return "cancelled";
        }

        if (stepIndex < currentStatusIndex) {
            return "completed";
        } else if (stepIndex === currentStatusIndex) {
            return "current";
        } else {
            return "upcoming";
        }
    };

    const getTextColors = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return "text-blue-600";
            case "current":
                return "text-green-700";
            case "cancelled":
                return "text-red-700";
            default:
                return "text-gray-500";
        }
    };

    const getCurrentStatusIndex = (status: string): number => {
        const index = ORDER_STATUS_FLOW.findIndex(
            (step) => step.key === status
        );
        return index === -1 ? 0 : index;
    };

    const currentStatus = orderDetail?.status || "PENDING_PAYMENT";
    const currentStatusIndex = getCurrentStatusIndex(currentStatus);

    if (loading) {
        return (
            <>
                <div className="py-6 bg-muted">
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
                <div className="py-6 bg-muted">
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
                <div className="py-6 bg-muted">
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
            <div className="py-6 bg-muted">
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
                        <Button
                            variant={"outline"}
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center cursor-pointer px-0 w-8 mt-1 rounded-lg transition"
                        >
                            <ChevronLeft className="size-5 mr-0.5"/>
                        </Button>
                        <h1 className="text-3xl font-semibold">
                            Đơn hàng #{orderDetail.orderNumber}
                        </h1>
                        <Badge variant={"outline"} className={"mt-1"}>
                            <span
                                className={`font-medium ${getTextColors(
                                    getStepStatus(currentStatusIndex, currentStatus)
                                )}`}
                            >
                                {ORDER_STATUS_FLOW.find(
                                        (step) => step.key === currentStatus
                                    )?.label ||
                                    (orderDetail.status === "CANCELLED"
                                        ? "Đã hủy"
                                        : orderDetail.status === "FAILED_PAYMENT"
                                            ? "Thanh toán thất bại"
                                            : currentStatus)}
                            </span>
                        </Badge>
                    </div>

                    {/* Action buttons for PENDING_PAYMENT orders */}
                    {orderDetail.status === "PENDING_PAYMENT" && (
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                onClick={() => setShowPaymentModal(true)}
                                className="flex cursor-pointer items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg"
                            >
                                <CreditCardIcon className="size-4"/>
                                Thanh toán
                            </Button>
                            <Button
                                onClick={() => setShowCancelDialog(true)}
                                className={"hover:bg-red-600 cursor-pointer bg-red-700 text-white rounded-lg"}
                            >
                                <X className="size-4"/>
                                Hủy đơn
                            </Button>
                        </div>
                    )}
                </div>

                {/* Special handling for failed payment */}
                {orderDetail.status === "FAILED_PAYMENT" && (
                    <Alert variant="destructive" className={"my-12 text-sm"}>
                        <AlertCircleIcon className={"size-5 mt-1"}/>
                        <AlertTitle className={"font-semibold"}>Thanh toán thất bại.</AlertTitle>
                        <AlertDescription className={"text-sm"}>
                            Quá trình thanh toán không thành công. Vui lòng thử lại
                            hoặc chọn phương thức thanh toán khác.
                        </AlertDescription>
                    </Alert>
                )}

                {
                    orderDetail.status === "CANCELLED" && (
                        <Alert variant="destructive" className={"my-12 text-sm"}>
                            <AlertCircleIcon className={"size-5 mt-1"}/>
                            <AlertTitle className={"font-semibold text-base"}>Đơn hàng đã bị hủy.</AlertTitle>
                            <AlertDescription className={"text-sm"}>
                                Hệ thống đã ghi nhận yêu cầu hủy đơn hàng của bạn.
                            </AlertDescription>
                        </Alert>
                    )
                }

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Order status timeline */}
                        <OrderStatusTimeline
                            currentStatus={orderDetail.status}
                            orderDate={orderDetail.createdAt}
                            trackingCode={orderDetail.trackingCode}
                        />

                        {/* Order items */}
                        <div className="bg-foreground/3 rounded-2xl border p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Sản phẩm đã đặt
                            </h2>
                            <div className="space-y-4">
                                {orderDetail.items.map((item) => (
                                    <Card className={"w-full gap-1"}>
                                        <CardHeader>
                                            <CardTitle className={"flex flex-col gap-4"}>
                                                <h3 className="font-medium">
                                                    {item.productName}
                                                </h3>
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible>
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger>Thông tin chi tiết</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="flex flex-col gap-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                <span
                                                                    className={"text-foreground"}>Màu:</span> {item.colorName}
                                                            </p>
                                                            {item.versionName && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    <span
                                                                        className={"text-foreground"}>Phiên bản:</span> {item.versionName}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-muted-foreground">
                                                                Số lượng: {item.quantity}
                                                            </p>
                                                            {item.note && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Ghi chú: {item.note}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </CardContent>
                                        <CardFooter className={"flex justify-end"}>
                                            <div className="text-right">
                                                <p className="font-medium text-muted-foreground">
                                                    {item.price.toLocaleString(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
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
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Order summary */}
                        <div className="bg-foreground/3 rounded-2xl border p-6 flex flex-col gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Tóm tắt đơn hàng
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Tạm tính:</span>
                                        <span>
                                        {orderDetail.subtotal.toLocaleString(
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
                                        {orderDetail.shippingFee.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </span>
                                    </div>
                                    {orderDetail.productDiscountAmount >
                                        0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá sản phẩm:</span>
                                                <span>
                                            -
                                                    {orderDetail.productDiscountAmount.toLocaleString(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }
                                                    )}
                                        </span>
                                            </div>
                                        )}
                                    {orderDetail.shippingDiscountAmount >
                                        0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá vận chuyển:</span>
                                                <span>
                                            -
                                                    {orderDetail.shippingDiscountAmount.toLocaleString(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }
                                                    )}
                                        </span>
                                            </div>
                                        )}
                                    <hr className="my-3"/>
                                    <div>
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Tổng cộng:</span>
                                            <span>
                                            {orderDetail.finalTotal.toLocaleString(
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
                                                orderDetail.vat.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )
                                            )}{" "}
                                            thuế VAT)
                                    </span>
                                    </div>
                                </div>
                            </div>
                            <hr className="my-3"/>
                            {/* Customer info */}
                            <div>
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
                            <hr className="my-3"/>
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Địa chỉ giao hàng
                                </h2>
                                <p className="text-sm">
                                    {formatAddress(orderDetail.shippingAddress)}
                                </p>
                            </div>
                            <hr className="my-3"/>
                            <div>
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
