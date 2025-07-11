import React, { useState } from "react";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { OrderHistory } from "../types/order";
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "../types/order";
import { orderHistoryService } from "../services/orderHistoryService";

export interface OrderHistoryCardProps {
    order: OrderHistory;
    index: number;
    onOrderCancelled?: () => void;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
    order,
    index,
    onOrderCancelled,
}) => {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
        {}
    );

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

    const formatAddress = (
        address:
            | string
            | {
                  fullName?: string;
                  phone?: string;
                  address: string;
                  ward?: string;
                  district?: string;
                  province?: string;
              }
    ) => {
        if (typeof address === "string") return address;

        const parts = [address.address];
        if (address.ward) parts.push(address.ward);
        if (address.district) parts.push(address.district);
        if (address.province) parts.push(address.province);

        return parts.join(", ");
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
                    <Link
                        to={`/order-detail/${order.id}`}
                        className={
                            "flex items-center justify-center text-sm font-normal gap-1 text-blue-600 hover:underline focus:outline-none focus:ring-2 rounded-sm focus:ring-blue-500 focus:ring-offset-2 transition"
                        }
                    >
                        Xem chi tiết đơn hàng{" "}
                        <ArrowUpRightIcon className={"size-3"} />
                    </Link>
                </div>
            </div>
            <div className={"flex flex-col gap-10 bg-gray-100 p-6 rounded-3xl"}>
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
                            <div className={"flex flex-col w-full space-y-1"}>
                                <p className={"text-lg font-semibold"}>
                                    {item.productName} - {item.colorName}
                                </p>
                                {item.versionName && (
                                    <p className={"text-sm text-gray-500"}>
                                        Phiên bản: {item.versionName}
                                    </p>
                                )}
                                <p className={"text-sm text-gray-500"}>
                                    Số lượng: {item.quantity}
                                </p>
                                <p className={"text-sm text-gray-500"}>
                                    Địa chỉ giao hàng:{" "}
                                    {formatAddress(order.shippingAddress)}
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
                                        <span
                                            className={getStatusColor(
                                                order.status
                                            )}
                                        >
                                            {ORDER_STATUS_MAP[order.status] ||
                                                order.status}
                                        </span>
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

                                {order.status === "DELIVERED" &&
                                    expandedItems[itemIndex] && (
                                        <div
                                            className={
                                                "pl-4 py-2 mt-1 bg-gray-50 rounded-md transition-all"
                                            }
                                        >
                                            <p
                                                className={
                                                    "text-sm text-gray-600"
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
                            <hr className={"border border-gray-200"} />
                        )}
                    </React.Fragment>
                ))}
                {/* Hiển thị tổng tiền đơn hàng */}
                <div
                    className={
                        "flex justify-between items-center pt-4 border-t border-gray-300"
                    }
                >
                    <div className={"text-sm text-gray-600"}>
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
                        {order.finalAmount.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default OrderHistoryCard;
