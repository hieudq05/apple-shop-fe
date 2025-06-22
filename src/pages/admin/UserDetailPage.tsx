import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    LockClosedIcon,
    LockOpenIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

interface UserDetail {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birth: string;
    roles: Array<{ authority: string }>;
    enabled: boolean;
    createdAt: string;
    lastLoginAt?: string;
    statistics: {
        totalOrders: number;
        totalSpent: number;
        averageOrderValue: number;
        completedOrders: number;
        cancelledOrders: number;
    };
    recentOrders: Array<{
        id: number;
        orderNumber: string;
        status: string;
        totalAmount: number;
        createdAt: string;
    }>;
    addresses: Array<{
        id: number;
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
        isDefault: boolean;
    }>;
}

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const fetchUserDetail = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockUser: UserDetail = {
                id: parseInt(id || '1'),
                firstName: 'Nguyễn',
                lastName: 'Văn A',
                email: 'nguyenvana@email.com',
                phone: '0123456789',
                birth: '1990-05-15',
                roles: [{ authority: 'ROLE_USER' }],
                enabled: true,
                createdAt: '2024-01-15T10:30:00Z',
                lastLoginAt: '2024-01-20T14:45:00Z',
                statistics: {
                    totalOrders: 12,
                    totalSpent: 45000000,
                    averageOrderValue: 3750000,
                    completedOrders: 10,
                    cancelledOrders: 2
                },
                recentOrders: [
                    {
                        id: 1,
                        orderNumber: 'ORD-2024-001',
                        status: 'DELIVERED',
                        totalAmount: 28990000,
                        createdAt: '2024-01-20T10:30:00Z'
                    },
                    {
                        id: 2,
                        orderNumber: 'ORD-2024-002',
                        status: 'SHIPPING',
                        totalAmount: 15990000,
                        createdAt: '2024-01-18T09:15:00Z'
                    }
                ],
                addresses: [
                    {
                        id: 1,
                        fullName: 'Nguyễn Văn A',
                        phone: '0123456789',
                        address: '123 Đường ABC',
                        ward: 'Phường 1',
                        district: 'Quận 1',
                        province: 'TP. Hồ Chí Minh',
                        isDefault: true
                    }
                ]
            };
            
            setUser(mockUser);
        } catch (error) {
            console.error('Error fetching user detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        if (!user) return;

        setIsUpdating(true);
        try {
            // Replace with actual API call
            console.log('Toggling user status:', user.id, !user.enabled);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setUser(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
        } catch (error) {
            console.error('Error toggling user status:', error);
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

    const formatBirthDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipping':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'Đã giao';
            case 'shipping':
                return 'Đang giao';
            case 'pending':
                return 'Chờ xử lý';
            case 'cancelled':
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy người dùng</h2>
                    <p className="text-gray-600 mb-4">Người dùng có thể đã bị xóa hoặc không tồn tại.</p>
                    <button
                        onClick={() => navigate('/admin/users')}
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
                        onClick={() => navigate('/admin/users')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-600">ID: {user.id}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {user.enabled ? (
                            <>
                                <LockOpenIcon className="w-4 h-4 mr-1" />
                                Hoạt động
                            </>
                        ) : (
                            <>
                                <LockClosedIcon className="w-4 h-4 mr-1" />
                                Đã khóa
                            </>
                        )}
                    </span>
                    
                    <button
                        onClick={toggleUserStatus}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {isUpdating ? 'Đang cập nhật...' : (user.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Họ và tên</p>
                                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Số điện thoại</p>
                                        <p className="font-medium text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày sinh</p>
                                        <p className="font-medium text-gray-900">{formatBirthDate(user.birth)}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600">Vai trò</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {user.roles.map((role, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {role.authority === 'ROLE_USER' ? 'Người dùng' : 
                                                 role.authority === 'ROLE_ADMIN' ? 'Quản trị viên' : 
                                                 role.authority === 'ROLE_STAFF' ? 'Nhân viên' : role.authority}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600">Ngày tham gia</p>
                                    <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                                </div>
                                
                                {user.lastLoginAt && (
                                    <div>
                                        <p className="text-sm text-gray-600">Đăng nhập lần cuối</p>
                                        <p className="font-medium text-gray-900">{formatDate(user.lastLoginAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h2>
                        
                        {user.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {user.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                            <p className="font-semibold text-gray-900 mt-1">
                                                {formatCurrency(order.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
                        )}
                    </div>

                    {/* Addresses */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ</h2>
                        
                        {user.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {user.addresses.map((address) => (
                                    <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{address.fullName}</p>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                        <p className="text-sm text-gray-600">
                                            {address.address}, {address.ward}, {address.district}, {address.province}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Chưa có địa chỉ nào</p>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê mua hàng</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Tổng đơn hàng</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{user.statistics.totalOrders}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Tổng chi tiêu</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{formatCurrency(user.statistics.totalSpent)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Giá trị TB/đơn</span>
                                </div>
                                <span className="text-lg font-bold text-purple-600">{formatCurrency(user.statistics.averageOrderValue)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{user.statistics.completedOrders}</p>
                                    <p className="text-xs text-gray-600">Hoàn thành</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{user.statistics.cancelledOrders}</p>
                                    <p className="text-xs text-gray-600">Đã hủy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
