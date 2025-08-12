import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import publicBlogService, {
    type PublicBlog,
} from "../services/publicBlogService";
import { Helmet } from "react-helmet-async";

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

    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await publicBlogService.getBlogs({
                page: currentPage - 1, // API sử dụng 0-based indexing
                size: 6,
                search: searchTerm || undefined,
            });

            if (response.success) {
                setPosts(response.data || []);
                setTotalPages(response.meta?.totalPage || 0);
                // setTotalElements(response.meta?.totalElements || 0);
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSearchParams((prev) => {
            prev.set("page", page.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-foreground/3">
            <Helmet>
                <title>Apple Newsroom</title>
                <link rel="icon" type="image/svg+xml" href="/apple.svg" />
            </Helmet>
            <div className="bg-muted/90 backdrop-blur-md shadow py-6 sticky top-[48px] z-10">
                <div className="container mx-auto">
                    <div className="text-xl font-medium">Newsroom</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto py-8 xl:px-64 mt-14 px-18">
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className={
                                            "bg-background justify-between grid rounded-[2.3rem] overflow-hidden hover:shadow-lg transition-shadow duration-300" +
                                            (idx === 0
                                                ? " col-span-2"
                                                : " grid-cols-1")
                                        }
                                    >
                                        <div
                                            className={idx === 0 ? "flex" : ""}
                                        >
                                            {/* Featured Image */}
                                            {post.thumbnail && (
                                                <div className={""}>
                                                    <img
                                                        src={post.thumbnail}
                                                        alt={post.title}
                                                        className={
                                                            "aspect-14/9 object-cover"
                                                        }
                                                    />
                                                </div>
                                            )}
                                            <div
                                                className={
                                                    "py-6 px-6 space-y-4 flex flex-col justify-between"
                                                }
                                            >
                                                <div className="flex justify-between flex-col gap-2">
                                                    <div className="text-muted-foreground uppercase font-semibold text-sm">
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
                                                    <h2 className="text-2xl font-semibold text-foreground">
                                                        <Link
                                                            to={`/blog/${post.id}`}
                                                            className="hover:text-blue-500 transition-colors"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </h2>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-muted-foreground font-medium text-lg">
                                                        {new Date(
                                                            post.publishedAt
                                                        ).getDate() +
                                                            " tháng " +
                                                            (new Date(
                                                                post.publishedAt
                                                            ).getMonth() +
                                                                1) +
                                                            " " +
                                                            new Date(
                                                                post.publishedAt
                                                            ).getFullYear()}
                                                    </span>
                                                </div>
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
