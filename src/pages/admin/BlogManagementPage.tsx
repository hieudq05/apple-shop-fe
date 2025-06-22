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
    UserIcon
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    author: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    commentCount: number;
}

const BlogManagementPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        postId: number | null;
        postTitle: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        postId: null,
        postTitle: '',
        isDeleting: false
    });

    const categories = [
        { id: 1, name: 'Tin tức' },
        { id: 2, name: 'Đánh giá sản phẩm' },
        { id: 3, name: 'Hướng dẫn' },
        { id: 4, name: 'Khuyến mãi' },
        { id: 5, name: 'Công nghệ' }
    ];

    useEffect(() => {
        fetchPosts();
    }, [currentPage, searchTerm, selectedStatus, selectedCategory]);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockPosts: BlogPost[] = [
                {
                    id: 1,
                    title: 'iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng',
                    slug: 'iphone-15-pro-danh-gia-chi-tiet',
                    excerpt: 'Sau 1 tháng trải nghiệm iPhone 15 Pro, đây là những ưu nhược điểm mà chúng tôi nhận thấy...',
                    content: 'Nội dung bài viết đầy đủ...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png',
                    author: { id: 1, name: 'Nguyễn Văn A' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['iPhone', 'Apple', 'Đánh giá'],
                    status: 'PUBLISHED',
                    publishedAt: '2024-01-20T10:30:00Z',
                    createdAt: '2024-01-19T15:20:00Z',
                    updatedAt: '2024-01-20T10:30:00Z',
                    viewCount: 1250,
                    commentCount: 23
                },
                {
                    id: 2,
                    title: 'MacBook Pro M3: Hiệu năng vượt trội cho dân sáng tạo',
                    slug: 'macbook-pro-m3-hieu-nang-vuot-troi',
                    excerpt: 'MacBook Pro M3 mang đến hiệu năng đột phá với chip M3 mới nhất của Apple...',
                    content: 'Nội dung bài viết đầy đủ...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/10/31/macbook-pro-14-m3-pro-space-gray.png',
                    author: { id: 2, name: 'Trần Thị B' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['MacBook', 'M3', 'Laptop'],
                    status: 'PUBLISHED',
                    publishedAt: '2024-01-18T14:15:00Z',
                    createdAt: '2024-01-17T09:30:00Z',
                    updatedAt: '2024-01-18T14:15:00Z',
                    viewCount: 890,
                    commentCount: 15
                },
                {
                    id: 3,
                    title: 'Hướng dẫn sử dụng Apple Watch Series 9 hiệu quả',
                    slug: 'huong-dan-su-dung-apple-watch-series-9',
                    excerpt: 'Tận dụng tối đa các tính năng của Apple Watch Series 9 với hướng dẫn chi tiết...',
                    content: 'Nội dung bài viết đầy đủ...',
                    author: { id: 1, name: 'Nguyễn Văn A' },
                    category: { id: 3, name: 'Hướng dẫn' },
                    tags: ['Apple Watch', 'Hướng dẫn'],
                    status: 'DRAFT',
                    createdAt: '2024-01-21T11:45:00Z',
                    updatedAt: '2024-01-21T16:20:00Z',
                    viewCount: 0,
                    commentCount: 0
                },
                {
                    id: 4,
                    title: 'Khuyến mãi lớn: Giảm giá 20% tất cả sản phẩm iPad',
                    slug: 'khuyen-mai-lon-giam-gia-20-ipad',
                    excerpt: 'Chương trình khuyến mãi đặc biệt dành cho dòng sản phẩm iPad trong tháng 2...',
                    content: 'Nội dung bài viết đầy đủ...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2024/05/08/ipad-pro-11-m4-space-gray.png',
                    author: { id: 3, name: 'Lê Văn C' },
                    category: { id: 4, name: 'Khuyến mãi' },
                    tags: ['iPad', 'Khuyến mãi', 'Giảm giá'],
                    status: 'ARCHIVED',
                    publishedAt: '2024-01-15T08:00:00Z',
                    createdAt: '2024-01-14T16:30:00Z',
                    updatedAt: '2024-01-22T10:00:00Z',
                    viewCount: 2100,
                    commentCount: 45
                }
            ];
            
            setPosts(mockPosts);
            setTotalPages(3); // Mock pagination
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteDialog = (postId: number, postTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            postId,
            postTitle,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            postId: null,
            postTitle: '',
            isDeleting: false
        });
    };

    const handleDeletePost = async () => {
        if (!deleteDialog.postId) return;

        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

        try {
            // Replace with actual API call
            console.log('Deleting post:', deleteDialog.postId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPosts(prev => prev.filter(post => post.id !== deleteDialog.postId));
            closeDeleteDialog();
        } catch (error) {
            console.error('Error deleting post:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const togglePostStatus = async (postId: number, newStatus: BlogPost['status']) => {
        try {
            // Replace with actual API call
            console.log('Updating post status:', postId, newStatus);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setPosts(prev => prev.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        status: newStatus,
                        publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : post.publishedAt,
                        updatedAt: new Date().toISOString()
                    }
                    : post
            ));
        } catch (error) {
            console.error('Error updating post status:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: BlogPost['status']) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: BlogPost['status']) => {
        switch (status) {
            case 'PUBLISHED':
                return 'Đã xuất bản';
            case 'DRAFT':
                return 'Bản nháp';
            case 'ARCHIVED':
                return 'Đã lưu trữ';
            default:
                return status;
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !selectedStatus || post.status === selectedStatus;
        const matchesCategory = !selectedCategory || post.category.id.toString() === selectedCategory;
        
        return matchesSearch && matchesStatus && matchesCategory;
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
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
                <Link
                    to="/admin/blog/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Viết bài mới
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
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
                    <option value="ARCHIVED">Đã lưu trữ</option>
                </select>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id.toString()}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Posts Table */}
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
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thống kê
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start space-x-4">
                                            {post.featuredImage ? (
                                                <img
                                                    src={post.featuredImage}
                                                    alt={post.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {post.tags.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {post.tags.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">{post.author.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {post.category.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={post.status}
                                            onChange={(e) => togglePostStatus(post.id, e.target.value as BlogPost['status'])}
                                            className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 ${getStatusColor(post.status)}`}
                                        >
                                            <option value="DRAFT">Bản nháp</option>
                                            <option value="PUBLISHED">Đã xuất bản</option>
                                            <option value="ARCHIVED">Đã lưu trữ</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div>{post.viewCount} lượt xem</div>
                                            <div>{post.commentCount} bình luận</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            <div>
                                                {post.status === 'PUBLISHED' && post.publishedAt ? (
                                                    <div>Xuất bản: {formatDate(post.publishedAt)}</div>
                                                ) : (
                                                    <div>Tạo: {formatDate(post.createdAt)}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/admin/blog/${post.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/admin/blog/${post.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => openDeleteDialog(post.id, post.title)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
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
                                <span className="font-medium">{Math.min(currentPage * 10, filteredPosts.length)}</span> trong{' '}
                                <span className="font-medium">{filteredPosts.length}</span> kết quả
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDeletePost}
                title="Xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${deleteDialog.postTitle}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                isLoading={deleteDialog.isDeleting}
            />
        </div>
    );
};

export default BlogManagementPage;
