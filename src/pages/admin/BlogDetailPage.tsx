import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface BlogDetail {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    author: {
        id: number;
        name: string;
        email: string;
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
    comments: Array<{
        id: number;
        author: string;
        email: string;
        content: string;
        createdAt: string;
        status: 'APPROVED' | 'PENDING' | 'REJECTED';
    }>;
}

const BlogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBlogDetail();
    }, [id]);

    const fetchBlogDetail = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockPost: BlogDetail = {
                id: parseInt(id || '1'),
                title: 'iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng',
                slug: 'iphone-15-pro-danh-gia-chi-tiet',
                excerpt: 'Sau 1 tháng trải nghiệm iPhone 15 Pro, đây là những ưu nhược điểm mà chúng tôi nhận thấy...',
                content: `# iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng

## Thiết kế và chất lượng xây dựng

iPhone 15 Pro mang đến một sự thay đổi đáng kể về thiết kế với việc sử dụng khung titan cấp hàng không vũ trụ. Điều này không chỉ làm cho máy nhẹ hơn mà còn tăng độ bền vượt trội.

### Những điểm nổi bật:
- **Khung titan**: Nhẹ hơn 19g so với iPhone 14 Pro
- **Action Button**: Thay thế cho switch im lặng truyền thống
- **USB-C**: Cuối cùng Apple cũng chuyển sang chuẩn kết nối phổ biến

## Hiệu năng

Chip A17 Pro được sản xuất trên tiến trình 3nm mang đến hiệu năng vượt trội:

- **CPU**: Nhanh hơn 10% so với A16 Bionic
- **GPU**: Nhanh hơn 20%, hỗ trợ ray tracing
- **Neural Engine**: Xử lý AI nhanh hơn đáng kể

## Camera

Hệ thống camera của iPhone 15 Pro đã được nâng cấp đáng kể:

### Camera chính 48MP
- Chụp ảnh chi tiết, màu sắc chính xác
- Chế độ Portrait được cải thiện
- Video 4K ProRes

### Camera Telephoto
- Zoom quang học 3x
- Chất lượng zoom tốt hơn nhiều so với thế hệ trước

## Kết luận

iPhone 15 Pro là một bước tiến đáng kể của Apple với nhiều cải tiến về thiết kế, hiệu năng và camera. Tuy nhiên, giá thành vẫn là một rào cản lớn đối với nhiều người dùng.

**Điểm số: 9/10**`,
                featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png',
                author: {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    email: 'nguyenvana@email.com'
                },
                category: {
                    id: 2,
                    name: 'Đánh giá sản phẩm'
                },
                tags: ['iPhone', 'Apple', 'Đánh giá', 'Smartphone'],
                status: 'PUBLISHED',
                publishedAt: '2024-01-20T10:30:00Z',
                createdAt: '2024-01-19T15:20:00Z',
                updatedAt: '2024-01-20T10:30:00Z',
                viewCount: 1250,
                commentCount: 23,
                comments: [
                    {
                        id: 1,
                        author: 'Trần Văn B',
                        email: 'tranvanb@email.com',
                        content: 'Bài viết rất chi tiết và hữu ích. Cảm ơn tác giả!',
                        createdAt: '2024-01-20T14:30:00Z',
                        status: 'APPROVED'
                    },
                    {
                        id: 2,
                        author: 'Lê Thị C',
                        email: 'lethic@email.com',
                        content: 'Mình đang cân nhắc mua iPhone 15 Pro, bài viết này giúp mình quyết định được.',
                        createdAt: '2024-01-20T16:45:00Z',
                        status: 'APPROVED'
                    },
                    {
                        id: 3,
                        author: 'Anonymous',
                        email: 'spam@email.com',
                        content: 'Spam content here...',
                        createdAt: '2024-01-21T08:15:00Z',
                        status: 'PENDING'
                    }
                ]
            };
            
            setPost(mockPost);
        } catch (error) {
            console.error('Error fetching blog detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                // Replace with actual API call
                console.log('Deleting post:', id);
                alert('Bài viết đã được xóa thành công!');
                navigate('/admin/blog');
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Có lỗi xảy ra khi xóa bài viết!');
            }
        }
    };

    const updateCommentStatus = async (commentId: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            // Replace with actual API call
            console.log('Updating comment status:', commentId, status);
            
            setPost(prev => prev ? {
                ...prev,
                comments: prev.comments.map(comment =>
                    comment.id === commentId ? { ...comment, status } : comment
                )
            } : null);
        } catch (error) {
            console.error('Error updating comment status:', error);
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

    const getStatusColor = (status: BlogDetail['status']) => {
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

    const getStatusText = (status: BlogDetail['status']) => {
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

    const getCommentStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    if (!post) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài viết</h2>
                    <p className="text-gray-600 mb-4">Bài viết có thể đã bị xóa hoặc không tồn tại.</p>
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
                        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                        <p className="text-gray-600">ID: {post.id}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                    </span>
                    
                    <Link
                        to={`/admin/blog/${post.id}/edit`}
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
                    {/* Featured Image */}
                    {post.featuredImage && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài viết</h2>
                        
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {post.content}
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                            Bình luận ({post.commentCount})
                        </h2>
                        
                        <div className="space-y-4">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900">{comment.author}</span>
                                            <span className="text-sm text-gray-500">{comment.email}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCommentStatusColor(comment.status)}`}>
                                                {comment.status === 'APPROVED' ? 'Đã duyệt' : 
                                                 comment.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-700 mb-3">{comment.content}</p>
                                    
                                    {comment.status === 'PENDING' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => updateCommentStatus(comment.id, 'REJECTED')}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Post Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài viết</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Tác giả</p>
                                    <p className="font-medium text-gray-900">{post.author.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <TagIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Danh mục</p>
                                    <p className="font-medium text-gray-900">{post.category.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Ngày tạo</p>
                                    <p className="font-medium text-gray-900">{formatDate(post.createdAt)}</p>
                                </div>
                            </div>
                            
                            {post.publishedAt && (
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày xuất bản</p>
                                        <p className="font-medium text-gray-900">{formatDate(post.publishedAt)}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center space-x-3">
                                <EyeIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Lượt xem</p>
                                    <p className="font-medium text-gray-900">{post.viewCount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                        
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* SEO Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">URL Slug</p>
                                <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                    /blog/{post.slug}
                                </code>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-600">Meta Description</p>
                                <p className="text-sm text-gray-900">{post.excerpt}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
