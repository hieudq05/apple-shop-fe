import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import userService, { type User, type UserParams } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { UserDataTable } from '../../components/user-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

    const handleViewUser = (userId: number) => {
        // Navigate to user detail page
        window.open(`/admin/users/${userId}`, '_blank');
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-muted-foreground">Quản lý thông tin và trạng thái người dùng trong hệ thống</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search
                        className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="relative">
                    <Select value={selectedRole || undefined}
                            onValueChange={(value) => setSelectedRole(value || '')}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Tất cả vai trò"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vai trò</SelectItem>
                            <SelectItem value="1">Quản trị viên</SelectItem>
                            <SelectItem value="2">Người dùng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative">
                    <Select value={selectedStatus || undefined}
                            onValueChange={(value) => setSelectedStatus(value || '')}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Tất cả trạng thái"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="1">Đang hoạt động</SelectItem>
                            <SelectItem value="2">Đã khóa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Data Table */}
            <UserDataTable
                data={users}
                onToggleStatus={handleToggleUserStatus}
                onView={handleViewUser}
                toggleLoading={toggleLoading}
            />

            {/* Pagination */}
            {users.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Hiển thị{' '}
                        <span className="font-medium">{currentPage * totalElements + 1}</span> -{' '}
                        <span className="font-medium">{Math.min((currentPage + 1) * totalElements, totalElements)}</span>{' '}
                        trong <span className="font-medium">{totalElements}</span> kết quả
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCurrentPage(1);
                                fetchUsers();
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
                                fetchUsers();
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
                                            fetchUsers();
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
                                fetchUsers();
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
                                fetchUsers();
                            }}
                            disabled={currentPage === totalPages || totalPages <= 1}
                        >
                            <ChevronDoubleRightIcon className="w-4 h-4" />
                        </Button>
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
