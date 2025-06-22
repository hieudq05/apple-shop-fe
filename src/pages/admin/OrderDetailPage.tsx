import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    MapPinIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

interface OrderDetail {
    id: number;
    orderNumber: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    paymentMethod: string;
    note?: string;
    items: Array<{
        id: number;
        product: {
            id: number;
            name: string;
            image: string;
        };
        color: {
            name: string;
            hex: string;
        };
        quantity: number;
        price: number;
        totalPrice: number;
    }>;
    subtotal: number;
    shippingFee: number;
    tax: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        note?: string;
    }>;
}

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockOrder: OrderDetail = {
                id: parseInt(id || '1'),
                orderNumber: `ORD-2024-${id?.padStart(3, '0')}`,
                status: 'CONFIRMED',
                customer: {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    email: 'nguyenvana@email.com',
                    phone: '0123456789'
                },
                shippingAddress: {
                    fullName: 'Nguyễn Văn A',
                    phone: '0123456789',
                    address: '123 Đường ABC',
                    ward: 'Phường 1',
                    district: 'Quận 1',
                    province: 'TP. Hồ Chí Minh'
                },
                paymentMethod: 'COD',
                note: 'Giao hàng giờ hành chính',
                items: [
                    {
                        id: 1,
                        product: {
                            id: 1,
                            name: 'iPhone 15 Pro',
                            image: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png'
                        },
                        color: {
                            name: 'Natural Titanium',
                            hex: '#8E8E93'
                        },
                        quantity: 1,
                        price: 28990000,
                        totalPrice: 28990000
                    },
                    {
                        id: 2,
                        product: {
                            id: 2,
                            name: 'AirPods Pro',
                            image: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/airpods-pro.png'
                        },
                        color: {
                            name: 'White',
                            hex: '#FFFFFF'
                        },
                        quantity: 1,
                        price: 6990000,
                        totalPrice: 6990000
                    }
                ],
                subtotal: 35980000,
                shippingFee: 0,
                tax: 3598000,
                totalAmount: 39578000,
                createdAt: '2024-01-20T10:30:00Z',
                updatedAt: '2024-01-20T14:45:00Z',
                statusHistory: [
                    {
                        status: 'PENDING',
                        timestamp: '2024-01-20T10:30:00Z',
                        note: 'Đơn hàng được tạo'
                    },
                    {
                        status: 'CONFIRMED',
                        timestamp: '2024-01-20T14:45:00Z',
                        note: 'Đơn hàng đã được xác nhận'
                    }
                ]
            };
            
            setOrder(mockOrder);
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus: OrderDetail['status']) => {
        if (!order) return;

        setIsUpdating(true);
        try {
            // Replace with actual API call
            console.log('Updating order status:', order.id, newStatus);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOrder(prev => prev ? {
                ...prev,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...prev.statusHistory,
                    {
                        status: newStatus,
                        timestamp: new Date().toISOString(),
                        note: `Trạng thái được cập nhật thành ${getStatusText(newStatus)}`
                    }
                ]
            } : null);
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setIsUpdating(false);
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: OrderDetail['status']) => {
        switch (status) {
            case 'PENDING':
                return <ClockIcon className="w-5 h-5" />;
            case 'CONFIRMED':
                return <CheckCircleIcon className="w-5 h-5" />;
            case 'SHIPPING':
                return <TruckIcon className="w-5 h-5" />;
            case 'DELIVERED':
                return <CheckCircleIcon className="w-5 h-5" />;
            case 'CANCELLED':
                return <XCircleIcon className="w-5 h-5" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: OrderDetail['status']) => {
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

    const getStatusText = (status: OrderDetail['status']) => {
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

    const getNextStatus = (currentStatus: OrderDetail['status']) => {
        switch (currentStatus) {
            case 'PENDING':
                return 'CONFIRMED';
            case 'CONFIRMED':
                return 'SHIPPING';
            case 'SHIPPING':
                return 'DELIVERED';
            default:
                return null;
        }
    };

    const getNextStatusText = (currentStatus: OrderDetail['status']) => {
        const nextStatus = getNextStatus(currentStatus);
        return nextStatus ? getStatusText(nextStatus) : null;
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-gray-600 mb-4">Đơn hàng có thể đã bị xóa hoặc không tồn tại.</p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng {order.orderNumber}</h1>
                        <p className="text-gray-600">Tạo lúc {formatDate(order.createdAt)}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{getStatusText(order.status)}</span>
                    </span>
                    
                    {getNextStatus(order.status) && (
                        <button
                            onClick={() => updateOrderStatus(getNextStatus(order.status)!)}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUpdating ? 'Đang cập nhật...' : `Chuyển thành ${getNextStatusText(order.status)}`}
                        </button>
                    )}
                    
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <button
                            onClick={() => updateOrderStatus('CANCELLED')}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Hủy đơn
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
                        
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div 
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: item.color.hex }}
                                            ></div>
                                            <span className="text-sm text-gray-600">{item.color.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatCurrency(item.price)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(item.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Địa chỉ giao hàng</p>
                                        <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
                                        <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                                <CreditCardIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">Phương thức thanh toán</p>
                                    <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                                </div>
                            </div>
                            
                            {order.note && (
                                <div className="mt-4">
                                    <p className="font-medium text-gray-900">Ghi chú</p>
                                    <p className="text-sm text-gray-600 mt-1">{order.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary & Status History */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="text-gray-900">
                                    {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Thuế VAT</span>
                                <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Tổng cộng</span>
                                    <span className="font-semibold text-gray-900 text-lg">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử trạng thái</h2>
                        
                        <div className="space-y-4">
                            {order.statusHistory.map((history, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(history.status as OrderDetail['status'])}`}>
                                        {getStatusIcon(history.status as OrderDetail['status'])}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {getStatusText(history.status as OrderDetail['status'])}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(history.timestamp)}
                                        </p>
                                        {history.note && (
                                            <p className="text-sm text-gray-500 mt-1">{history.note}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
