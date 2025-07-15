import React from "react";
import {
    CheckIcon,
    ClockIcon,
    XMarkIcon,
    ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";

interface OrderStatusTimelineProps {
    currentStatus: string;
    orderDate: string;
    trackingCode?: string;
}

interface StatusStep {
    key: string;
    label: string;
    description: string;
}

const ORDER_STATUS_FLOW: StatusStep[] = [
    {
        key: "PENDING_PAYMENT",
        label: "Chờ thanh toán",
        description: "Đơn hàng đã được tạo, đang chờ thanh toán",
    },
    {
        key: "PAID",
        label: "Đã thanh toán",
        description: "Thanh toán thành công, đơn hàng đang được xử lý",
    },
    {
        key: "PROCESSING",
        label: "Đang xử lý",
        description: "Đơn hàng đang được chuẩn bị và đóng gói",
    },
    {
        key: "AWAITING_SHIPMENT",
        label: "Chờ giao hàng",
        description: "Đơn hàng đã sẵn sàng và chờ đơn vị vận chuyển",
    },
    {
        key: "SHIPPED",
        label: "Đang giao hàng",
        description: "Đơn hàng đang trên đường giao đến bạn",
    },
    {
        key: "DELIVERED",
        label: "Giao hàng thành công",
        description: "Đơn hàng đã được giao thành công",
    },
];

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
    currentStatus,
    orderDate,
    trackingCode,
}) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You can add a toast notification here
    };

    const getCurrentStatusIndex = (status: string): number => {
        const index = ORDER_STATUS_FLOW.findIndex(
            (step) => step.key === status
        );
        return index === -1 ? 0 : index;
    };

    const currentStatusIndex = getCurrentStatusIndex(currentStatus);
    const isCancelled = currentStatus === "CANCELLED";
    const isFailedPayment = currentStatus === "FAILED_PAYMENT";

    const getStepStatus = (
        stepIndex: number,
        stepKey: string
    ): "completed" | "current" | "upcoming" | "cancelled" => {
        if (isCancelled || isFailedPayment) {
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

    const getStatusIcon = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return <CheckIcon className="w-5 h-5 text-white" />;
            case "current":
                return <ClockIcon className="w-5 h-5 text-white" />;
            case "cancelled":
                return <XMarkIcon className="w-5 h-5 text-white" />;
            default:
                return <div className="w-3 h-3 bg-white rounded-full" />;
        }
    };

    const getStatusColors = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return "bg-green-500 border-green-500";
            case "current":
                return "bg-blue-500 border-blue-500";
            case "cancelled":
                return "bg-red-500 border-red-500";
            default:
                return "bg-gray-300 border-gray-300";
        }
    };

    const getTextColors = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return "text-green-700";
            case "current":
                return "text-blue-700";
            case "cancelled":
                return "text-red-700";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Trạng thái đơn hàng</h2>

            {/* Special handling for cancelled orders */}
            {isCancelled && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <XMarkIcon className="w-5 h-5" />
                        <span className="font-medium">Đơn hàng đã bị hủy</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                        Đơn hàng của bạn đã bị hủy và sẽ được hoàn tiền (nếu đã
                        thanh toán)
                    </p>
                </div>
            )}

            {/* Special handling for failed payment */}
            {isFailedPayment && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <XMarkIcon className="w-5 h-5" />
                        <span className="font-medium">Thanh toán thất bại</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                        Quá trình thanh toán không thành công. Vui lòng thử lại
                        hoặc chọn phương thức thanh toán khác.
                    </p>
                </div>
            )}

            <div className="relative">
                {ORDER_STATUS_FLOW.map((step, index) => {
                    const status = getStepStatus(index, step.key);
                    const isLast = index === ORDER_STATUS_FLOW.length - 1;

                    return (
                        <div key={step.key} className="relative">
                            <div className="flex items-start">
                                {/* Status circle */}
                                <div className="flex-shrink-0 relative">
                                    <div
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColors(
                                            status
                                        )}`}
                                    >
                                        {getStatusIcon(status)}
                                    </div>

                                    {/* Connecting line */}
                                    {!isLast && (
                                        <div
                                            className={`absolute top-10 left-5 w-0.5 h-16 -translate-x-0.5 ${
                                                status === "completed" ||
                                                (status === "current" &&
                                                    index <
                                                        currentStatusIndex + 1)
                                                    ? "bg-green-300"
                                                    : "bg-gray-300"
                                            }`}
                                        />
                                    )}
                                </div>

                                {/* Status content */}
                                <div className="ml-4 pb-8">
                                    <h3
                                        className={`font-medium ${getTextColors(
                                            status
                                        )}`}
                                    >
                                        {step.label}
                                    </h3>
                                    <p
                                        className={`text-sm mt-1 ${getTextColors(
                                            status
                                        )}`}
                                    >
                                        {step.description}
                                    </p>

                                    {/* Show order date for first step */}
                                    {index === 0 && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(
                                                orderDate
                                            ).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}

                                    {/* Show tracking code for shipped status */}
                                    {step.key === "SHIPPED" &&
                                        trackingCode &&
                                        status !== "upcoming" && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-xs text-gray-600">
                                                    Mã vận đơn: {trackingCode}
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            trackingCode
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <ClipboardDocumentIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Current status summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Trạng thái hiện tại:</span>{" "}
                    <span
                        className={`font-medium ${getTextColors(
                            getStepStatus(currentStatusIndex, currentStatus)
                        )}`}
                    >
                        {ORDER_STATUS_FLOW.find(
                            (step) => step.key === currentStatus
                        )?.label ||
                            (isCancelled
                                ? "Đã hủy"
                                : isFailedPayment
                                ? "Thanh toán thất bại"
                                : currentStatus)}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default OrderStatusTimeline;
