import React, {useState} from "react";
import {ArrowUpRightIcon, CreditCardIcon} from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";
import type {OrderHistory} from "../types/order";
import {ORDER_STATUS_MAP, PAYMENT_METHOD_MAP} from "../types/order";
import paymentService from "../services/paymentService";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge.tsx";
import ReviewFormDialog from "@/components/ReviewFormDialog.tsx";

export interface OrderHistoryCardProps {
    order: OrderHistory;
    index: number;
    onOrderCancelled?: () => void;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
                                                               order,
                                                               index,
                                                               onOrderCancelled: _onOrderCancelled,
                                                           }) => {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
        {}
    );
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>("vnpay");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showCreateReviewDialog, setShowCreateReviewDialog] = useState(false);
    const [stockId, setStockId] = useState<number | null>(null);

    const toggleItemExpand = (itemIndex: number) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemIndex]: !prev[itemIndex],
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "text-green-600 font-medium";
            case "PAID":
                return "text-orange-400 font-medium";
            case "PENDING_PAYMENT":
                return "text-yellow-400 font-medium";
            case "SHIPPED":
                return "text-blue-600 font-medium";
            case "CANCELLED":
                return "text-red-600 font-medium";
            default:
                return "text-gray-500";
        }
    };

    const handlePayment = async (paymentMethod: string) => {
        setIsProcessingPayment(true);

        try {
            let paymentResponse;
            if (paymentMethod === "vnpay") {
                paymentResponse =
                    await paymentService.createVNPayPaymentForOrder(order.id);
            } else if (paymentMethod === "paypal") {
                paymentResponse = await paymentService.createPayPalPaymentForOrder(
                    order.id
                );
            } else {
                alert("Phương thức thanh toán không hỗ trợ");
                return;
            }

            if (paymentResponse.success && paymentResponse.data.paymentUrl) {
                // Redirect to payment URL
                window.location.href = paymentResponse.data.paymentUrl;
            } else {
                alert(paymentResponse.msg || "Không thể tạo URL thanh toán");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            alert("Có lỗi xảy ra khi tạo thanh toán");
        } finally {
            setIsProcessingPayment(false);
            setShowPaymentModal(false);
        }
    };

    return (
        <div
            className={
                "container mx-auto py-12 border-b last:border-b-0 flex flex-col gap-4"
            }
        >
            <div
                className={
                    "text-2xl font-semibold flex items-end justify-between"
                }
            >
                <div>
                    {index}. Đơn hàng #{order.orderNumber || order.id} -{" "}
                    {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        weekday: "short",
                    })}
                </div>
                <div className="flex items-center gap-3">
                    {/* Nút thanh toán chỉ hiển thị khi đơn hàng chờ thanh toán */}
                    {order.status === "PENDING_PAYMENT" && (
                        <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-blue-600 text-white hover:bg-blue-700 text-sm font-normal"
                            size="sm"
                        >
                            <CreditCardIcon className="w-4 h-4 mr-1"/>
                            Thanh toán ngay
                        </Button>
                    )}
                    <Link
                        to={`/order-detail/${order.id}`}
                        className={
                            "flex items-center justify-center text-sm font-normal gap-1 text-blue-600 hover:underline focus:outline-none focus:ring-2 rounded-sm focus:ring-blue-500 focus:ring-offset-2 transition"
                        }
                    >
                        Xem chi tiết đơn hàng{" "}
                        <ArrowUpRightIcon className={"size-3"}/>
                    </Link>
                </div>
            </div>
            <div className={"flex flex-col gap-10 bg-muted p-6 rounded-3xl"}>
                {order.items.map((item, itemIndex) => (
                    <React.Fragment key={`${item.id}-${itemIndex}`}>
                        <div className={"flex gap-4"}>
                            <img
                                src={item.productImage}
                                alt={item.productName}
                                className={
                                    "w-[10rem] object-cover aspect-[8/10] rounded-xl"
                                }
                            />
                            <div className={"flex flex-col w-full space-y-2"}>
                                <p className={"text-lg font-semibold"}>
                                    {item.productName} - {item.colorName}
                                </p>
                                {item.versionName && (
                                    <p className={"text-sm text-muted-foreground"}>
                                        Phiên bản: {item.versionName}
                                    </p>
                                )}
                                <p className={"text-sm text-muted-foreground"}>
                                    Số lượng: {item.quantity}
                                </p>
                                <p className={"text-sm text-muted-foreground"}>
                                </p>

                                <div
                                    className={
                                        "flex items-center cursor-pointer w-fit gap-1"
                                    }
                                    onClick={() =>
                                        order.status === "DELIVERED" &&
                                        toggleItemExpand(itemIndex)
                                    }
                                >
                                    <p
                                        className={
                                            "text-sm flex items-center gap-1"
                                        }
                                    >
                                        Trạng thái:{" "}
                                        <Badge
                                            variant={"outline"}
                                            className={getStatusColor(
                                                order.status
                                            )}
                                        >
                                            {ORDER_STATUS_MAP[order.status] ||
                                                order.status}
                                        </Badge>
                                    </p>
                                    {order.status === "DELIVERED" && (
                                        <svg
                                            className={
                                                "size-3 text-gray-500 transform " +
                                                (expandedItems[itemIndex]
                                                    ? "rotate-180"
                                                    : "rotate-0")
                                            }
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            ></path>
                                        </svg>
                                    )}
                                </div>

                                {!order.isReviewed && order.status === "DELIVERED" && (
                                    <div className={"text-sm text-muted-foreground flex items-center gap-1"}>
                                        <p>Bạn chưa thực hiện đánh giá sản phẩm này.</p>
                                        <Link className={"text-blue-500 hover:underline"} to={"#"}>Đánh giá ngay!</Link>
                                    </div>
                                )}

                                {order.status === "DELIVERED" &&
                                    expandedItems[itemIndex] && (
                                        <div
                                            className={
                                                "pl-4 py-2 mt-1 bg-foreground/3 border rounded-md transition-all"
                                            }
                                        >
                                            <p
                                                className={
                                                    "text-sm text-muted-foreground"
                                                }
                                            >
                                                Ngày hoàn thành:{" "}
                                                {new Date(
                                                    order.updatedAt
                                                ).toLocaleDateString("vi-VN")}
                                            </p>
                                            {order.trackingNumber && (
                                                <p
                                                    className={
                                                        "text-sm text-gray-600"
                                                    }
                                                >
                                                    Mã vận đơn:{" "}
                                                    {order.trackingNumber}
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </div>
                            <div className={"ml-auto text-lg font-semibold"}>
                                {(item.price * item.quantity).toLocaleString(
                                    "vi-VN",
                                    {
                                        style: "currency",
                                        currency: "VND",
                                    }
                                )}
                            </div>
                        </div>
                        {itemIndex < order.items.length - 1 && (
                            <hr className={"bg-muted"}/>
                        )}
                    </React.Fragment>
                ))}
                {/* Hiển thị tổng tiền đơn hàng */}
                <div
                    className={
                        "flex justify-between items-center pt-4 border-t"
                    }
                >
                    <div className={"text-sm text-muted-foreground"}>
                        <p>
                            Phương thức thanh toán:{" "}
                            {PAYMENT_METHOD_MAP[order.paymentMethod] ||
                                order.paymentMethod}
                        </p>
                        {order.shippingFee > 0 && (
                            <p>
                                Phí vận chuyển:{" "}
                                {order.shippingFee.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </p>
                        )}
                        {order.discountAmount && order.discountAmount > 0 && (
                            <p>
                                Giảm giá: -
                                {order.discountAmount.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </p>
                        )}
                        {order.trackingNumber && (
                            <p>Mã vận đơn: {order.trackingNumber}</p>
                        )}
                    </div>
                    <div className={"text-xl font-bold"}>
                        Tổng:{" "}
                        {order.finalTotal.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </div>
                </div>
            </div>

            {/* Dialog thanh toán */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
                        <DialogDescription>
                            Chọn phương thức thanh toán cho đơn hàng #
                            {order.orderNumber || order.id}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Thông tin đơn hàng */}
                        <div className="bg-muted border p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                                Thông tin đơn hàng
                            </h4>
                            <p className="text-sm text-muted-foreground mb-1">
                                Mã đơn hàng: #{order.orderNumber || order.id}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                                Tổng tiền:{" "}
                                <span className="font-medium text-foreground">
                                    {order.finalTotal.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                            </p>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="space-y-3">
                            <h4 className="font-medium">
                                Phương thức thanh toán
                            </h4>

                            <div className="space-y-2">
                                <label
                                    className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-muted">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="vnpay"
                                        checked={
                                            selectedPaymentMethod === "vnpay"
                                        }
                                        onChange={(e) =>
                                            setSelectedPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        className="form-radio size-4"
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">
                                            VNPay
                                        </span>
                                        <img
                                            src={
                                                "https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"
                                            }
                                            alt={"VNPAY Logo"}
                                            className={"h-5"}
                                        />
                                    </div>
                                </label>

                                <label
                                    className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-muted">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={
                                            selectedPaymentMethod === "paypal"
                                        }
                                        onChange={(e) =>
                                            setSelectedPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        className="form-radio size-4"
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">
                                            PayPal
                                        </span>
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/500px-PayPal_logo.svg.png"
                                            alt="PayPal Logo"
                                            className={"h-4"}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1"
                                disabled={isProcessingPayment}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() =>
                                    handlePayment(selectedPaymentMethod)
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                disabled={isProcessingPayment}
                            >
                                {isProcessingPayment
                                    ? "Đang xử lý..."
                                    : "Thanh toán"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <ReviewFormDialog
                open={showCreateReviewDialog}
                onOpenChange={setShowCreateReviewDialog}
                stockId={stockId}
                orderId={Number.parseInt(order.orderNumber)}
                onSuccess={() => {order.isReviewed = true}}
            />
        </div>
    );
};
export default OrderHistoryCard;
