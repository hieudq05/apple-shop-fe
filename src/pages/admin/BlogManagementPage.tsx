import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import blogService, {
    type Blog,
    type BlogParams,
} from "../../services/blogService";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "@/components/ui/input.tsx";
import { Helmet } from "react-helmet-async";

const BlogManagementPage: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        blogId: number | null;
        blogTitle: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        blogId: null,
        blogTitle: "",
        isDeleting: false,
    });

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(0);
    }, [debouncedSearchTerm, selectedStatus]);

    const fetchBlogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params: BlogParams = {
                page: currentPage,
                size: pageSize,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (selectedStatus === "PUBLISHED") params.isPublished = true;
            if (selectedStatus === "DRAFT") params.isPublished = false;

            const response = await blogService.getBlogs(params);

            if (response.success) {
                setBlogs(response.data || []);
                setTotalPages(response.meta?.totalPage || 0);
                setTotalElements(response.meta?.totalElements || 0);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            setError("Không thể tải danh sách blog. Vui lòng thử lại.");
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, selectedStatus, pageSize]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const openDeleteDialog = (blogId: number, blogTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            blogId,
            blogTitle,
            isDeleting: false,
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            blogId: null,
            blogTitle: "",
            isDeleting: false,
        });
    };

    const handleDeleteBlog = async () => {
        if (!deleteDialog.blogId) return;

        setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
        const loadingToast = toast.loading("Đang xóa bài viết...", {
            duration: Infinity,
        });

        try {
            const response = await blogService.deleteBlog(deleteDialog.blogId);

            if (response.success) {
                // Remove deleted blog from local state
                setBlogs((prev) =>
                    prev.filter((blog) => blog.id !== deleteDialog.blogId)
                );
                // Update total elements count
                setTotalElements((prev) => prev - 1);
                closeDeleteDialog();
                toast.dismiss(loadingToast);
                toast.success("Xóa bài viết thành công");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.dismiss(loadingToast);
            toast.error("Không thể xóa bài viết. Vui lòng thử lại.");
            setError("Không thể xóa bài viết. Vui lòng thử lại.");
            setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    const toggleBlogStatus = async (
        blogId: number,
        currentPublishStatus: boolean
    ) => {
        const newStatus = !currentPublishStatus;
        const loadingToast = toast.loading(
            newStatus
                ? "Đang xuất bản bài viết..."
                : "Đang chuyển về bản nháp...",
            { duration: Infinity }
        );

        try {
            const response = await blogService.toggleBlogStatus(blogId);

            if (response.success) {
                // Update local state instead of refetching
                setBlogs((prev) =>
                    prev.map((blog) =>
                        blog.id === blogId
                            ? { ...blog, isPublished: newStatus }
                            : blog
                    )
                );
                toast.dismiss(loadingToast);
                toast.success(
                    newStatus
                        ? "Xuất bản bài viết thành công"
                        : "Chuyển về bản nháp thành công"
                );
            }
        } catch (error) {
            console.error("Error toggling blog status:", error);
            toast.dismiss(loadingToast);
            toast.error(
                "Không thể thay đổi trạng thái bài viết. Vui lòng thử lại."
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadgeClass = (isPublished: boolean): string => {
        return isPublished ? "text-green-500" : "text-muted-foreground";
    };

    const getStatusText = (isPublished: boolean) => {
        return isPublished ? "Đã xuất bản" : "Bản nháp";
    };

    const getAuthorName = (author: { firstName: string; lastName: string }) => {
        return `${author.firstName} ${author.lastName}`.trim();
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch = blog.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            !selectedStatus ||
            (selectedStatus === "PUBLISHED" && blog.isPublished) ||
            (selectedStatus === "DRAFT" && !blog.isPublished);

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-20 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Helmet>
                <title>Quản lý Blog - Apple</title>
            </Helmet>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Quản lý Blog
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý các bài viết và nội dung blog
                    </p>
                </div>
                <Button asChild>
                    <Link to="/admin/blog/create" className="flex items-center">
                        <PlusIcon className="w-4 h-4" />
                        <span>Viết bài mới</span>
                    </Link>
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-foreground/3 border rounded-lg">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                    />
                </div>
                <Select
                    value={selectedStatus}
                    onValueChange={(s) => setSelectedStatus(s)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                        <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                        <SelectItem value="DRAFT">Bản nháp</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Blogs Table */}
            <div className="bg-background rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-foreground/5">
                        <thead className="bg-foreground/3">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Bài viết
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Tác giả
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-foreground">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {filteredBlogs.map((blog) => (
                                <tr
                                    key={blog.id}
                                    className="hover:bg-foreground/3 h-16"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={blog.thumbnail}
                                                    className="w-full h-full object-cover"
                                                    alt={blog.title}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-foreground truncate">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    ID: {blog.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-foreground">
                                                {getAuthorName(blog.author)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={"secondary"}
                                                className={
                                                    "text-xs flex items-center gap-1 " +
                                                    getStatusBadgeClass(
                                                        blog.isPublished
                                                    )
                                                }
                                            >
                                                {blog.isPublished ? (
                                                    <div className="size-3 bg-green-500/35 rounded-full relative">
                                                        <div className="size-1.5 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                                    </div>
                                                ) : (
                                                    <div className="size-3 bg-gray-500/35 rounded-full flex items-center justify-center">
                                                        <div className="size-1.5 bg-gray-500 rounded-full"></div>
                                                    </div>
                                                )}
                                                {getStatusText(
                                                    blog.isPublished
                                                )}
                                            </Badge>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <Input
                                                    type="checkbox"
                                                    checked={blog.isPublished}
                                                    onChange={() =>
                                                        toggleBlogStatus(
                                                            blog.id,
                                                            blog.isPublished
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                            <span>
                                                {formatDate(blog.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <EllipsisVerticalIcon className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/admin/blog/${blog.id}`}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            Xem chi tiết
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/admin/blog/${blog.id}/edit`}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                            Chỉnh sửa
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                blog.id,
                                                                blog.title
                                                            )
                                                        }
                                                        className="text-destructive focus:text-destructive flex items-center gap-2"
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-destructive" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {blogs.length > 0 && (
                    <div className="bg-background px-6 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Hiển thị{" "}
                            <span className="font-medium">
                                {currentPage * pageSize + 1}
                            </span>{" "}
                            đến{" "}
                            <span className="font-medium">
                                {Math.min(
                                    (currentPage + 1) * pageSize,
                                    totalElements
                                )}
                            </span>{" "}
                            trong{" "}
                            <span className="font-medium">{totalElements}</span>{" "}
                            kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(Math.max(0, currentPage - 1))
                                }
                                disabled={currentPage === 0}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map(
                                    (_, i) => {
                                        const pageNum = i;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(pageNum)
                                                }
                                                className="w-8 h-8"
                                            >
                                                {pageNum + 1}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(
                                            totalPages - 1,
                                            currentPage + 1
                                        )
                                    )
                                }
                                disabled={currentPage === totalPages - 1}
                            >
                                Sau
                                <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => !open && closeDeleteDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa bài viết</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa bài viết "
                            {deleteDialog.blogTitle}"? Hành động này không thể
                            hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeDeleteDialog}
                            disabled={deleteDialog.isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteBlog}
                            disabled={deleteDialog.isDeleting}
                        >
                            {deleteDialog.isDeleting ? "Đang xóa..." : "Xóa"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BlogManagementPage;
