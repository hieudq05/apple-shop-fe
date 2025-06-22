import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    TruckIcon
} from "@heroicons/react/24/outline";

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
                return <ClockIcon className="w-4 h-4" />;
            case 'CONFIRMED':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'SHIPPING':
                return <TruckIcon className="w-4 h-4" />;
            case 'DELIVERED':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'CANCELLED':
                return <XCircleIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
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
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý đơn hàng</h1>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPING">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày đặt
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.itemCount} sản phẩm
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customerName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.customerEmail}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="ml-1">{getStatusText(order.status)}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                                    className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-50"
                                                >
                                                    Xác nhận
                                                </button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')}
                                                    className="text-purple-600 hover:text-purple-900 text-xs px-2 py-1 border border-purple-600 rounded hover:bg-purple-50"
                                                >
                                                    Giao hàng
                                                </button>
                                            )}
                                            {order.status === 'SHIPPING' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                                    className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-50"
                                                >
                                                    Hoàn thành
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến{' '}
                                <span className="font-medium">{Math.min(currentPage * 10, orders.length)}</span> trong{' '}
                                <span className="font-medium">{orders.length}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            currentPage === i + 1
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
