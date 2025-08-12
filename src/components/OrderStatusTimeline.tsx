import React from "react";
import {CheckIcon, ClipboardDocumentIcon, ClockIcon, XMarkIcon,} from "@heroicons/react/24/solid";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion"
import {MoreHorizontal} from "lucide-react";

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

export const ORDER_STATUS_FLOW: StatusStep[] = [
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
                return <CheckIcon className="size-3 text-white"/>;
            case "current":
                return <ClockIcon className="size-4 text-blue-600"/>;
            case "cancelled":
                return <XMarkIcon className="size-4 text-white"/>;
            default:
                return <div className="size-4 p-0.5 bg-white rounded-full flex justify-center items-center"><MoreHorizontal
                    className={"size-6 text-gray-500"}/></div>;
        }
    };

    const getStatusColors = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return "bg-green-600 border-green-200";
            case "current":
                return "bg-blue-300 border-blue-200";
            case "cancelled":
                return "bg-red-500 border-red-200";
            default:
                return "bg-gray-300 border-gray-200";
        }
    };

    const getTextColors = (
        status: "completed" | "current" | "upcoming" | "cancelled"
    ) => {
        switch (status) {
            case "completed":
                return "text-green-700";
            case "current":
                return "text-blue-600";
            case "cancelled":
                return "text-destructive";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="bg-foreground/3 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Trạng thái đơn hàng</h2>

            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger className={"text-muted-foreground"}>Xem chi tiết </AccordionTrigger>
                    <AccordionContent>
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
                                                    className={`size-6 rounded-full border-2 flex items-center justify-center ${getStatusColors(
                                                        status
                                                    )}`}
                                                >
                                                    {getStatusIcon(status)}
                                                </div>

                                                {/* Connecting line */}
                                                {!isLast && (
                                                    <div
                                                        className={`absolute top-6 left-3.5 w-0.5 h-16 -translate-x-0.5 ${
                                                            status === "completed" ||
                                                            (status === "current" &&
                                                                index <
                                                                currentStatusIndex + 1)
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"
                                                        }`}
                                                    />
                                                )}
                                            </div>

                                            {/* Status content */}
                                            <div className="ml-4 pb-8">
                                                <h3
                                                    className={`font-semibold ${getTextColors(
                                                        status
                                                    )}`}
                                                >
                                                    {step.label}
                                                </h3>
                                                <p
                                                    className={`text-sm ${getTextColors(
                                                        status
                                                    )}`}
                                                >
                                                    {step.description}
                                                </p>

                                                {/* Show order date for first step */}
                                                {index === 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1">
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
                                                                <ClipboardDocumentIcon className="w-3 h-3"/>
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default OrderStatusTimeline;
