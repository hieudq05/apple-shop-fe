import OrderHistoryCard from "../components/OrderHistoryCard.tsx";
import React, { useState, useEffect } from "react";
import { orderHistoryService } from "../services/orderHistoryService";
import type { OrderHistory } from "../types/order";
import { getUserData } from "@/utils/storage.ts";

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderHistoryService.getOrderHistory({
                page: 0,
                size: 20,
            });

            if (response.success && response.data) {
                setOrders(response.data);
            } else {
                setError(response.message || "Không thể tải lịch sử đơn hàng");
            }
        } catch (err) {
            console.error("Error fetching order history:", err);
            setError("Có lỗi xảy ra khi tải lịch sử đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className={"py-6 bg-gray-100"}>
                    <div className={"container mx-auto"}>
                        <div className={"text-lg font-semibold"}>Đơn hàng</div>
                    </div>
                </div>
                <div className="container mx-auto py-12">
                    <h1 className="text-4xl font-semibold mb-8">
                        Lịch sử đơn hàng
                    </h1>
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
                <div className={"py-6 bg-gray-100"}>
                    <div className={"container mx-auto"}>
                        <div className={"text-lg font-semibold"}>Đơn hàng</div>
                    </div>
                </div>
                <div className="container mx-auto py-12">
                    <h1 className="text-4xl font-semibold mb-8">
                        Lịch sử đơn hàng
                    </h1>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Có lỗi xảy ra</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchOrderHistory}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={"py-6 bg-gray-100"}>
                <div className={"container mx-auto"}>
                    <div className={"text-lg font-semibold"}>Đơn hàng</div>
                </div>
            </div>
            <div className="container mx-auto py-12 flex flex-col gap-y-6">
                <h1 className="text-4xl font-semibold">Lịch sử đơn hàng</h1>
                {orders.length > 0 ? (
                    orders.map((order: OrderHistory, idx) => (
                        <OrderHistoryCard
                            order={order}
                            key={order.id}
                            index={idx + 1}
                            onOrderCancelled={fetchOrderHistory}
                        />
                    ))
                ) : (
                    <>
                        <p className="text-xl text-gray-500 font-medium">
                            Bạn không có đơn hàng nào gần đây.
                        </p>
                        <hr className={"my-6"} />
                    </>
                )}
                <div className={"space-y-1"}>
                    <p className="text-xl font-medium">
                        Bạn không thấy tất cả đơn hàng của mình?
                    </p>
                    <p className="text-gray-500 text-sm">
                        Bạn hiện đang đăng nhập bằng{" "}
                        <span className={"text-blue-600"}>
                            {getUserData()?.email || "Tài khoản của bạn"}
                        </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Để xem tài khoản khác, hãy chuyển đổi tài khoản của bạn
                        bằng cách nhấp vào biểu tượng tài khoản ở góc trên bên
                        phải và chọn "Đăng xuất". Sau đó, đăng nhập lại bằng tài
                        khoản khác của bạn.
                    </p>
                </div>
            </div>
        </>
    );
};
export default OrderHistoryPage;
