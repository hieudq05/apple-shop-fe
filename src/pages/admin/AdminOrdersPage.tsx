import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Plus,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import orderService from "../../services/orderService";
import { OrderDataTable, type Order } from "@/components/order-data-table";
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { Helmet } from "react-helmet-async";

// Transform API data to Order interface for the data table
const transformApiOrderToOrder = (apiOrder: unknown): Order => {
    const order = apiOrder as {
        id: number;
        status: string;
        createdAt: string;
        paymentType?: string;
        approveAt?: string;
        createdBy?: {
            id: number;
            firstName: string;
            lastName?: string;
            image?: string;
        };
    };

    console.log("Transforming order:", order);

    const customerName = order.createdBy
        ? `${order.createdBy.firstName} ${
              order.createdBy.lastName || ""
          }`.trim()
        : "N/A";

    return {
        id: order.id,
        orderNumber: `#${order.id}`,
        customerName: customerName,
        customerEmail: "N/A", // API doesn't provide email in this response
        status: order.status as Order["status"],
        totalAmount: 0, // API doesn't provide totalAmount in summary
        itemCount: 0, // API doesn't provide itemCount in summary
        createdAt: order.createdAt,
        paymentType: order.paymentType || "N/A",
        approveAt: order.approveAt || null,
        createdBy: {
            id: order.createdBy?.id || 0,
            firstName: order.createdBy?.firstName || "N/A",
            lastName: order.createdBy?.lastName || null,
            image: order.createdBy?.image || null,
        },
    };
};

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [debouncedCustomerEmail, setDebouncedCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [debouncedCustomerPhone, setDebouncedCustomerPhone] = useState("");
    const [province, setProvince] = useState("");
    const [debouncedProvince, setDebouncedProvince] = useState("");
    const [trackingCode, setTrackingCode] = useState("");
    const [debouncedTrackingCode, setDebouncedTrackingCode] = useState("");
    const [createdAtFrom, setCreatedAtFrom] = useState("");
    const [createdAtTo, setCreatedAtTo] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Debounce customer email
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCustomerEmail(customerEmail);
        }, 500);

        return () => clearTimeout(timer);
    }, [customerEmail]);

    // Debounce customer phone
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCustomerPhone(customerPhone);
        }, 500);

        return () => clearTimeout(timer);
    }, [customerPhone]);

    // Debounce province
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedProvince(province);
        }, 500);

        return () => clearTimeout(timer);
    }, [province]);

    // Debounce tracking code
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTrackingCode(trackingCode);
        }, 500);

        return () => clearTimeout(timer);
    }, [trackingCode]);

    useEffect(() => {
        // Reset to page 1 when search or filters change
        setCurrentPage(1);
    }, [
        debouncedSearchTerm,
        selectedStatus,
        selectedPaymentType,
        debouncedCustomerEmail,
        debouncedCustomerPhone,
        debouncedProvince,
        debouncedTrackingCode,
        createdAtFrom,
        createdAtTo,
    ]);

    const fetchOrders = useCallback(
        async (showRefreshing = false) => {
            try {
                if (showRefreshing) {
                    setRefreshing(true);
                } else {
                    setIsLoading(true);
                }
                setError(null);

                const response = await orderService.searchOrders({
                    page: currentPage - 1, // API uses 0-based pagination
                    size: 10,
                    ...(debouncedSearchTerm && {
                        searchTerm: debouncedSearchTerm,
                    }),
                    ...(selectedStatus &&
                        selectedStatus !== "all" && { status: selectedStatus }),
                    ...(selectedPaymentType &&
                        selectedPaymentType !== "all" && {
                            paymentType: selectedPaymentType,
                        }),
                    ...(debouncedCustomerEmail && {
                        customerEmail: debouncedCustomerEmail,
                    }),
                    ...(debouncedCustomerPhone && {
                        customerPhone: debouncedCustomerPhone,
                    }),
                    ...(debouncedProvince && { province: debouncedProvince }),
                    ...(debouncedTrackingCode && {
                        shippingTrackingCode: debouncedTrackingCode,
                    }),
                    ...(createdAtFrom && { createdAtFrom }),
                    ...(createdAtTo && { createdAtTo }),
                });

                if (response && response.success && response.data) {
                    const transformedOrders = response.data.map(
                        (order: unknown) => {
                            return transformApiOrderToOrder(order);
                        }
                    );
                    setOrders(transformedOrders);

                    // Handle pagination metadata if available
                    if (response.meta) {
                        setTotalPages(response.meta.totalPage || 1);
                        setTotalElements(
                            response.meta.totalElements ||
                                transformedOrders.length
                        );
                    } else {
                        // Fallback if no meta data
                        setTotalPages(Math.ceil(transformedOrders.length / 10));
                        setTotalElements(transformedOrders.length);
                    }
                } else if (
                    response &&
                    response.data &&
                    Array.isArray(response.data)
                ) {
                    // Handle case where API returns data directly without success flag
                    const transformedOrders = response.data.map(
                        (order: unknown) => {
                            return transformApiOrderToOrder(order);
                        }
                    );
                    setOrders(transformedOrders);
                    setTotalPages(Math.ceil(transformedOrders.length / 10));
                    setTotalElements(transformedOrders.length);
                } else if (response && Array.isArray(response)) {
                    console.log("=== PROCESSING ARRAY RESPONSE ===");
                    // Handle case where API returns array directly
                    const transformedOrders = response.map((order: unknown) => {
                        return transformApiOrderToOrder(order);
                    });
                    setOrders(transformedOrders);
                    setTotalPages(Math.ceil(transformedOrders.length / 10));
                    setTotalElements(transformedOrders.length);
                } else {
                    console.log("=== NO VALID DATA FOUND ===");
                    const errorMessage =
                        response?.message || "Không thể tải dữ liệu đơn hàng";
                    console.error("API Error:", errorMessage);
                    console.error("Full response object:", response);
                    setError(errorMessage);
                    setOrders([]);
                }
            } catch (err: unknown) {
                console.log("=== FETCH ERROR ===");
                console.error("Error fetching orders:", err);

                const error = err as {
                    response?: {
                        status?: number;
                        data?: unknown;
                    };
                    code?: string;
                    message?: string;
                };

                console.error("Error response:", error.response);
                console.error("Error status:", error.response?.status);
                console.error("Error data:", error.response?.data);

                if (error.response?.status === 401) {
                    setError(
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                    );
                } else if (error.response?.status === 403) {
                    setError("Bạn không có quyền truy cập tính năng này.");
                } else if (error.response?.status === 404) {
                    setError(
                        "Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình backend."
                    );
                } else if (
                    error.code === "ECONNREFUSED" ||
                    error.message?.includes("Network Error")
                ) {
                    setError(
                        "Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy."
                    );
                } else {
                    setError(
                        `Có lỗi xảy ra: ${error.message || "Vui lòng thử lại."}`
                    );
                }
                setOrders([]);
            } finally {
                setIsLoading(false);
                setRefreshing(false);
            }
        },
        [
            currentPage,
            selectedStatus,
            selectedPaymentType,
            debouncedSearchTerm,
            debouncedCustomerEmail,
            debouncedCustomerPhone,
            debouncedProvince,
            debouncedTrackingCode,
            createdAtFrom,
            createdAtTo,
        ]
    );

    // Fetch orders when currentPage changes
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleRefresh = () => {
        fetchOrders(true);
    };

    const handleUpdateOrderStatus = async (
        orderId: number,
        newStatus: Order["status"]
    ) => {
        const loadingToastId = toast.loading(
            "Đang cập nhật trạng thái đơn hàng...",
            {
                description: "Vui lòng đợi trong giây lát",
            }
        );

        try {
            setUpdatingOrderId(orderId);
            console.log(`Updating order ${orderId} to status ${newStatus}`);

            // TODO: Implement API call to update order status
            // For now, just update local state
            setOrders(
                orders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            toast.dismiss(loadingToastId);
            toast.success("Cập nhật trạng thái thành công", {
                description: `Đơn hàng #${orderId} đã được cập nhật`,
                duration: 3000,
            });

            console.log("Order status updated successfully (local only)");
        } catch (error: unknown) {
            console.error("Error updating order status:", error);

            const err = error as { message?: string };

            toast.dismiss(loadingToastId);
            toast.error("Không thể cập nhật trạng thái", {
                description:
                    err.message || "Có lỗi xảy ra khi cập nhật đơn hàng",
                duration: 5000,
            });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusText = (status: Order["status"]) => {
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
                return "Đang giao";
            case "DELIVERED":
                return "Đã giao";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Error state
    if (error && !isLoading && !refreshing) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Quản lý đơn hàng
                        </CardTitle>
                        <CardDescription>
                            Theo dõi và quản lý tất cả đơn hàng của khách hàng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-12 gap-4">
                            <div className="text-xl text-red-500">{error}</div>
                            <Button
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {refreshing ? "Đang tải..." : "Thử lại"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading state
    if (isLoading && !refreshing) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Quản lý đơn hàng
                        </CardTitle>
                        <CardDescription>
                            Theo dõi và quản lý tất cả đơn hàng của khách hàng
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-4"
                                >
                                    <Skeleton className="h-12 w-12 rounded" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Quản lý đơn hàng - Apple</title>
            </Helmet>
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">
                                Quản lý đơn hàng
                            </CardTitle>
                            <CardDescription>
                                Theo dõi và quản lý tất cả đơn hàng của khách
                                hàng
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() =>
                                (window.location.href = "/admin/create/order")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tạo đơn hàng mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="space-y-4">
                        {/* Basic Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm tổng quát (tên, email, số điện thoại, địa chỉ...)..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={selectedStatus || undefined}
                                onValueChange={(value) =>
                                    setSelectedStatus(value || "")
                                }
                            >
                                <SelectTrigger className="w-fit">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả trạng thái
                                    </SelectItem>
                                    <SelectItem value="PENDING_PAYMENT">
                                        Chờ thanh toán
                                    </SelectItem>
                                    <SelectItem value="PAID">
                                        Đã thanh toán
                                    </SelectItem>
                                    <SelectItem value="PROCESSING">
                                        Đang xử lý
                                    </SelectItem>
                                    <SelectItem value="AWAITING_SHIPMENT">
                                        Chờ vận chuyển
                                    </SelectItem>
                                    <SelectItem value="SHIPPED">
                                        Đang giao
                                    </SelectItem>
                                    <SelectItem value="DELIVERED">
                                        Đã giao
                                    </SelectItem>
                                    <SelectItem value="CANCELLED">
                                        Đã hủy
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowAdvancedFilters(!showAdvancedFilters)
                                }
                                className="gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Bộ lọc nâng cao
                                {showAdvancedFilters ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="border rounded-lg p-4 bg-gray-50/50 space-y-4">
                                <h4 className="font-medium text-sm text-gray-700 mb-3">
                                    Bộ lọc nâng cao
                                </h4>

                                {/* Row 1: Payment Type & Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Phương thức thanh toán
                                        </label>
                                        <Select
                                            value={
                                                selectedPaymentType || undefined
                                            }
                                            onValueChange={(value) =>
                                                setSelectedPaymentType(
                                                    value || ""
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tất cả" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Tất cả
                                                </SelectItem>
                                                <SelectItem value="VNPAY">
                                                    VNPay
                                                </SelectItem>
                                                <SelectItem value="MOMO">
                                                    MoMo
                                                </SelectItem>
                                                <SelectItem value="PAYPAL">
                                                    PayPal
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Email khách hàng
                                        </label>
                                        <Input
                                            placeholder="Nhập email..."
                                            value={customerEmail}
                                            onChange={(e) =>
                                                setCustomerEmail(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Số điện thoại
                                        </label>
                                        <Input
                                            placeholder="Nhập số điện thoại..."
                                            value={customerPhone}
                                            onChange={(e) =>
                                                setCustomerPhone(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Location & Tracking */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Tỉnh/Thành phố
                                        </label>
                                        <Input
                                            placeholder="Nhập tỉnh/thành phố..."
                                            value={province}
                                            onChange={(e) =>
                                                setProvince(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Mã vận đơn
                                        </label>
                                        <Input
                                            placeholder="Nhập mã vận đơn..."
                                            value={trackingCode}
                                            onChange={(e) =>
                                                setTrackingCode(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Từ ngày
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={createdAtFrom}
                                            onChange={(e) =>
                                                setCreatedAtFrom(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                                            Đến ngày
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={createdAtTo}
                                            onChange={(e) =>
                                                setCreatedAtTo(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPaymentType("");
                                            setCustomerEmail("");
                                            setCustomerPhone("");
                                            setProvince("");
                                            setTrackingCode("");
                                            setCreatedAtFrom("");
                                            setCreatedAtTo("");
                                            // Reset debounced values as well
                                            setDebouncedCustomerEmail("");
                                            setDebouncedCustomerPhone("");
                                            setDebouncedProvince("");
                                            setDebouncedTrackingCode("");
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            {!isLoading && !refreshing && orders.length > 0 && (
                <div className="space-y-6">
                    <CardContent className="p-0">
                        <OrderDataTable
                            data={orders}
                            onView={(orderId) =>
                                window.open(
                                    `/admin/orders/${orderId}`,
                                    "_blank"
                                )
                            }
                            onUpdateStatus={handleUpdateOrderStatus}
                            updatingOrderId={updatingOrderId}
                        />
                    </CardContent>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Hiển thị{" "}
                            <span className="font-medium">
                                {(currentPage - 1) * 10 + 1}
                            </span>{" "}
                            -{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * 10, totalElements)}
                            </span>{" "}
                            trong{" "}
                            <span className="font-medium">{totalElements}</span>{" "}
                            kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map(
                                    (_, i) => {
                                        const pageNumber =
                                            currentPage > 3
                                                ? currentPage - 2 + i
                                                : i + 1;
                                        return pageNumber <= totalPages ? (
                                            <Button
                                                key={pageNumber}
                                                className={`bg-transparent hover:bg-transparent text-foreground shadow-none ${
                                                    currentPage === pageNumber
                                                        ? "underline"
                                                        : ""
                                                }`}
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(pageNumber)
                                                }
                                            >
                                                {pageNumber}
                                            </Button>
                                        ) : null;
                                    }
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={"outline"}
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={
                                    currentPage === totalPages ||
                                    totalPages <= 1
                                }
                            >
                                <ChevronDoubleRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !refreshing && orders.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="text-muted-foreground">
                            {selectedStatus
                                ? `Không có đơn hàng nào với trạng thái "${getStatusText(
                                      selectedStatus as Order["status"]
                                  )}".`
                                : "Không có đơn hàng nào."}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminOrdersPage;
