import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UserIcon,
    LockClosedIcon,
    LockOpenIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import userService, { type User, type UserParams } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(0);
    }, [debouncedSearchTerm, selectedRole, selectedStatus]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearchTerm, selectedRole, selectedStatus]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params: UserParams = {
                page: currentPage,
                size: pageSize,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (selectedRole) params.role = selectedRole;
            if (selectedStatus) params.status = selectedStatus;

            const response = await userService.getUsers(params);
            
            if (response.success) {
                setUsers(response.data);
                setTotalPages(response.meta.totalPage);
                setTotalElements(response.meta.totalElements);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            setToggleLoading(userId);
            const response = await userService.toggleUserStatus(userId, !currentStatus);
            
            if (response.success) {
                // Update local state
                setUsers(users.map(user => 
                    user.id === userId 
                        ? { ...user, enabled: !currentStatus }
                        : user
                ));
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            setError('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại.');
        } finally {
            setToggleLoading(null);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Since API doesn't return role info, we'll assume ROLE_USER for now
    // You might need to add role info to the API response or fetch it separately
    const getRoleIcon = (name: string) => {
        switch (name) {
            case 'ROLE_USER':
                return <UserIcon className="w-4 h-4 mr-1" />;
            case 'ROLE_ADMIN':
                return <LockOpenIcon className="w-4 h-4 mr-1" />;
            case 'ROLE_STAFF':
                return <LockClosedIcon className="w-4 h-4 mr-1" />;
            default:
                return <UserIcon className="w-4 h-4 mr-1" />;
        }
    };

    const getRoleText = (name: string) => {
        switch (name) {
            case 'ROLE_USER':
                return 'Người dùng';
            case 'ROLE_ADMIN':
                return 'Quản trị viên';
            case 'ROLE_STAFF':
                return 'Nhân viên';
            default:
                return 'Người dùng';
        }
    };

    const getRoleColor = (name: string) => {
        switch (name) {
            case 'ROLE_USER':
                return 'bg-blue-100 text-blue-800';
            case 'ROLE_ADMIN':
                return 'bg-red-100 text-red-800';
            case 'ROLE_STAFF':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getFullName = (user: User) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || '--';
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

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

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
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số điện thoại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày sinh
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
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {user.image ? (
                                                    <img 
                                                        src={user.image} 
                                                        alt={getFullName(user)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <Link
                                                to={`/admin/users/${user.id}`}
                                                className="text-sm font-medium text-gray-900 hover:underline">
                                                    {getFullName(user)}
                                                </Link>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
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
                                        {user.phone || '--'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.birth)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                                                disabled={toggleLoading === user.id}
                                                variant={"secondary"}
                                                className={`text-xs border h-7 disabled:opacity-50 bg-white disabled:cursor-not-allowed ${
                                                    user.enabled
                                                        ? 'text-red-600 hover:text-white hover:border-red-600 border-red-200 border-2 hover:bg-red-600'
                                                        : 'text-green-600 border-green-600 hover:bg-green-50'
                                                }`}
                                            >
                                                {toggleLoading === user.id ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        ...
                                                    </span>
                                                ) : (
                                                    user.enabled ? 'Khóa' : 'Mở khóa'
                                                )}
                                            </Button>
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="p-1"
                                                title="Xem chi tiết"
                                            >
                                                <InformationCircleIcon className="size-5" />
                                            </Link>
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
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                        {/* Pagination */}
                        {users.length > 0 && (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong{' '}
                                <span className="font-medium">{totalElements}</span> kết quả
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentPage(Math.max(0, currentPage - 1));
                                            fetchUsers();
                                        }}
                                        disabled={currentPage === 0}
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
                                                    className={(currentPage === pageNum - 1 ? 'underline' : '') + " hover:underline bg-white hover:bg-white shadow-none text-black"}
                                                    size="sm"
                                                    onClick={() => {
                                                        setCurrentPage(pageNum - 1)
                                                        fetchUsers();
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
                                            fetchUsers();
                                        }}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Sau
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
