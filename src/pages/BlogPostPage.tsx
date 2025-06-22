import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    CalendarIcon,
    UserIcon,
    TagIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    ArrowLeftIcon,
    ShareIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    featuredImage?: string;
    author: {
        id: number;
        name: string;
        bio?: string;
        avatar?: string;
    };
    category: {
        id: number;
        name: string;
    };
    tags: string[];
    publishedAt: string;
    viewCount: number;
    commentCount: number;
    readTime: number;
}

interface Comment {
    id: number;
    author: string;
    content: string;
    createdAt: string;
    replies?: Comment[];
}

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        fetchBlogPost();
        fetchComments();
    }, [slug]);

    const fetchBlogPost = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockPost: BlogPost = {
                id: 1,
                title: 'iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng',
                slug: 'iphone-15-pro-danh-gia-chi-tiet',
                content: `# iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng

Sau 1 tháng trải nghiệm iPhone 15 Pro, tôi muốn chia sẻ những cảm nhận thực tế về chiếc smartphone flagship mới nhất của Apple. Đây không chỉ là một bản nâng cấp thông thường mà là một bước tiến đáng kể trong thiết kế và công nghệ.

## Thiết kế và chất lượng xây dựng

iPhone 15 Pro mang đến một sự thay đổi đáng kể về thiết kế với việc sử dụng **khung titan cấp hàng không vũ trụ**. Điều này không chỉ làm cho máy nhẹ hơn mà còn tăng độ bền vượt trội.

### Những điểm nổi bật:

- **Khung titan**: Nhẹ hơn 19g so với iPhone 14 Pro, tạo cảm giác cầm nắm thoải mái hơn đáng kể
- **Action Button**: Thay thế cho switch im lặng truyền thống, có thể tùy chỉnh nhiều chức năng khác nhau
- **USB-C**: Cuối cùng Apple cũng chuyển sang chuẩn kết nối phổ biến, thuận tiện cho việc sạc và truyền dữ liệu

Cảm giác cầm nắm của iPhone 15 Pro thực sự khác biệt. Khung titan không chỉ nhẹ hơn mà còn có độ bền cao hơn, ít bị trầy xước hơn so với thép không gỉ trên thế hệ trước.

## Hiệu năng

Chip A17 Pro được sản xuất trên tiến trình 3nm mang đến hiệu năng vượt trội:

- **CPU**: Nhanh hơn 10% so với A16 Bionic
- **GPU**: Nhanh hơn 20%, hỗ trợ ray tracing hardware
- **Neural Engine**: Xử lý AI nhanh hơn đáng kể, cải thiện các tính năng machine learning

Trong thực tế sử dụng, tôi nhận thấy máy xử lý mọi tác vụ một cách mượt mà, từ chỉnh sửa video 4K đến chơi game với đồ họa cao. Đặc biệt, khả năng xử lý nhiệt được cải thiện đáng kể so với thế hệ trước.

## Camera

Hệ thống camera của iPhone 15 Pro đã được nâng cấp đáng kể:

### Camera chính 48MP
- Chụp ảnh chi tiết, màu sắc chính xác và tự nhiên
- Chế độ Portrait được cải thiện với khả năng tách nền tốt hơn
- Video 4K ProRes với chất lượng cinema

### Camera Telephoto
- Zoom quang học 3x với chất lượng ảnh sắc nét
- Chế độ macro mới cho phép chụp cận cảnh với độ chi tiết cao
- Stabilization được cải thiện đáng kể

Tôi đặc biệt ấn tượng với khả năng chụp ảnh trong điều kiện ánh sáng yếu. Night mode hoạt động tự động và cho ra những bức ảnh có độ chi tiết cao mà ít nhiễu.

## Pin và sạc

- **Thời lượng pin**: Cải thiện khoảng 1-2 giờ so với iPhone 14 Pro
- **Sạc USB-C**: Hỗ trợ sạc nhanh lên đến 27W
- **Sạc không dây**: MagSafe 15W và Qi 7.5W

Trong sử dụng thực tế, tôi có thể sử dụng máy cả ngày với cường độ cao mà không cần sạc thêm.

## Kết luận

iPhone 15 Pro là một bước tiến đáng kể của Apple với nhiều cải tiến về thiết kế, hiệu năng và camera. Việc chuyển sang khung titan và cổng USB-C là những thay đổi tích cực, trong khi hiệu năng A17 Pro thực sự ấn tượng.

**Ưu điểm:**
- Thiết kế titan cao cấp và nhẹ hơn
- Hiệu năng A17 Pro vượt trội
- Camera cải thiện đáng kể
- Action Button linh hoạt
- USB-C tiện lợi

**Nhược điểm:**
- Giá thành vẫn cao
- Dung lượng lưu trữ cơ bản chỉ 128GB
- Sạc nhanh chưa thực sự nhanh so với Android

**Điểm số: 9/10**

iPhone 15 Pro xứng đáng là một trong những smartphone tốt nhất hiện tại, đặc biệt phù hợp với những ai đang sử dụng iPhone cũ và muốn nâng cấp lên một thiết bị hiện đại với nhiều tính năng mới.`,
                featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png',
                author: {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    bio: 'Tech reviewer với 5 năm kinh nghiệm đánh giá các sản phẩm công nghệ, đặc biệt là ecosystem Apple.',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                },
                category: {
                    id: 2,
                    name: 'Đánh giá sản phẩm'
                },
                tags: ['iPhone', 'Apple', 'Đánh giá', 'Smartphone', 'A17 Pro'],
                publishedAt: '2024-01-20T10:30:00Z',
                viewCount: 1250,
                commentCount: 23,
                readTime: 8
            };
            
            setPost(mockPost);
        } catch (error) {
            console.error('Error fetching blog post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock comments
            const mockComments: Comment[] = [
                {
                    id: 1,
                    author: 'Trần Văn B',
                    content: 'Bài viết rất chi tiết và hữu ích. Mình đang cân nhắc nâng cấp từ iPhone 13 Pro, cảm ơn tác giả đã chia sẻ!',
                    createdAt: '2024-01-20T14:30:00Z'
                },
                {
                    id: 2,
                    author: 'Lê Thị C',
                    content: 'Camera của iPhone 15 Pro thực sự ấn tượng. Mình đã mua và rất hài lòng với chất lượng ảnh chụp.',
                    createdAt: '2024-01-20T16:45:00Z'
                },
                {
                    id: 3,
                    author: 'Phạm Minh D',
                    content: 'Action Button là tính năng mình thích nhất. Có thể tùy chỉnh để mở camera nhanh chóng.',
                    createdAt: '2024-01-21T08:15:00Z'
                }
            ];
            
            setComments(mockComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !commentAuthor.trim()) return;

        setIsSubmittingComment(true);
        try {
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const comment: Comment = {
                id: Date.now(),
                author: commentAuthor,
                content: newComment,
                createdAt: new Date().toISOString()
            };
            
            setComments(prev => [...prev, comment]);
            setNewComment('');
            setCommentAuthor('');
            
            // Update comment count
            if (post) {
                setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setIsSubmittingComment(false);
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

    const handleShare = () => {
        if (navigator.share && post) {
            navigator.share({
                title: post.title,
                text: post.title,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link đã được sao chép vào clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="h-64 bg-gray-200 rounded mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h2>
                <p className="text-gray-600 mb-8">Bài viết có thể đã bị xóa hoặc không tồn tại.</p>
                <Link
                    to="/blog"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Quay lại Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back to Blog */}
            <div className="mb-8">
                <Link
                    to="/blog"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Quay lại Blog
                </Link>
            </div>

            {/* Article Header */}
            <header className="mb-8">
                <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {post.category.name}
                    </span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {post.viewCount.toLocaleString()} lượt xem
                    </div>
                    <div className="flex items-center">
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                        {post.commentCount} bình luận
                    </div>
                    <span>{post.readTime} phút đọc</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between border-t border-b border-gray-200 py-6">
                    <div className="flex items-center space-x-4">
                        {post.author.avatar ? (
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <div className="font-semibold text-gray-900">{post.author.name}</div>
                            {post.author.bio && (
                                <div className="text-sm text-gray-600">{post.author.bio}</div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleShare}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Chia sẻ
                    </button>
                </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="mb-8">
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Article Content */}
            <article className="prose prose-lg max-w-none mb-12">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                    {post.content}
                </div>
            </article>

            {/* Tags */}
            <div className="mb-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                        <Link
                            key={index}
                            to={`/blog?search=${encodeURIComponent(tag)}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                        >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            <section className="border-t border-gray-200 pt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                    Bình luận ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="mb-12 bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Để lại bình luận</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên của bạn *
                            </label>
                            <input
                                type="text"
                                required
                                value={commentAuthor}
                                onChange={(e) => setCommentAuthor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập tên của bạn"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bình luận *
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Chia sẻ suy nghĩ của bạn về bài viết..."
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmittingComment}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                </form>

                {/* Comments List */}
                <div className="space-y-8">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-semibold text-gray-900">{comment.author}</span>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {comments.length === 0 && (
                    <div className="text-center py-12">
                        <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BlogPostPage;
