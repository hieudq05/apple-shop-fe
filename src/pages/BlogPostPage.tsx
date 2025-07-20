import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    CalendarIcon,
    UserIcon,
    ArrowLeftIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import publicBlogService, {
    type BlogDetail,
} from "../services/publicBlogService";

const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchBlogPost(parseInt(id));
        }
    }, [id]);

    const fetchBlogPost = async (blogId: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await publicBlogService.getBlogById(blogId);

            if (response.success) {
                setPost(response.data);
            } else {
                setError("Không thể tải bài viết");
            }
        } catch (error) {
            console.error("Error fetching blog post:", error);
            setError("Đã có lỗi xảy ra khi tải bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleShare = async () => {
        if (navigator.share && post) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.content.substring(0, 150) + "...",
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("Đã sao chép link bài viết vào clipboard!");
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error || "Không tìm thấy bài viết"}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc không
                        tồn tại.
                    </p>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Quay lại
                        </button>
                        <Link
                            to="/blog"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Xem tất cả bài viết
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Quay lại
                        </button>

                        <button
                            onClick={handleShare}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ShareIcon className="h-5 w-5 mr-2" />
                            Chia sẻ
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Featured Image */}
                    {post.thumbnail && (
                        <div className="mb-8">
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Article Header */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {post.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    {post.author.image && (
                                        <img
                                            src={post.author.image}
                                            alt={`${post.author.firstName} ${post.author.lastName}`}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span className="font-medium">
                                        {post.author.firstName}{" "}
                                        {post.author.lastName}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                <span>
                                    Đăng ngày {formatDate(post.publishedAt)}
                                </span>
                            </div>

                            {post.updatedAt !== post.createdAt && (
                                <div className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2" />
                                    <span>
                                        Cập nhật {formatDate(post.updatedAt)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                                style={{ lineHeight: "1.8" }}
                            >
                                {post.content}
                            </div>
                        </div>

                        {/* Article Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Bài viết được đăng bởi{" "}
                                    <strong>
                                        {post.author.firstName}{" "}
                                        {post.author.lastName}
                                    </strong>
                                </div>

                                {/* <button
                                    onClick={handleShare}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <ShareIcon className="h-4 w-4 mr-2" />
                                    Chia sẻ bài viết
                                </button> */}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <Link
                                to="/blog"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Quay lại danh sách bài viết
                            </Link>

                            <button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    })
                                }
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Lên đầu trang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
