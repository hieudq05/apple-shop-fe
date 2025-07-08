import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import blogService, { type Blog, type BlogParams } from '../../services/blogService';
import { useDebounce } from '../../hooks/useDebounce';

const BlogManagementPage: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        blogId: number | null;
        blogTitle: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        blogId: null,
        blogTitle: '',
        isDeleting: false
    });

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(0);
    }, [debouncedSearchTerm, selectedStatus]);

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, debouncedSearchTerm, selectedStatus]);

    const fetchBlogs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params: BlogParams = {
                page: currentPage,
                size: pageSize,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (selectedStatus === 'PUBLISHED') params.isPublished = true;
            if (selectedStatus === 'DRAFT') params.isPublished = false;

            const response = await blogService.getBlogs(params);
            
            if (response.success) {
                setBlogs(response.data);
                setTotalPages(response.meta.totalPage);
                setTotalElements(response.meta.totalElements);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Không thể tải danh sách blog. Vui lòng thử lại.');
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteDialog = (blogId: number, blogTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            blogId,
            blogTitle,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            blogId: null,
            blogTitle: '',
            isDeleting: false
        });
    };

    const handleDeleteBlog = async () => {
        if (!deleteDialog.blogId) return;

        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await blogService.deleteBlog(deleteDialog.blogId);
            
            if (response.success) {
                // Refresh the blogs list
                await fetchBlogs();
                closeDeleteDialog();
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            setError('Không thể xóa bài viết. Vui lòng thử lại.');
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const toggleBlogStatus = async (blogId: number, currentPublishStatus: boolean) => {
        try {
            const response = await blogService.toggleBlogStatus(blogId, !currentPublishStatus);
            
            if (response.success) {
                // Refresh the blogs list
                await fetchBlogs();
            }
        } catch (error) {
            console.error('Error toggling blog status:', error);
            setError('Không thể thay đổi trạng thái bài viết. Vui lòng thử lại.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeVariant = (isPublished: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isPublished ? "default" : "secondary";
    };

    const getStatusText = (isPublished: boolean) => {
        return isPublished ? 'Đã xuất bản' : 'Bản nháp';
    };

    const getAuthorName = (author: { firstName: string; lastName: string }) => {
        return `${author.firstName} ${author.lastName}`.trim();
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !selectedStatus || 
            (selectedStatus === 'PUBLISHED' && blog.isPublished) ||
            (selectedStatus === 'DRAFT' && !blog.isPublished);
        
        return matchesSearch && matchesStatus;
    });

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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
                    <p className="text-muted-foreground">Quản lý các bài viết và nội dung blog</p>
                </div>
                <Button asChild>
                    <Link to="/admin/blog/create" className="flex items-center space-x-2">
                        <PlusIcon className="w-4 h-4" />
                        <span>Viết bài mới</span>
                    </Link>
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                    <option value="DRAFT">Bản nháp</option>
                </select>
            </div>

            {/* Blogs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bài viết
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tác giả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBlogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-gray-50 h-16">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                <img src={blog.thumbnail} className="w-full h-full object-cover" alt={blog.title} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ID: {blog.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={blog.author.image} alt={getAuthorName(blog.author)} />
                                                <AvatarFallback>
                                                    <UserIcon className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-gray-900">{getAuthorName(blog.author)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={getStatusBadgeVariant(blog.isPublished)} className="text-xs">
                                                {getStatusText(blog.isPublished)}
                                            </Badge>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={blog.isPublished}
                                                    onChange={() => toggleBlogStatus(blog.id, blog.isPublished)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>{formatDate(blog.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to={`/admin/blog/${blog.id}`}>
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to={`/admin/blog/${blog.id}/edit`}>
                                                    <PencilIcon className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(blog.id, blog.title)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {blogs.length > 0 && (
                    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
                            <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong{' '}
                            <span className="font-medium">{totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="w-8 h-8"
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                Sau
                                <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteBlog}
                title="Xóa bài viết"
                description={`Bạn có chắc chắn muốn xóa bài viết "${deleteDialog.blogTitle}"? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

export default BlogManagementPage;
