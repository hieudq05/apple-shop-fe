import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    MapPinIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import orderService from "../../services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreHorizontal, Truck } from "lucide-react";

// Interface based on real API data structure
interface OrderDetail {
    id: number;
    status:
        | "PENDING_PAYMENT"
        | "PAID"
        | "PROCESSING"
        | "AWAITING_SHIPMENT"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED";
    paymentType: string;
    createdAt: string;
    approveAt?: string;
    approveBy?: any;

    // Customer info - flat structure in order
    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    // Address info - flat structure in order
    address: string;
    ward: string;
    district: string;
    province: string;
    country: string;

    // Customer object
    createdBy: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };

    // Order items - simplified structure
    orderDetails: Array<{
        id: number;
        product: {
            id: number;
        };
        productName: string;
        quantity: number;
        price: number;
        note?: string;
        colorName: string;
        versionName: string;
        image_url: string;
    }>;

    shippingTrackingCode?: string;

    // Computed fields for UI
    totalAmount?: number;
    shippingFee?: number;
    discountAmount?: number;
    finalAmount?: number;

    // Status history - we'll build this based on available timestamps
    statusHistory?: Array<{
        status: string;
        timestamp: string;
        note?: string;
    }>;
}

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        if (!id) return;

        try {
            setIsLoading(true);

            const response = await orderService.getAdminOrderById(parseInt(id));
            console.log("Order detail API response:", response);

            if (response) {
                // Transform API data to match our interface
                const orderData = response as any; // Use any to handle different API structure
                console.log("Raw order data:", orderData);

                // Build status history from available timestamps
                const statusHistory: Array<{
                    status: string;
                    timestamp: string;
                    note?: string;
                }> = [];

                // Add creation timestamp
                if (orderData.createdAt) {
                    statusHistory.push({
                        status: "PENDING",
                        timestamp: orderData.createdAt,
                        note: "Đơn hàng được tạo",
                    });
                }

                // Add approval timestamp if exists
                if (orderData.approveAt) {
                    statusHistory.push({
                        status: "CONFIRMED",
                        timestamp: orderData.approveAt,
                        note: "Đơn hàng đã được xác nhận",
                    });
                }

                // Add current status if different from above
                if (
                    orderData.status !== "PENDING" &&
                    orderData.status !== "CONFIRMED"
                ) {
                    statusHistory.push({
                        status: orderData.status,
                        timestamp: orderData.updatedAt || orderData.createdAt,
                        note: `Trạng thái được cập nhật thành ${getStatusText(
                            orderData.status
                        )}`,
                    });
                }

                const transformedOrder: OrderDetail = {
                    id: orderData.id,
                    status: orderData.status,
                    paymentType: orderData.paymentType,
                    createdAt: orderData.createdAt,
                    approveAt: orderData.approveAt,
                    approveBy: orderData.approveBy,

                    // Customer info from order fields
                    firstName: orderData.firstName || "",
                    lastName: orderData.lastName || "",
                    email: orderData.email || "",
                    phone: orderData.phone || "",

                    // Address info from order fields
                    address: orderData.address || "",
                    ward: orderData.ward || "",
                    district: orderData.district || "",
                    province: orderData.province || "",
                    country: orderData.country || "Vietnam",

                    // Customer object
                    createdBy: orderData.createdBy || {
                        id: 0,
                        email: orderData.email || "",
                        firstName: orderData.firstName || "",
                        lastName: orderData.lastName || "",
                        image: null,
                    },

                    // Order items
                    orderDetails: orderData.orderDetails || [],

                    shippingTrackingCode: orderData.shippingTrackingCode,

                    // Computed fields - calculate from order details
                    totalAmount:
                        orderData.orderDetails?.reduce(
                            (sum: number, item: any) =>
                                sum + item.price * item.quantity,
                            0
                        ) || 0,
                    shippingFee: 0, // Not provided by API
                    discountAmount: 0, // Not provided by API
                    finalAmount:
                        orderData.orderDetails?.reduce(
                            (sum: number, item: any) =>
                                sum + item.price * item.quantity,
                            0
                        ) || 0,

                    statusHistory: statusHistory.sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime()
                    ),
                };

                console.log("Transformed order data:", transformedOrder);
                setOrder(transformedOrder);

                // Show success toast
                toast.success("Đã tải thông tin đơn hàng", {
                    description: `Đơn hàng #${transformedOrder.id} - ${transformedOrder.firstName} ${transformedOrder.lastName}`,
                    duration: 3000,
                });
            } else {
                // Show error toast for no data
                toast.error("Không tìm thấy đơn hàng", {
                    description:
                        "Đơn hàng có thể đã bị xóa hoặc không tồn tại.",
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error("Error fetching order detail:", error);
            setOrder(null);

            // Show error toast
            toast.error("Lỗi khi tải thông tin đơn hàng", {
                description:
                    "Không thể kết nối đến server. Vui lòng thử lại sau.",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus: OrderDetail["status"]) => {
        if (!order) return;

        setIsUpdating(true);

        // Show loading toast
        const loadingToastId = toast.loading(
            `Đang cập nhật trạng thái đơn hàng...`,
            {
                description: "Vui lòng đợi trong giây lát",
            }
        );

        try {
            console.log("Updating order status:", order.id, newStatus);

            // Call API to update status
            await orderService.updateOrderStatus(order.id, newStatus);

            // Dismiss loading toast and show success toast
            toast.dismiss(loadingToastId);
            toast.success(
                `Đã cập nhật trạng thái đơn hàng thành "${getStatusText(
                    newStatus
                )}"`,
                {
                    description: `Đơn hàng #${
                        order.id
                    } đã được cập nhật lúc ${new Date().toLocaleTimeString(
                        "vi-VN"
                    )}`,
                    duration: 4000,
                }
            );

            // Update local state
            setOrder((prev) =>
                prev
                    ? {
                          ...prev,
                          status: newStatus,
                          statusHistory: [
                              ...(prev.statusHistory || []),
                              {
                                  status: newStatus,
                                  timestamp: new Date().toISOString(),
                                  note: `Trạng thái được cập nhật thành ${getStatusText(
                                      newStatus
                                  )}`,
                              },
                          ],
                      }
                    : null
            );
        } catch (error) {
            console.error("Error updating order status:", error);

            // Dismiss loading toast and show error toast
            toast.dismiss(loadingToastId);
            toast.error("Không thể cập nhật trạng thái đơn hàng", {
                description:
                    "Vui lòng thử lại sau hoặc liên hệ admin nếu vấn đề vẫn tiếp diễn.",
                duration: 5000,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        // Show confirmation dialog using toast
        toast("Xác nhận hủy đơn hàng", {
            description: `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}? Hành động này không thể hoàn tác.`,
            action: {
                label: "Xác nhận",
                onClick: async () => {
                    setIsUpdating(true);

                    // Show loading toast
                    const loadingToastId = toast.loading(
                        "Đang hủy đơn hàng...",
                        {
                            description: "Vui lòng đợi trong giây lát",
                        }
                    );

                    try {
                        await orderService.updateOrderStatus(
                            order.id,
                            "CANCELLED"
                        );

                        // Dismiss loading toast and show success toast
                        toast.dismiss(loadingToastId);
                        toast.success("Đã hủy đơn hàng thành công", {
                            description: `Đơn hàng #${
                                order.id
                            } đã được hủy lúc ${new Date().toLocaleTimeString(
                                "vi-VN"
                            )}`,
                            duration: 4000,
                        });

                        // Update local state
                        setOrder((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      status: "CANCELLED",
                                      statusHistory: [
                                          ...(prev.statusHistory || []),
                                          {
                                              status: "CANCELLED",
                                              timestamp:
                                                  new Date().toISOString(),
                                              note: "Đơn hàng đã được hủy bởi admin",
                                          },
                                      ],
                                  }
                                : null
                        );
                    } catch (error) {
                        console.error("Error cancelling order:", error);

                        // Dismiss loading toast and show error toast
                        toast.dismiss(loadingToastId);
                        toast.error("Không thể hủy đơn hàng", {
                            description:
                                "Vui lòng thử lại sau hoặc liên hệ admin nếu vấn đề vẫn tiếp diễn.",
                            duration: 5000,
                        });
                    } finally {
                        setIsUpdating(false);
                    }
                },
            },
            cancel: {
                label: "Hủy bỏ",
                onClick: () => {},
            },
            duration: 10000,
        });
    };

    const handleNavigateBack = () => {
        toast.info("Quay lại danh sách đơn hàng", {
            description: "Đang chuyển hướng...",
            duration: 2000,
        });
        navigate("/admin/orders");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
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

    const getStatusIcon = (status: OrderDetail["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return <Clock className="w-4 h-4" />;
            case "PAID":
                return (
                    <div className="size-3 bg-purple-200 rounded-full relative">
                        <div className="size-1.5 bg-purple-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "PROCESSING":
                return <MoreHorizontal className="w-4 h-4" />;
            case "AWAITING_SHIPMENT":
                return (
                    <div className="size-3 bg-yellow-200 rounded-full relative">
                        <div className="size-1.5 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "SHIPPED":
                return (
                    <div className="size-3 bg-orange-200 rounded-full relative">
                        <div className="size-1.5 bg-orange-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "DELIVERED":
                return (
                    <div className="size-3 bg-green-200 rounded-full relative">
                        <div className="size-1.5 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "CANCELLED":
                return (
                    <div className="size-3 bg-red-200 rounded-full relative">
                        <div className="size-1.5 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: OrderDetail["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "bg-yellow-100 text-yellow-800";
            case "PAID":
                return "bg-purple-100 text-purple-800";
            case "PROCESSING":
                return "bg-indigo-100 text-indigo-800";
            case "AWAITING_SHIPMENT":
                return "bg-yellow-100 text-yellow-800";
            case "SHIPPED":
                return "bg-orange-100 text-orange-800";
            case "DELIVERED":
                return "bg-green-100 text-green-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: OrderDetail["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "Chờ thanh toán";
            case "PAID":
                return "Đã thanh toán";
            case "PROCESSING":
                return "Đang xử lý";
            case "AWAITING_SHIPMENT":
                return "Chờ vận chuyển";
            case "SHIPPED":
                return "Đã giao";
            case "DELIVERED":
                return "Giao thành công";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const getNextStatus = (
        currentStatus: OrderDetail["status"]
    ): OrderDetail["status"] | null => {
        switch (currentStatus) {
            case "PENDING_PAYMENT":
                return "PAID";
            case "PAID":
                return "PROCESSING";
            case "PROCESSING":
                return "AWAITING_SHIPMENT";
            case "AWAITING_SHIPMENT":
                return "SHIPPED";
            case "SHIPPED":
                return "DELIVERED";
            default:
                return null;
        }
    };

    const getNextStatusText = (currentStatus: OrderDetail["status"]) => {
        const nextStatus = getNextStatus(currentStatus);
        return nextStatus ? getStatusText(nextStatus) : null;
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy đơn hàng
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Đơn hàng có thể đã bị xóa hoặc không tồn tại.
                    </p>
                    <button
                        onClick={handleNavigateBack}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleNavigateBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Đơn hàng #{order.id}
                        </h1>
                        <p className="text-gray-600">
                            Tạo lúc {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                    </Badge>

                    {getNextStatus(order.status) && (
                        <Button
                            onClick={() =>
                                updateOrderStatus(getNextStatus(order.status)!)
                            }
                            disabled={isUpdating}
                            variant={"outline"}
                            className="rounded-full"
                        >
                            {isUpdating
                                ? "Đang cập nhật..."
                                : `Chuyển thành ${getNextStatusText(
                                      order.status
                                  )}`}
                        </Button>
                    )}

                    {order.status !== "CANCELLED" &&
                        order.status !== "DELIVERED" && (
                            <Button
                                onClick={handleCancelOrder}
                                disabled={isUpdating}
                                className="rounded-full"
                                variant="destructive"
                            >
                                Hủy đơn
                            </Button>
                        )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Sản phẩm đã đặt
                        </h2>

                        <div className="space-y-4">
                            {order.orderDetails?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                                >
                                    <img
                                        src={
                                            item.image_url ||
                                            "https://via.placeholder.com/64"
                                        }
                                        alt={item.productName}
                                        className="size-38 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-medium text-gray-900">
                                            {item.productName}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            {item.colorName}
                                        </div>
                                        {item.versionName && (
                                            <div className="text-sm text-gray-600">
                                                {item.versionName}
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {formatCurrency(item.price)} <br />x{" "}
                                            {item.quantity}
                                        </p>
                                        <p className="text-sm text-gray-500 italic">
                                            Ghi chú:{" "}
                                            {item.note == null
                                                ? "--"
                                                : item.note}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                item.price * item.quantity
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin khách hàng
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {order.firstName} {order.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.email}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Địa chỉ giao hàng
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.firstName} {order.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.address}, {order.ward},{" "}
                                            {order.district}, {order.province}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                                <CreditCardIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {order.paymentType || "CASH"}
                                    </p>
                                </div>
                            </div>

                            {order.shippingTrackingCode && (
                                <div className="mt-4">
                                    <p className="font-medium text-gray-900">
                                        Mã vận đơn
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {order.shippingTrackingCode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary & Status History */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="text-gray-900">
                                    {formatCurrency(
                                        (order.totalAmount || 0) -
                                            (order.shippingFee || 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Phí vận chuyển
                                </span>
                                <span className="text-gray-900">
                                    {(order.shippingFee || 0) === 0
                                        ? "Miễn phí"
                                        : formatCurrency(
                                              order.shippingFee || 0
                                          )}
                                </span>
                            </div>
                            {(order.discountAmount || 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Giảm giá
                                    </span>
                                    <span className="text-green-600">
                                        -
                                        {formatCurrency(
                                            order.discountAmount || 0
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">
                                        Tổng cộng
                                    </span>
                                    <span className="font-semibold text-gray-900 text-lg">
                                        {formatCurrency(
                                            order.finalAmount ||
                                                order.totalAmount ||
                                                0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Lịch sử trạng thái
                        </h2>

                        <div className="space-y-4">
                            {order.statusHistory?.map((history, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(
                                            history.status as OrderDetail["status"]
                                        )}`}
                                    >
                                        {getStatusIcon(
                                            history.status as OrderDetail["status"]
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {getStatusText(
                                                history.status as OrderDetail["status"]
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(history.timestamp)}
                                        </p>
                                        {history.note && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {history.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )) || (
                                <div className="text-center text-gray-500">
                                    Chưa có lịch sử trạng thái
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
