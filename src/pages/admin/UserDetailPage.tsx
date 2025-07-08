import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    LockClosedIcon,
    LockOpenIcon
} from '@heroicons/react/24/outline';
import userService, { type User } from '../../services/userService';
import { Button } from '@/components/ui/button';

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const fetchUserDetail = async () => {
        if (!id) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await userService.getUserById(parseInt(id));
            
            if (response.success) {
                setUser(response.data);
            } else {
                setError('Không thể tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error fetching user detail:', error);
            setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        if (!user) return;

        setIsUpdating(true);
        try {
            const response = await userService.toggleUserStatus(user.id, !user.enabled);
            
            if (response.success) {
                setUser(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
            } else {
                setError('Không thể thay đổi trạng thái người dùng');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            setError('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại.');
        } finally {
            setIsUpdating(false);
        }
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

    const formatBirthDate = (dateString: string | null) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getFullName = (user: User) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || '--';
    };

    const getRoleText = (roleName: string) => {
        switch (roleName) {
            case 'ROLE_USER':
                return 'Người dùng';
            case 'ROLE_ADMIN':
                return 'Quản trị viên';
            case 'ROLE_STAFF':
                return 'Nhân viên';
            default:
                return roleName;
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
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

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
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img 
                                    src={user.image} 
                                    alt={getFullName(user)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getFullName(user)}
                            </h1>
                            <p className="text-gray-600">ID: {user.id}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <Button
                        variant={"destructive"}
                        onClick={toggleUserStatus}
                        disabled={isUpdating}
                        className={`rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {isUpdating ? 'Đang cập nhật...' : (user.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* User Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-10">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Họ và tên</p>
                                        <p className="font-medium text-gray-900">{getFullName(user)}</p>
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
                                        <p className="font-medium text-gray-900">{user.phone || '--'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-10">
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
                                                {getRoleText(role.name)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600">Ngày tham gia</p>
                                    <p className="font-medium text-gray-900">{user.createdAt ? formatDate(user.createdAt) : '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Note */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                                Thông tin đơn hàng, địa chỉ và thống kê chi tiết sẽ được hiển thị khi có API tương ứng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái tài khoản</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.enabled ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Số vai trò</span>
                                <span className="text-lg font-bold text-gray-900">{user.roles.length}</span>
                            </div>
                            
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Thông tin thống kê chi tiết sẽ được bổ sung khi có API tương ứng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
