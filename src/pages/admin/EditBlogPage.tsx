import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    PhotoIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

interface BlogForm {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    categoryId: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

const EditBlogPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState<BlogForm>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        categoryId: '',
        tags: [],
        status: 'DRAFT'
    });
    const [tagInput, setTagInput] = useState('');

    const categories = [
        { id: '1', name: 'Tin tức' },
        { id: '2', name: 'Đánh giá sản phẩm' },
        { id: '3', name: 'Hướng dẫn' },
        { id: '4', name: 'Khuyến mãi' },
        { id: '5', name: 'Công nghệ' }
    ];

    useEffect(() => {
        fetchBlogData();
    }, [id]);

    const fetchBlogData = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data - in real app, fetch from API
            const mockPost = {
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

## Kết luận

iPhone 15 Pro là một bước tiến đáng kể của Apple với nhiều cải tiến về thiết kế, hiệu năng và camera.

**Điểm số: 9/10**`,
                featuredImage: 'https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png',
                categoryId: '2',
                tags: ['iPhone', 'Apple', 'Đánh giá', 'Smartphone'],
                status: 'PUBLISHED' as const
            };
            
            setFormData(mockPost);
        } catch (error) {
            console.error('Error fetching blog data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Replace with actual API call
            console.log('Updating blog post:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Bài viết đã được cập nhật thành công!');
            navigate(`/admin/blog/${id}`);
        } catch (error) {
            console.error('Error updating blog post:', error);
            alert('Có lỗi xảy ra khi cập nhật bài viết!');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
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
                        onClick={() => navigate(`/admin/blog/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
                        <p className="text-gray-600">ID: {id}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className={`${showPreview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiêu đề bài viết *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Slug (URL thân thiện)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL: /blog/{formData.slug}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả ngắn *
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.excerpt.length}/200 ký tự
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Danh mục *
                                        </label>
                                        <select
                                            required
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogForm['status'] }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="DRAFT">Bản nháp</option>
                                            <option value="PUBLISHED">Đã xuất bản</option>
                                            <option value="ARCHIVED">Đã lưu trữ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL ảnh đại diện
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.featuredImage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                {formData.featuredImage ? (
                                    <div className="relative">
                                        <img
                                            src={formData.featuredImage}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">Chưa có ảnh đại diện</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                            
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nhập tag và nhấn Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Thêm
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài viết</h2>
                            
                            <div>
                                <textarea
                                    rows={20}
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Hỗ trợ Markdown: **bold**, *italic*, [link](url), ![image](url)
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isSaving ? 'Đang lưu...' : 'Cập nhật bài viết'}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/blog/${id}`)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <EyeIcon className="w-5 h-5 mr-2" />
                                Xem trước
                            </h2>
                            
                            <div className="space-y-4">
                                {formData.featuredImage && (
                                    <img
                                        src={formData.featuredImage}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {formData.title || 'Tiêu đề bài viết'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {formatDate(new Date())} • {categories.find(c => c.id === formData.categoryId)?.name || 'Chưa chọn danh mục'}
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {formData.excerpt || 'Mô tả ngắn về bài viết...'}
                                    </p>
                                </div>
                                
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Nội dung:</h4>
                                    <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                                        {formData.content ? (
                                            <pre className="whitespace-pre-wrap font-sans">
                                                {formData.content.substring(0, 200)}
                                                {formData.content.length > 200 && '...'}
                                            </pre>
                                        ) : (
                                            <p className="italic">Chưa có nội dung</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditBlogPage;
