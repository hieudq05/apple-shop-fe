import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    CalendarIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import publicBlogService, {
    type BlogDetail,
} from "../services/publicBlogService";
import MarkdownRenderer from "@/components/MarkdownRenderer.tsx";
import { ChevronLeft, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Helmet } from "react-helmet-async";

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
            <div className="min-h-screen bg-foreground/3 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-foreground/3 flex flex-col justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        {error || "Không tìm thấy bài viết"}
                    </h1>
                    <p className="text-muted-foreground mb-6">
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
        <div className="min-h-screen bg-background">
            <Helmet>
            <title>{post.title}</title>
            </Helmet>
            {/* Header */}
            <div className="bg-foreground/5 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant={"ghost"}
                            onClick={() => navigate(-1)}
                            className="inline-flex cursor-pointer items-center text-foreground"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Quay lại
                        </Button>

                        <Button
                            variant={"ghost"}
                            onClick={handleShare}
                            className="inline-flex cursor-pointer items-center text-foreground"
                        >
                            <ShareIcon className="h-5 w-5" />
                            Chia sẻ
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="px-12 lg:px-20 mb-12 flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                            <div className="flex items-center space-x-2">
                                {post.author.image && (
                                    <img
                                        src={post.author.image}
                                        alt={`${post.author.firstName} ${post.author.lastName}`}
                                        className="size-10 object-cover rounded-full"
                                    />
                                )}
                            </div>
                            <p className="font-medium text-muted-foreground text-sm">
                                {post.author.firstName} {post.author.lastName}
                            </p>
                        </div>
                        {/* Title */}
                        <div className="text-3xl md:text-[2.8rem] font-semibold text-foreground mb-6">
                            {post.title}
                        </div>
                        {/* Date */}
                        <div className="flex gap-2 items-center">
                            <p className="text-muted-foreground font-medium text-sm">
                                {new Date(post.publishedAt).getDate() +
                                    " tháng " +
                                    (new Date(post.publishedAt).getMonth() +
                                        1) +
                                    " " +
                                    new Date(post.publishedAt).getFullYear()}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 font-medium text-sm text-muted-foreground border-gray-200">
                                {post.updatedAt !== post.createdAt && (
                                    <div className="flex gap-2 items-center">
                                        -
                                        <span>
                                            Cập nhật{" "}
                                            {formatDate(post.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.thumbnail && (
                        <div className="mb-8">
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Article Header */}
                    <div className="p-8 mb-8">
                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-foreground leading-relaxed whitespace-pre-wrap"
                                style={{ lineHeight: "1.2" }}
                            >
                                <MarkdownRenderer content={post.content} />
                            </div>
                        </div>

                        {/* Article Footer */}
                        <div className="mt-8 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Bài viết được đăng bởi{" "}
                                    <strong>
                                        {post.author.firstName}{" "}
                                        {post.author.lastName}
                                    </strong>
                                </div>

                                <Button
                                    onClick={handleShare}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <ShareIcon className="h-4 w-4" />
                                    Chia sẻ
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-foreground/3 rounded-2xl shadow-md p-6 border">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <Link
                                to="/blog"
                                className="inline-flex items-center justify-center pe-6 ps-3 py-3 border text-sm rounded-xl text-foreground bg-muted hover:bg-foreground/7 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại danh sách bài viết
                            </Link>

                            <Button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    })
                                }
                                className="inline-flex cursor-pointer h-full rounded-xl items-center justify-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                <ChevronUp className="h-4 w-4" />
                                Lên đầu trang
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
