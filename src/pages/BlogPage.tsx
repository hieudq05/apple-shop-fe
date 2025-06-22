import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    MagnifyingGlassIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    EyeIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
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
    publishedAt: string;
    viewCount: number;
    commentCount: number;
    readTime: number; // minutes
}

const BlogPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        { id: '', name: 'Tất cả bài viết' },
        { id: '1', name: 'Tin tức' },
        { id: '2', name: 'Đánh giá sản phẩm' },
        { id: '3', name: 'Hướng dẫn' },
        { id: '4', name: 'Khuyến mãi' },
        { id: '5', name: 'Công nghệ' }
    ];

    const featuredTags = ['iPhone', 'Mac', 'iPad', 'Apple Watch', 'AirPods', 'iOS', 'macOS'];

    useEffect(() => {
        fetchPosts();
    }, [currentPage, searchTerm, selectedCategory]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (currentPage > 1) params.set('page', currentPage.toString());
        setSearchParams(params);
    }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

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
                    excerpt: 'Sau 1 tháng trải nghiệm iPhone 15 Pro, đây là những ưu nhược điểm mà chúng tôi nhận thấy. Từ thiết kế titan mới đến hiệu năng A17 Pro...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png',
                    author: { id: 1, name: 'Nguyễn Văn A' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['iPhone', 'Apple', 'Đánh giá'],
                    publishedAt: '2024-01-20T10:30:00Z',
                    viewCount: 1250,
                    commentCount: 23,
                    readTime: 8
                },
                {
                    id: 2,
                    title: 'MacBook Pro M3: Hiệu năng vượt trội cho dân sáng tạo',
                    slug: 'macbook-pro-m3-hieu-nang-vuot-troi',
                    excerpt: 'MacBook Pro M3 mang đến hiệu năng đột phá với chip M3 mới nhất của Apple. Tìm hiểu xem liệu có đáng để nâng cấp từ M2...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/10/31/macbook-pro-14-m3-pro-space-gray.png',
                    author: { id: 2, name: 'Trần Thị B' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['MacBook', 'M3', 'Laptop'],
                    publishedAt: '2024-01-18T14:15:00Z',
                    viewCount: 890,
                    commentCount: 15,
                    readTime: 12
                },
                {
                    id: 3,
                    title: 'Hướng dẫn sử dụng Apple Watch Series 9 hiệu quả',
                    slug: 'huong-dan-su-dung-apple-watch-series-9',
                    excerpt: 'Tận dụng tối đa các tính năng của Apple Watch Series 9 với hướng dẫn chi tiết từ cơ bản đến nâng cao...',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/apple-watch-series-9-midnight.png',
                    author: { id: 1, name: 'Nguyễn Văn A' },
                    category: { id: 3, name: 'Hướng dẫn' },
                    tags: ['Apple Watch', 'Hướng dẫn'],
                    publishedAt: '2024-01-16T09:20:00Z',
                    viewCount: 654,
                    commentCount: 8,
                    readTime: 6
                },
                {
                    id: 4,
                    title: 'iOS 17.3: Những tính năng mới đáng chú ý',
                    slug: 'ios-17-3-tinh-nang-moi',
                    excerpt: 'Apple vừa phát hành iOS 17.3 với nhiều tính năng mới và cải tiến bảo mật. Cùng khám phá những điểm nổi bật...',
                    author: { id: 3, name: 'Lê Văn C' },
                    category: { id: 1, name: 'Tin tức' },
                    tags: ['iOS', 'Apple', 'Cập nhật'],
                    publishedAt: '2024-01-15T16:45:00Z',
                    viewCount: 1100,
                    commentCount: 31,
                    readTime: 5
                },
                {
                    id: 5,
                    title: 'So sánh iPad Pro M4 vs MacBook Air M3: Chọn thiết bị nào?',
                    slug: 'so-sanh-ipad-pro-m4-vs-macbook-air-m3',
                    excerpt: 'Cả iPad Pro M4 và MacBook Air M3 đều là những thiết bị tuyệt vời, nhưng đâu là lựa chọn phù hợp với bạn?',
                    featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2024/05/08/ipad-pro-11-m4-space-gray.png',
                    author: { id: 2, name: 'Trần Thị B' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['iPad', 'MacBook', 'So sánh'],
                    publishedAt: '2024-01-14T11:30:00Z',
                    viewCount: 756,
                    commentCount: 19,
                    readTime: 10
                },
                {
                    id: 6,
                    title: 'AirPods Pro 2: Có đáng để nâng cấp từ thế hệ đầu?',
                    slug: 'airpods-pro-2-co-dang-nang-cap',
                    excerpt: 'AirPods Pro 2 mang đến nhiều cải tiến về chất lượng âm thanh và tính năng. Liệu có đáng để nâng cấp?',
                    author: { id: 1, name: 'Nguyễn Văn A' },
                    category: { id: 2, name: 'Đánh giá sản phẩm' },
                    tags: ['AirPods', 'Audio', 'Đánh giá'],
                    publishedAt: '2024-01-12T13:15:00Z',
                    viewCount: 432,
                    commentCount: 12,
                    readTime: 7
                }
            ];
            
            // Filter posts based on search and category
            let filteredPosts = mockPosts;
            
            if (searchTerm) {
                filteredPosts = filteredPosts.filter(post =>
                    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }
            
            if (selectedCategory) {
                filteredPosts = filteredPosts.filter(post =>
                    post.category.id.toString() === selectedCategory
                );
            }
            
            setPosts(filteredPosts);
            setTotalPages(Math.ceil(filteredPosts.length / 6)); // 6 posts per page
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPosts();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Apple Store</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Khám phá những bài viết mới nhất về sản phẩm Apple, đánh giá chi tiết và hướng dẫn sử dụng
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm bài viết..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </form>
                </div>
                
                <div className="flex gap-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Featured Tags */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                    {featuredTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => {
                                setSearchTerm(tag);
                                setCurrentPage(1);
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <>
                    {/* Featured Post */}
                    {featuredPost && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết nổi bật</h2>
                            <Link
                                to={`/blog/${featuredPost.slug}`}
                                className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="lg:flex">
                                    {featuredPost.featuredImage && (
                                        <div className="lg:w-1/2">
                                            <img
                                                src={featuredPost.featuredImage}
                                                alt={featuredPost.title}
                                                className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className={`p-8 ${featuredPost.featuredImage ? 'lg:w-1/2' : 'w-full'}`}>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {featuredPost.category.name}
                                            </span>
                                            <div className="flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                {formatDate(featuredPost.publishedAt)}
                                            </div>
                                            <div className="flex items-center">
                                                <UserIcon className="w-4 h-4 mr-1" />
                                                {featuredPost.author.name}
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {featuredPost.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            {featuredPost.excerpt}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-2">
                                                {featuredPost.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    {featuredPost.viewCount}
                                                </div>
                                                <div className="flex items-center">
                                                    <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                                                    {featuredPost.commentCount}
                                                </div>
                                                <span>{featuredPost.readTime} phút đọc</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Regular Posts Grid */}
                    {regularPosts.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết khác</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {regularPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/blog/${post.slug}`}
                                        className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {post.featuredImage ? (
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                <TagIcon className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        
                                        <div className="p-6">
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {post.category.name}
                                                </span>
                                                <div className="flex items-center">
                                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                                    {formatDate(post.publishedAt)}
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <UserIcon className="w-3 h-3 mr-1" />
                                                    {post.author.name}
                                                </div>
                                                
                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                    <div className="flex items-center">
                                                        <EyeIcon className="w-3 h-3 mr-1" />
                                                        {post.viewCount}
                                                    </div>
                                                    <span>{post.readTime} phút</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy bài viết nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setCurrentPage(1);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem tất cả bài viết
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogPage;
