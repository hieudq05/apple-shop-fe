import React from "react";
import {ArrowUpRightIcon} from "@heroicons/react/24/outline";

export interface OrderHistoryCardProps {
    id: number;
    createdAt: string;
    paymentType: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    orderDetails: {
        id: number;
        product: { id: number };
        productName: string;
        quantity: number;
        price: number;
        note?: string;
        colorName: string;
        versionName: string;
        image_url: string;
    }[];
    shippingTrackingCode?: string;
}

interface OrderHistoryCardState {
    index: number;
    order: OrderHistoryCardProps;
}

const OrderHistoryCard: React.FC<OrderHistoryCardState> = ({
                                                               index,
                                                               order: {id, createdAt, paymentType, status, orderDetails, shippingTrackingCode}
                                                           }) => {


    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPED': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentTypeLabel = (type: string) => {
        switch (type) {
            case 'CASH': return 'Tiền mặt';
            case 'BANK_TRANSFER': return 'Chuyển khoản';
            case 'CREDIT_CARD': return 'Thẻ tín dụng';
            default: return type;
        }
    };

    return (
        <div className={"container mx-auto py-12 border-b last:border-b-0 flex flex-col gap-4"}>
            <div className={"text-2xl font-semibold flex items-end justify-between"}>
                <div className="flex flex-col">
                    <div>{index}. Đơn hàng #{id} - {new Date(createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        weekday: 'short'
                    })}</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">
                        Thanh toán: {getPaymentTypeLabel(paymentType)} | Trạng thái: {getStatusLabel(status)}
                        {shippingTrackingCode && (
                            <span className="ml-2">| Mã vận đơn: {shippingTrackingCode}</span>
                        )}
                    </div>
                </div>
                <a href={"#"}
                   className={"flex items-center justify-center text-sm font-normal gap-1 text-blue-600 hover:underline focus:outline-none focus:ring-2 rounded-sm focus:ring-blue-500 focus:ring-offset-2 transition"}>
                    Xem chi tiết đơn hàng <ArrowUpRightIcon className={"size-3"}/>
                </a>
            </div>
            <div className={"flex flex-col gap-10 bg-gray-100 p-6 rounded-3xl"}>
                {
                    orderDetails.map((item, index) => (
                        <>
                            <div key={index} className={"flex gap-4"}>
                                <img src={item.image_url} alt={item.productName}
                                     className={"w-[10rem] object-cover aspect-[8/10] rounded-xl"}/>
                                <div className={"flex flex-col w-full space-y-1"}>
                                    <p className={"text-lg font-semibold"}>{item.productName} {item.versionName} {item.colorName}</p>
                                    <p className={"text-sm text-gray-500"}>Số lượng: {item.quantity}</p>
                                    {item.note && (
                                        <p className={"text-sm text-gray-500"}>Ghi chú: {item.note}</p>
                                    )}

                                    <div className={"flex items-center w-fit gap-1"}>
                                        <p className={"text-sm flex items-center gap-1"}>
                                            Trạng thái: <span
                                            className={`flex gap-1 items-center ${
                                                status === "DELIVERED" ? "text-green-600 font-medium" :
                                                status === "CANCELLED" ? "text-red-600 font-medium" :
                                                "text-gray-500"
                                            }`}>
                                            {getStatusLabel(status)}
                                        </span>
                                        </p>
                                    </div>
                                </div>
                                <div className={"ml-auto text-lg font-semibold"}>
                                    {(item.price * item.quantity).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    })}
                                </div>
                            </div>
                            {index < orderDetails.length - 1 && <hr className={"border border-gray-200"}/>}
                        </>
                    ))
                }
            </div>
        </div>
    )
}
export default OrderHistoryCard;

