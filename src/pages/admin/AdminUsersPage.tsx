import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UserIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    LockClosedIcon,
    LockOpenIcon
} from "@heroicons/react/24/outline";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roles: Array<{ authority: string }>;
    enabled: boolean;
    createdAt: string;
    lastLoginAt?: string;
    orderCount: number;
    totalSpent: number;
}

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, selectedRole, selectedStatus]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockUsers: User[] = [
                {
                    id: 1,
                    firstName: "Nguyễn",
                    lastName: "Văn A",
                    email: "nguyenvana@email.com",
                    phone: "0123456789",
                    roles: [{ authority: "ROLE_USER" }],
                    enabled: true,
                    createdAt: "2024-01-15T10:30:00Z",
                    lastLoginAt: "2024-01-20T14:45:00Z",
                    orderCount: 5,
                    totalSpent: 45000000
                },
                {
                    id: 2,
                    firstName: "Trần",
                    lastName: "Thị B",
                    email: "tranthib@email.com",
                    phone: "0987654321",
                    roles: [{ authority: "ROLE_USER" }],
                    enabled: true,
                    createdAt: "2024-01-10T09:15:00Z",
                    lastLoginAt: "2024-01-19T16:20:00Z",
                    orderCount: 2,
                    totalSpent: 15000000
                },
                {
                    id: 3,
                    firstName: "Admin",
                    lastName: "System",
                    email: "admin@appleshop.com",
                    phone: "0369852147",
                    roles: [{ authority: "ROLE_ADMIN" }],
                    enabled: true,
                    createdAt: "2024-01-01T00:00:00Z",
                    lastLoginAt: "2024-01-20T09:00:00Z",
                    orderCount: 0,
                    totalSpent: 0
                },
                {
                    id: 4,
                    firstName: "Lê",
                    lastName: "Văn C",
                    email: "levanc@email.com",
                    phone: "0147258369",
                    roles: [{ authority: "ROLE_USER" }],
                    enabled: false,
                    createdAt: "2024-01-12T15:30:00Z",
                    orderCount: 1,
                    totalSpent: 8000000
                }
            ];
            
            setUsers(mockUsers);
            setTotalPages(3); // Mock pagination
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            // Replace with actual API call
            console.log('Toggling user status:', userId, !currentStatus);
            
            // Update local state
            setUsers(users.map(user => 
                user.id === userId 
                    ? { ...user, enabled: !currentStatus }
                    : user
            ));
        } catch (error) {
            console.error('Error toggling user status:', error);
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
            day: '2-digit'
        });
    };

    const getRoleIcon = (roles: User['roles']) => {
        const isAdmin = roles.some(role => role.authority === 'ROLE_ADMIN');
        return isAdmin ? (
            <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
        ) : (
            <UserIcon className="w-4 h-4 text-blue-600" />
        );
    };

    const getRoleText = (roles: User['roles']) => {
        const isAdmin = roles.some(role => role.authority === 'ROLE_ADMIN');
        return isAdmin ? 'Quản trị viên' : 'Người dùng';
    };

    const getRoleColor = (roles: User['roles']) => {
        const isAdmin = roles.some(role => role.authority === 'ROLE_ADMIN');
        return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý người dùng</h1>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ROLE_USER">Người dùng</option>
                            <option value="ROLE_ADMIN">Quản trị viên</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã khóa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng chi tiêu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tham gia
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {user.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roles)}`}>
                                            {getRoleIcon(user.roles)}
                                            <span className="ml-1">{getRoleText(user.roles)}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.enabled 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.enabled ? (
                                                <>
                                                    <LockOpenIcon className="w-3 h-3 mr-1" />
                                                    Hoạt động
                                                </>
                                            ) : (
                                                <>
                                                    <LockClosedIcon className="w-3 h-3 mr-1" />
                                                    Đã khóa
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.orderCount} đơn hàng
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(user.totalSpent)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>
                                            {user.roles.some(role => role.authority !== 'ROLE_ADMIN') && (
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                                                    className={`text-xs px-2 py-1 border rounded hover:bg-opacity-10 ${
                                                        user.enabled
                                                            ? 'text-red-600 border-red-600 hover:bg-red-50'
                                                            : 'text-green-600 border-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {user.enabled ? 'Khóa' : 'Mở khóa'}
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
                                <span className="font-medium">{Math.min(currentPage * 10, users.length)}</span> trong{' '}
                                <span className="font-medium">{users.length}</span> kết quả
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

export default AdminUsersPage;
