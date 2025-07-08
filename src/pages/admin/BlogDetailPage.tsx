import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CalendarIcon,
    UserIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import blogService, { type Blog } from '../../services/blogService';

const BlogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlogDetail();
    }, [id]);

    const fetchBlogDetail = async () => {
        if (!id) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const response = await blogService.getBlogById(parseInt(id));
            
            if (response.success) {
                setBlog(response.data);
            } else {
                setError(response.msg || 'Không thể tải bài viết');
            }
        } catch (error) {
            console.error('Error fetching blog detail:', error);
            setError('Có lỗi xảy ra khi tải bài viết');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!id || !window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        
        try {
            const response = await blogService.deleteBlog(parseInt(id));
            if (response.success) {
                alert('Bài viết đã được xóa thành công!');
                navigate('/admin/blog');
            } else {
                alert(response.msg || 'Có lỗi xảy ra khi xóa bài viết!');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Có lỗi xảy ra khi xóa bài viết!');
        }
    };

    const handleTogglePublish = async () => {
        if (!id || !blog) return;
        
        try {
            const response = await blogService.toggleBlogStatus(parseInt(id), !blog.isPublished);
            if (response.success) {
                setBlog(response.data);
                alert(`Bài viết đã ${response.data.isPublished ? 'được xuất bản' : 'bị ẩn'} thành công!`);
            } else {
                alert(response.msg || 'Có lỗi xảy ra khi cập nhật trạng thái!');
            }
        } catch (error) {
            console.error('Error toggling publish status:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái!');
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

    const getStatusColor = (isPublished: boolean) => {
        return isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    const getStatusText = (isPublished: boolean) => {
        return isPublished ? 'Đã xuất bản' : 'Bản nháp';
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error || 'Không tìm thấy bài viết'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error || 'Bài viết có thể đã bị xóa hoặc không tồn tại.'}
                    </p>
                    <button
                        onClick={() => navigate('/admin/blog')}
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
                        onClick={() => navigate('/admin/blog')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{blog.title}</h1>
                        <p className="text-gray-600">ID: {blog.id}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(blog.isPublished)}`}>
                        {getStatusText(blog.isPublished)}
                    </span>
                    
                    <button
                        onClick={handleTogglePublish}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                            blog.isPublished 
                                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {blog.isPublished ? 'Ẩn bài viết' : 'Xuất bản'}
                    </button>
                    
                    <Link
                        to={`/admin/blog/${blog.id}/edit`}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                    </Link>
                    <button
                        onClick={handleDeletePost}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Xóa
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Thumbnail */}
                    {blog.thumbnail && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài viết</h2>
                        
                        <div className="prose max-w-none">
                            {blog.content ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {blog.content}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Bài viết chưa có nội dung.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Blog Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài viết</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Tác giả</p>
                                    <p className="font-medium text-gray-900">
                                        {blog.author.firstName} {blog.author.lastName}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Ngày tạo</p>
                                    <p className="font-medium text-gray-900">{formatDate(blog.createdAt)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Ngày cập nhật</p>
                                    <p className="font-medium text-gray-900">{formatDate(blog.updatedAt)}</p>
                                </div>
                            </div>
                            
                            {blog.publishedAt && (
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày xuất bản</p>
                                        <p className="font-medium text-gray-900">{formatDate(blog.publishedAt)}</p>
                                    </div>
                                </div>
                            )}
                            
                            {blog.status && (
                                <div className="flex items-center space-x-3">
                                    <TagIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Trạng thái</p>
                                        <p className="font-medium text-gray-900">{blog.status}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    {blog.author.image && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tác giả</h2>
                            
                            <div className="flex items-center space-x-3">
                                <img
                                    src={blog.author.image}
                                    alt={`${blog.author.firstName} ${blog.author.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {blog.author.firstName} {blog.author.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">ID: {blog.author.id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
