import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import orderService from '../../services/orderService';
import { OrderDataTable, type Order } from '@/components/order-data-table';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';

// Transform API data to Order interface for the data table
const transformApiOrderToOrder = (apiOrder: any): Order => {
    console.log('Transforming order:', apiOrder);
    
    const customerName = apiOrder.createdBy 
        ? `${apiOrder.createdBy.firstName} ${apiOrder.createdBy.lastName || ''}`.trim()
        : 'N/A';
    
    return {
        id: apiOrder.id,
        orderNumber: `#${apiOrder.id}`,
        customerName: customerName,
        customerEmail: "N/A", // API doesn't provide email in this response
        status: apiOrder.status,
        totalAmount: 0, // API doesn't provide totalAmount in summary
        itemCount: 0, // API doesn't provide itemCount in summary
        createdAt: apiOrder.createdAt,
        paymentType: apiOrder.paymentType || 'N/A',
        approveAt: apiOrder.approveAt,
        createdBy: {
            id: apiOrder.createdBy?.id || 0,
            firstName: apiOrder.createdBy?.firstName || 'N/A',
            lastName: apiOrder.createdBy?.lastName,
            image: apiOrder.createdBy?.image
        }
    };
};

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
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

    useEffect(() => {
        // Reset to page 1 when search or status changes
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchOrders();
        }
    }, [debouncedSearchTerm, selectedStatus]);

    const fetchOrders = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);
            
            // Check if we have a token
            const token = localStorage.getItem('accessToken');
            console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
            
            const response = await orderService.getAdminOrders({
                page: currentPage - 1, // API uses 0-based pagination
                size: 5,
                ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }) // Add search parameter
            });
            
            console.log('=== API RESPONSE DEBUG ===');
            console.log('Raw response:', response);
            console.log('Response type:', typeof response);
            console.log('Response success:', response?.success);
            console.log('Response data:', response?.data);
            console.log('Response data type:', typeof response?.data);
            console.log('Response data length:', Array.isArray(response?.data) ? response.data.length : 'NOT ARRAY');
            
            if (response && response.success && response.data) {
                console.log('=== PROCESSING SUCCESS RESPONSE ===');
                const transformedOrders = response.data.map((order: any, index: number) => {
                    console.log(`Transforming order ${index}:`, order);
                    return transformApiOrderToOrder(order);
                });
                console.log('Transformed orders:', transformedOrders);
                setOrders(transformedOrders);
                
                // Handle pagination metadata if available
                if (response.meta) {
                    setTotalPages(response.meta.totalPage || 1);
                    setTotalElements(response.meta.totalElements || transformedOrders.length);
                    console.log('Pagination meta:', response.meta);
                } else {
                    // Fallback if no meta data
                    setTotalPages(Math.ceil(transformedOrders.length / 10));
                    setTotalElements(transformedOrders.length);
                }
            } else if (response && response.data && Array.isArray(response.data)) {
                console.log('=== PROCESSING DIRECT DATA RESPONSE ===');
                // Handle case where API returns data directly without success flag
                const transformedOrders = response.data.map((order: any, index: number) => {
                    console.log(`Transforming direct order ${index}:`, order);
                    return transformApiOrderToOrder(order);
                });
                console.log('Direct data response, transformed orders:', transformedOrders);
                setOrders(transformedOrders);
                setTotalPages(Math.ceil(transformedOrders.length / 10));
                setTotalElements(transformedOrders.length);
            } else if (response && Array.isArray(response)) {
                console.log('=== PROCESSING ARRAY RESPONSE ===');
                // Handle case where API returns array directly
                const transformedOrders = response.map((order: any, index: number) => {
                    console.log(`Transforming array order ${index}:`, order);
                    return transformApiOrderToOrder(order);
                });
                console.log('Array response, transformed orders:', transformedOrders);
                setOrders(transformedOrders);
                setTotalPages(Math.ceil(transformedOrders.length / 10));
                setTotalElements(transformedOrders.length);
            } else {
                console.log('=== NO VALID DATA FOUND ===');
                const errorMessage = response?.message || 'Không thể tải dữ liệu đơn hàng';
                console.error('API Error:', errorMessage);
                console.error('Full response object:', response);
                setError(errorMessage);
                setOrders([]);
            }
        } catch (err: any) {
            console.log('=== FETCH ERROR ===');
            console.error('Error fetching orders:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (err.response?.status === 403) {
                setError('Bạn không có quyền truy cập tính năng này.');
            } else if (err.response?.status === 404) {
                setError('Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình backend.');
            } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
            } else {
                setError(`Có lỗi xảy ra: ${err.message || 'Vui lòng thử lại.'}`);
            }
            setOrders([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchOrders(true);
    };

    const handleUpdateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
        try {
            setUpdatingOrderId(orderId);
            console.log(`Updating order ${orderId} to status ${newStatus}`);
            
            // TODO: Implement API call to update order status
            // For now, just update local state
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus }
                    : order
            ));
            
            console.log('Order status updated successfully (local only)');
        } catch (error: any) {
            console.error('Error updating order status:', error);
            alert(`Lỗi cập nhật trạng thái: ${error.message || 'Có lỗi xảy ra'}`);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return 'Chờ thanh toán';
            case 'PAID':
                return 'Đã thanh toán';
            case 'AWAITING_SHIPMENT':
                return 'Chờ vận chuyển';
            case 'SHIPPED':
                return 'Đang giao';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELLED':
                return 'Đã hủy';
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
                        <CardTitle className="text-2xl">Quản lý đơn hàng</CardTitle>
                        <CardDescription>
                            Theo dõi và quản lý tất cả đơn hàng của khách hàng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-12 gap-4">
                            <div className="text-xl text-red-500">{error}</div>
                            <Button onClick={handleRefresh} disabled={refreshing}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {refreshing ? 'Đang tải...' : 'Thử lại'}
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
                        <CardTitle className="text-2xl">Quản lý đơn hàng</CardTitle>
                        <CardDescription>
                            Theo dõi và quản lý tất cả đơn hàng của khách hàng
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
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
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">Quản lý đơn hàng</CardTitle>
                            <CardDescription>
                                Theo dõi và quản lý tất cả đơn hàng của khách hàng
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                placeholder="Tìm kiếm đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={selectedStatus || undefined} onValueChange={(value) => setSelectedStatus(value || '')}>
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder="Tất cả trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="PENDING_PAYMENT">Chờ thanh toán</SelectItem>
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="AWAITING_SHIPMENT">Chờ vận chuyển</SelectItem>
                                <SelectItem value="SHIPPED">Đang giao</SelectItem>
                                <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            {!isLoading && !refreshing && orders.length > 0 && (
                <div className="space-y-6">
                    <CardContent className="p-0">
                        <OrderDataTable 
                            data={orders}
                            onView={(orderId) => window.open(`/admin/orders/${orderId}`, '_blank')}
                            onUpdateStatus={handleUpdateOrderStatus}
                            updatingOrderId={updatingOrderId}
                        />
                    </CardContent>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Hiển thị{' '}
                            <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> -{' '}
                            <span className="font-medium">{Math.min(currentPage * 5, totalElements)}</span>{' '}
                            trong <span className="font-medium">{totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(1);
                                    fetchOrders();
                                }}
                                disabled={currentPage === 1}
                            >
                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(Math.max(1, currentPage - 1));
                                    fetchOrders();
                                }}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNumber = currentPage > 3 ? currentPage - 2 + i : i + 1;
                                    return pageNumber <= totalPages ? (
                                        <Button
                                            key={pageNumber}
                                            className={`bg-transparent hover:bg-transparent text-black shadow-none ${currentPage === pageNumber ? "underline" : ""}`}
                                            size="sm"
                                            onClick={() => {
                                                setCurrentPage(pageNumber);
                                                fetchOrders();
                                            }}
                                        >
                                            {pageNumber}
                                        </Button>
                                    ) : null;
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                                    fetchOrders();
                                }}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={"outline"}
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(totalPages - 1);
                                    fetchOrders();
                                }}
                                disabled={currentPage === totalPages || totalPages <= 1}
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
                            {selectedStatus ? 
                                `Không có đơn hàng nào với trạng thái "${getStatusText(selectedStatus as Order['status'])}".` :
                                'Không có đơn hàng nào.'
                            }
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminOrdersPage;
