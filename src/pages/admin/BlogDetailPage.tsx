import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowLeftIcon, CalendarIcon, PencilIcon, TagIcon, TrashIcon, UserIcon,} from "@heroicons/react/24/outline";
import blogService, {type Blog} from "../../services/blogService";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import MarkdownRenderer from "@/components/MarkdownRenderer.tsx";
import { Helmet } from "react-helmet-async";

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
                setError(response.msg || "Không thể tải bài viết");
            }
        } catch (error) {
            console.error("Error fetching blog detail:", error);
            setError("Có lỗi xảy ra khi tải bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!id || !window.confirm("Bạn có chắc chắn muốn xóa bài viết này?"))
            return;

        try {
            const response = await blogService.deleteBlog(parseInt(id));
            if (response.success) {
                alert("Bài viết đã được xóa thành công!");
                navigate("/admin/blog");
            } else {
                alert(response.msg || "Có lỗi xảy ra khi xóa bài viết!");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            alert("Có lỗi xảy ra khi xóa bài viết!");
        }
    };

    const handleTogglePublish = async () => {
        if (!id || !blog) return;

        try {
            const response = await blogService.toggleBlogStatus(parseInt(id));
            if (response.success) {
                setBlog((prev) => ({
                    ...prev,
                    isPublished: !prev?.isPublished,
                }));
                alert(
                    `Bài viết đã ${
                        response.success ? "được xuất bản" : "bị ẩn"
                    } thành công!`
                );
            } else {
                alert(response.msg || "Có lỗi xảy ra khi cập nhật trạng thái!");
            }
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái!");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (isPublished: boolean) => {
        return isPublished
            ? "bg-green-500/10 text-green-500"
            : "bg-yellow-500/10 text-yellow-500";
    };

    const getStatusText = (isPublished: boolean) => {
        return isPublished ? "Đã xuất bản" : "Bản nháp";
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
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {error || "Không tìm thấy bài viết"}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        {error ||
                            "Bài viết có thể đã bị xóa hoặc không tồn tại."}
                    </p>
                    <button
                        onClick={() => navigate("/admin/blog")}
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
            <Helmet>
                <title>{blog.title} - Apple</title>
            </Helmet>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant={"outline"}
                        onClick={() => navigate("/admin/blog")}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {blog.title}
                        </h1>
                        <p className="text-muted-foreground">ID: {blog.id}</p>
                    </div>
                    <Badge
                        variant={"outline"}
                        className={`${getStatusColor(
                            blog.isPublished
                        )}`}
                    >
                        {getStatusText(blog.isPublished)}
                    </Badge>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant={blog.isPublished ? "outline" : "default"}
                        onClick={handleTogglePublish}
                    >
                        {blog.isPublished ? "Ẩn bài viết" : "Xuất bản"}
                    </Button>

                    <Link
                        to={`/admin/blog/${blog.id}/edit`}
                        className="flex items-center px-3 py-[0.45rem] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Sửa
                    </Link>
                    <Button
                        onClick={handleDeletePost}
                        className="flex items-center px-3 py-[0.45rem] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Xóa
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Thumbnail */}
                    {blog.thumbnail && (
                        <div className="rounded-2xl shadow-sm border overflow-hidden">
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full aspect-video object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-foreground/3 rounded-2xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            Nội dung bài viết
                        </h2>

                        <div className="markdown-content max-w-none">
                            {blog.content ? (
                                <div className="text-foreground leading-relaxed">
                                    <MarkdownRenderer content={blog.content} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    Bài viết chưa có nội dung.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Blog Info */}
                    <div className="bg-foreground/3 rounded-2xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Thông tin bài viết
                        </h2>

                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Tác giả
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {blog.author.firstName}{" "}
                                        {blog.author.lastName}
                                    </p>
                                </div>
                            </div>

                            <hr />

                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Ngày tạo
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {formatDate(blog.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <hr />

                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Ngày cập nhật
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {formatDate(blog.updatedAt)}
                                    </p>
                                </div>
                            </div>

                            {blog.isPublished && (
                                <hr />
                            )}

                            {blog.publishedAt && (
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Ngày xuất bản
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {formatDate(blog.publishedAt)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {blog.status && (
                                <div className="flex items-center space-x-3">
                                    <TagIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Trạng thái
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {blog.status}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    {blog.author.image && (
                        <div className="bg-foreground/3 rounded-2xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Tác giả
                            </h2>

                            <div className="flex items-center space-x-3">
                                <img
                                    src={blog.author.image}
                                    alt={`${blog.author.firstName} ${blog.author.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                                <div>
                                    <p className="font-medium text-foreground">
                                        {blog.author.firstName}{" "}
                                        {blog.author.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ID: {blog.author.id}
                                    </p>
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
