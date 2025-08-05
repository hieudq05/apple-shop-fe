import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowLeftIcon, CalendarIcon, ShareIcon,} from "@heroicons/react/24/outline";
import publicBlogService, {type BlogDetail,} from "../services/publicBlogService";
import MarkdownRenderer from "@/components/MarkdownRenderer.tsx";
import {ChevronLeft, ChevronUp, Clock} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

const BlogPostPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
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
                            <ArrowLeftIcon className="h-4 w-4 mr-2"/>
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
            {/* Header */}
            <div className="bg-foreground/5 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant={"ghost"}
                            onClick={() => navigate(-1)}
                            className="inline-flex cursor-pointer items-center text-foreground"
                        >
                            <ChevronLeft className="h-5 w-5"/>
                            Quay lại
                        </Button>

                        <Button
                            variant={"ghost"}
                            onClick={handleShare}
                            className="inline-flex cursor-pointer items-center text-foreground"
                        >
                            <ShareIcon className="h-5 w-5"/>
                            Chia sẻ
                        </Button>
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
                                className="w-full aspect-video md:h-96 object-cover rounded-2xl shadow-md"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Article Header */}
                    <div className="bg-foreground/3 rounded-2xl border shadow-md p-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            {post.title}
                        </h1>

                        {/* Meta Information */}
                        <div
                            className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    {post.author.image && (
                                        <img
                                            src={post.author.image}
                                            alt={`${post.author.firstName} ${post.author.lastName}`}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span className="font-medium text-foreground">
                                        {post.author.firstName}{" "}
                                        {post.author.lastName}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <CalendarIcon className="size-4 mr-2"/>
                                <span>
                                    Đăng ngày {formatDate(post.publishedAt)}
                                </span>
                            </div>

                            {post.updatedAt !== post.createdAt && (
                                <div className="flex items-center">
                                    <Clock className={"size-4 mr-2 text-yellow-500"}/>
                                    <span>
                                        Cập nhật {formatDate(post.updatedAt)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-foreground leading-relaxed whitespace-pre-wrap"
                                style={{lineHeight: "1.8"}}
                            >
                                <MarkdownRenderer content={post.content}/>
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
                                <ChevronLeft className="h-4 w-4 mr-2"/>
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
                                <ChevronUp className="h-4 w-4"/>
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
