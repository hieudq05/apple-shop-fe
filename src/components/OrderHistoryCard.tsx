import React, {useState} from "react";
import {ArrowUpRightIcon} from "@heroicons/react/24/outline";

export interface OrderHistoryCardProps {
    id: string;
    orderDate: string;
    items: {
        productId: string;
        productName: string;
        storageName: string;
        colorName: string;
        imageUrl: string;
        quantity: number;
        price: number;
        address: string;
        status: string;
        completedDate?: string;
    }[];
}

interface OrderHistoryCardState {
    index: number;
    order: OrderHistoryCardProps;
}

const OrderHistoryCard: React.FC<OrderHistoryCardState> = ({
                                                               index,
                                                               order: {id, orderDate, items}
                                                           }) => {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    const toggleItemExpand = (index: number) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className={"container mx-auto py-12 border-b last:border-b-0 flex flex-col gap-4"}>
            <div className={"text-2xl font-semibold flex items-end justify-between"}>
                <div>{index}. Đơn hàng #{id} - {new Date(orderDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    weekday: 'short'
                })}</div>
                <a href={"#"}
                   className={"flex items-center justify-center text-sm font-normal gap-1 text-blue-600 hover:underline focus:outline-none focus:ring-2 rounded-sm focus:ring-blue-500 focus:ring-offset-2 transition"}>
                    Xem chi tiết đơn hàng <ArrowUpRightIcon className={"size-3"}/>
                </a>
            </div>
            <div className={"flex flex-col gap-10 bg-gray-100 p-6 rounded-3xl"}>
                {
                    items.map((item, index) => (
                        <>
                            <div key={index} className={"flex gap-4"}>
                                <img src={item.imageUrl} alt={item.productName}
                                     className={"w-[10rem] object-cover aspect-[8/10] rounded-xl"}/>
                                <div className={"flex flex-col w-full space-y-1"}>
                                    <p className={"text-lg font-semibold"}>{item.productName} {item.storageName} {item.colorName}</p>
                                    <p className={"text-sm text-gray-500"}>Số lượng: {item.quantity}</p>
                                    <p className={"text-sm text-gray-500"}>Địa chỉ giao hàng: {item.address}</p>

                                    <div
                                        className={"flex items-center cursor-pointer w-fit gap-1"}
                                        onClick={() => item.completedDate && toggleItemExpand(index)}
                                    >
                                        <p className={"text-sm flex items-center gap-1"}>
                                            Trạng thái: <span
                                            className={`flex gap-1 items-center ${item.status === "Đã giao hàng" ? "text-green-600 font-medium" : "text-gray-500"}`}>
                                            {/*<CheckCircleIcon className={"size-4"}/>*/}
                                            {item.status}
                                        </span>
                                        </p>
                                        {item.completedDate && (
                                            <svg
                                                className={"size-3 text-gray-500 transform " + (expandedItems[index] ? "rotate-180" : "rotate-0")}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        )}
                                    </div>

                                    {item.completedDate && expandedItems[index] && (
                                        <div className={"pl-4 py-2 mt-1 bg-gray-50 rounded-md transition-all"}>
                                            <p className={"text-sm text-gray-600"}>
                                                Ngày hoàn thành: {item.completedDate}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className={"ml-auto text-lg font-semibold"}>
                                    {(item.price * item.quantity).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    })}
                                </div>
                            </div>
                            {index < items.length - 1 && <hr className={"border border-gray-200"}/>}
                        </>
                    ))
                }
            </div>
        </div>
    )
}
export default OrderHistoryCard;

