import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Eye,
    Search,
    Filter,
    CheckCircle,
    Clock,
    X,
    Truck,
    Package,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import orderService from '../../services/orderService';

// Updated interface to match API response
interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: 'PENDING_PAYMENT' | 'PAID' | 'AWAITING_SHIPMENT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    paymentType: string;
    approveAt: string | null;
    createdBy: {
        id: number;
        firstName: string;
        lastName: string | null;
        image: string | null;
    };
}

// Helper function to transform API data to component interface
const transformApiOrderToOrder = (apiOrder: any): Order => {
    // Log để debug
    console.log('Transforming order:', apiOrder);
    
    const customerName = apiOrder.createdBy 
        ? `${apiOrder.createdBy.firstName} ${apiOrder.createdBy.lastName || ''}`.trim()
        : 'N/A';
    
    return {
        id: apiOrder.id,
        orderNumber: `#${apiOrder.id}`, // Generate order number from ID
        customerName: customerName,
        customerEmail: "N/A", // API doesn't provide email in this response
        status: apiOrder.status,
        totalAmount: 0, // API doesn't provide totalAmount in summary, would need detail API
        itemCount: 0, // API doesn't provide itemCount in summary, would need detail API
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return <Clock className="w-4 h-4" />;
            case 'PAID':
                return <CheckCircle className="w-4 h-4" />;
            case 'AWAITING_SHIPMENT':
                return <Package className="w-4 h-4" />;
            case 'SHIPPED':
                return <Truck className="w-4 h-4" />;
            case 'DELIVERED':
                return <CheckCircle className="w-4 h-4" />;
            case 'CANCELLED':
                return <X className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
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
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2"/>
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
                    
                    {totalElements > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Tìm thấy {totalElements} đơn hàng
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Đơn hàng</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thông tin</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="text-muted-foreground">
                                        {selectedStatus ? 
                                            `Không có đơn hàng nào với trạng thái "${getStatusText(selectedStatus as Order['status'])}".` :
                                            'Không có đơn hàng nào.'
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.orderNumber}</div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.paymentType}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {order.createdBy.image && (
                                                <img 
                                                    src={order.createdBy.image} 
                                                    alt={order.customerName}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{order.customerName}</div>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {order.createdBy.id}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                'outline'
                                            }
                                            className={"flex items-center gap-1 w-fit" + 
                                                (order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'AWAITING_SHIPMENT' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800')
                                            }
                                        >
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="text-sm">
                                            <div className="text-muted-foreground">
                                                {order.approveAt ? `Duyệt: ${formatDate(order.approveAt)}` : 'Chưa duyệt'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/admin/orders/${order.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        disabled={updatingOrderId === order.id}
                                                    >
                                                        <Package className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {order.status === 'PENDING_PAYMENT' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'PAID')}
                                                            disabled={updatingOrderId === order.id}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            {updatingOrderId === order.id ? 'Đang cập nhật...' : 'Xác nhận thanh toán'}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status === 'PAID' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'AWAITING_SHIPMENT')}
                                                            disabled={updatingOrderId === order.id}
                                                        >
                                                            <Package className="w-4 h-4 mr-2" />
                                                            {updatingOrderId === order.id ? 'Đang cập nhật...' : 'Chuẩn bị vận chuyển'}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status === 'AWAITING_SHIPMENT' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                                                            disabled={updatingOrderId === order.id}
                                                        >
                                                            <Truck className="w-4 h-4 mr-2" />
                                                            {updatingOrderId === order.id ? 'Đang cập nhật...' : 'Bắt đầu giao hàng'}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status === 'SHIPPED' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                                            disabled={updatingOrderId === order.id}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            {updatingOrderId === order.id ? 'Đang cập nhật...' : 'Đánh dấu đã giao'}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(order.status === 'PENDING_PAYMENT' || order.status === 'PAID') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                                            className="text-destructive"
                                                            disabled={updatingOrderId === order.id}
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            {updatingOrderId === order.id ? 'Đang cập nhật...' : 'Hủy đơn hàng'}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {orders.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Hiển thị{' '}
                            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> -{' '}
                            <span className="font-medium">{Math.min(currentPage * 10, totalElements)}</span>{' '}
                            trong <span className="font-medium">{totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
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
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            className={(currentPage === pageNum ? 'underline' : '') + " hover:underline bg-white hover:bg-white shadow-none text-black"}
                                            size="sm"
                                            onClick={() => {
                                                setCurrentPage(pageNum);
                                                fetchOrders();
                                            }}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
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
                                Sau
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminOrdersPage;
