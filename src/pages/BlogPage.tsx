import React, {useCallback, useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {CalendarIcon, ChatBubbleLeftIcon, UserIcon,} from "@heroicons/react/24/outline";
import publicBlogService, {type PublicBlog,} from "../services/publicBlogService";
import MarkdownRenderer from "@/components/MarkdownRenderer.tsx";
import {useTheme} from "@/components/theme-provider.tsx";

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
        <div className="min-h-screen">
            {/* Header Section */}
            <div className=" pt-16">
                <div className="container mx-auto px-4 bg-muted shadow-sm rounded-2xl border">
                    <div className="relative text-center flex flex-col items-center justify-center gap-4">
                        <svg className={"size-80 mb-30"} viewBox="0 0 14 44" xmlns="http://www.w3.org/2000/svg"><path d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z" fill={
                            useTheme().theme === "light" ? "#000" : useTheme().theme === "dark" ? "#fff" :
                                useTheme().theme === "system" ? window.matchMedia("(prefers-color-scheme: light)").matches ? "#000" : "#fff" : "#000"
                        }></path></svg>
                        <div className={"absolute bottom-14"}>
                            <h1 className="text-6xl font-bold text-foreground mb-4">
                                Apple Blog
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Khám phá những bài viết mới nhất về sản phẩm Apple,
                                tin tức công nghệ và hướng dẫn sử dụng
                            </p>
                        </div>
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
            <div className="container mx-auto py-8">
                {/* Results Info */}
                {!isLoading && (
                    <div className="mb-6 text-muted-foreground">
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
                                        className="bg-foreground/5 h-full justify-between flex flex-col rounded-2xl border-2 border-foreground/7 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div>
                                            {/* Featured Image */}
                                            {post.thumbnail && (
                                                <div className={""}>
                                                    <img
                                                        src={post.thumbnail}
                                                        alt={post.title}
                                                        className={"w-full object-cover " + (post.thumbnail ? "aspect-video" : "h-full")}
                                                    />
                                                </div>
                                            )}
                                            <div className={"pt-6 px-6"}>
                                                <h2 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                                                    <Link
                                                        to={`/blog/${post.id}`}
                                                        className="hover:text-blue-500 transition-colors"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                </h2>

                                                <p className="text-muted-foreground mb-4 line-clamp-1">
                                                    <MarkdownRenderer content={post.content} />
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
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
                                                    className="flex justify-end items-center text-blue-600 hover:text-blue-500 hover:underline font-medium"
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
