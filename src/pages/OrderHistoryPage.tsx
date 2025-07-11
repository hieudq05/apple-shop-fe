import OrderHistoryCard from "../components/OrderHistoryCard";
import OrderSearchForm from "../components/OrderSearchForm";
import React, { useState, useEffect } from "react";
import {
    orderHistoryService,
    type OrderSearchParams,
} from "../services/orderHistoryService";
import type { OrderHistory } from "../types/order";
import { getUserData } from "../utils/storage";

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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

    const handleSearch = async (searchParams: OrderSearchParams) => {
        try {
            setSearchLoading(true);
            setError(null);
            setIsSearching(true);

            const response = await orderHistoryService.searchOrders(
                searchParams
            );

            if (response.success) {
                setOrders(response.data || []);
            } else {
                setError(response.message || "Không thể tìm kiếm đơn hàng");
            }
        } catch (err) {
            console.error("Error searching orders:", err);
            setError("Có lỗi xảy ra khi tìm kiếm đơn hàng");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setIsSearching(false);
        fetchOrderHistory();
    };

    const handleOrderCancelled = () => {
        if (isSearching) {
            // If currently searching, we don't have the search params to re-search
            // So just refresh the order history
            fetchOrderHistory();
            setIsSearching(false);
        } else {
            fetchOrderHistory();
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

                {/* Search Form */}
                <OrderSearchForm
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    isLoading={searchLoading}
                />

                {/* Results */}
                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order: OrderHistory, idx) => (
                            <OrderHistoryCard
                                order={order}
                                key={order.id}
                                index={idx + 1}
                                onOrderCancelled={handleOrderCancelled}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500 font-medium mb-4">
                            {isSearching
                                ? "Không tìm thấy đơn hàng nào phù hợp."
                                : "Bạn không có đơn hàng nào gần đây."}
                        </p>
                        {!isSearching && (
                            <p className="text-gray-400">
                                Khi bạn đặt hàng, chúng sẽ xuất hiện ở đây.
                            </p>
                        )}
                    </div>
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
