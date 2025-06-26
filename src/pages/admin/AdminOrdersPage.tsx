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
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
}

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, searchTerm, selectedStatus]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockOrders: Order[] = [
                {
                    id: 1,
                    orderNumber: "ORD-2024-001",
                    customerName: "Nguyễn Văn A",
                    customerEmail: "nguyenvana@email.com",
                    status: "PENDING",
                    totalAmount: 28990000,
                    itemCount: 2,
                    createdAt: "2024-01-20T10:30:00Z",
                    shippingAddress: {
                        fullName: "Nguyễn Văn A",
                        phone: "0123456789",
                        address: "123 Đường ABC",
                        ward: "Phường 1",
                        district: "Quận 1",
                        province: "TP. Hồ Chí Minh"
                    }
                },
                {
                    id: 2,
                    orderNumber: "ORD-2024-002",
                    customerName: "Trần Thị B",
                    customerEmail: "tranthib@email.com",
                    status: "CONFIRMED",
                    totalAmount: 52990000,
                    itemCount: 1,
                    createdAt: "2024-01-19T14:15:00Z",
                    shippingAddress: {
                        fullName: "Trần Thị B",
                        phone: "0987654321",
                        address: "456 Đường XYZ",
                        ward: "Phường 2",
                        district: "Quận 2",
                        province: "TP. Hồ Chí Minh"
                    }
                },
                {
                    id: 3,
                    orderNumber: "ORD-2024-003",
                    customerName: "Lê Văn C",
                    customerEmail: "levanc@email.com",
                    status: "DELIVERED",
                    totalAmount: 15990000,
                    itemCount: 3,
                    createdAt: "2024-01-18T09:45:00Z",
                    shippingAddress: {
                        fullName: "Lê Văn C",
                        phone: "0369852147",
                        address: "789 Đường DEF",
                        ward: "Phường 3",
                        district: "Quận 3",
                        province: "TP. Hồ Chí Minh"
                    }
                }
            ];
            
            setOrders(mockOrders);
            setTotalPages(3); // Mock pagination
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
        try {
            // Replace with actual API call
            console.log('Updating order status:', orderId, newStatus);
            
            // Update local state
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus }
                    : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
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
            case 'PENDING':
                return <Clock className="w-4 h-4" />;
            case 'CONFIRMED':
                return <CheckCircle className="w-4 h-4" />;
            case 'SHIPPING':
                return <Truck className="w-4 h-4" />;
            case 'DELIVERED':
                return <CheckCircle className="w-4 h-4" />;
            case 'CANCELLED':
                return <X className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'SHIPPING':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'SHIPPING':
                return 'Đang giao';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Quản lý đơn hàng</CardTitle>
                    <CardDescription>
                        Theo dõi và quản lý tất cả đơn hàng của khách hàng
                    </CardDescription>
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
                                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
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
            )}

            {/* Orders Table */}
            {!isLoading && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Đơn hàng</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Ngày đặt</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.orderNumber}</div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.itemCount} sản phẩm
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.customerName}</div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.customerEmail}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === 'DELIVERED' ? 'default' :
                                                order.status === 'CANCELLED' ? 'destructive' :
                                                order.status === 'SHIPPING' ? 'secondary' :
                                                'outline'
                                            }
                                            className="flex items-center gap-1 w-fit"
                                        >
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(order.totalAmount)}
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
                                                    <Button variant="ghost" size="sm">
                                                        <Package className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {order.status === 'PENDING' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Xác nhận đơn hàng
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status === 'CONFIRMED' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')}
                                                        >
                                                            <Truck className="w-4 h-4 mr-2" />
                                                            Bắt đầu giao hàng
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status === 'SHIPPING' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Đánh dấu đã giao
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                                            className="text-destructive"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Hủy đơn hàng
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Hiển thị{' '}
                            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> -{' '}
                            <span className="font-medium">{Math.min(currentPage * 10, orders.length)}</span>{' '}
                            trong <span className="font-medium">{orders.length}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={currentPage === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminOrdersPage;
