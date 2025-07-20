import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    UserIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import publicBlogService, {
    type PublicBlog,
} from "../services/publicBlogService";

const BlogPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState<PublicBlog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("search") || ""
    );
    const [currentPage, setCurrentPage] = useState(
        parseInt(searchParams.get("page") || "1")
    );
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await publicBlogService.getBlogs({
                page: currentPage - 1, // API sử dụng 0-based indexing
                size: 6,
                search: searchTerm || undefined,
            });

            if (response.success) {
                setPosts(response.data);
                setTotalPages(response.meta.totalPage);
                setTotalElements(response.meta.totalElements);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, searchTerm, fetchPosts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearchParams((prev) => {
            if (searchTerm) {
                prev.set("search", searchTerm);
            } else {
                prev.delete("search");
            }
            prev.set("page", "1");
            return prev;
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSearchParams((prev) => {
            prev.set("page", page.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getExcerpt = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">
                            Apple Blog
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Khám phá những bài viết mới nhất về sản phẩm Apple,
                            tin tức công nghệ và hướng dẫn sử dụng
                        </p>
                    </div>

                    {/* Search Bar */}
                    {/* <div className="max-w-2xl mx-auto mt-8">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Tìm kiếm bài viết..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Tìm kiếm
                            </button>
                        </form>
                    </div> */}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Results Info */}
                {!isLoading && (
                    <div className="mb-6 text-gray-600">
                        {searchTerm ? (
                            <p>
                                Tìm thấy {totalElements} kết quả cho "
                                {searchTerm}"
                            </p>
                        ) : (
                            <p>Tổng cộng {totalElements} bài viết</p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Posts Grid */}
                {!isLoading && (
                    <>
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                        {/* Featured Image */}
                                        {post.thumbnail && (
                                            <div className="aspect-w-16 aspect-h-9">
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/placeholder-image.jpg";
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                                                <Link
                                                    to={`/blog/${post.id}`}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {post.title}
                                                </Link>
                                            </h2>

                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {getExcerpt(post.content)}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-4 w-4 mr-1" />
                                                        <span>
                                                            {
                                                                post.author
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                post.author
                                                                    .lastName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        <span>
                                                            {formatDate(
                                                                post.publishedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Read More */}
                                            <div className="mt-4">
                                                <Link
                                                    to={`/blog/${post.id}`}
                                                    className="flex justify-end items-center text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Đọc thêm
                                                    <svg
                                                        className="ml-1 h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-500 mb-4">
                                    <ChatBubbleLeftIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-medium mb-2">
                                        Không tìm thấy bài viết nào
                                    </h3>
                                    {searchTerm ? (
                                        <p>
                                            Không có bài viết nào phù hợp với từ
                                            khóa "{searchTerm}"
                                        </p>
                                    ) : (
                                        <p>
                                            Chưa có bài viết nào được đăng tải
                                        </p>
                                    )}
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSearchParams((prev) => {
                                                prev.delete("search");
                                                prev.set("page", "1");
                                                return prev;
                                            });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Xóa bộ lọc tìm kiếm
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className={`px-3 py-2 rounded-md ${
                                        currentPage === 1
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    Trước
                                </button>

                                {/* Page Numbers */}
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 2 &&
                                            page <= currentPage + 2)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`px-3 py-2 rounded-md ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 3 ||
                                        page === currentPage + 3
                                    ) {
                                        return (
                                            <span
                                                key={page}
                                                className="px-3 py-2 text-gray-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Next Button */}
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-2 rounded-md ${
                                        currentPage === totalPages
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
