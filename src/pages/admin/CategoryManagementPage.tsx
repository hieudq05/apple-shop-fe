import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Tag,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    type Category,
} from "../../services/categoryService";
import type { MetadataResponse } from "../../types/api";

interface CategoryForm {
    name: string;
    description: string;
    image: File | null;
}

const CategoryManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [metadata, setMetadata] = useState<MetadataResponse>({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPage: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );
    const [formData, setFormData] = useState<CategoryForm>({
        name: "",
        description: "",
        image: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        categoryId: number | null;
        categoryName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        categoryId: null,
        categoryName: "",
        isDeleting: false,
    });

    useEffect(() => {
        loadCategories();
    }, [metadata.currentPage, metadata.pageSize]);

    const params = {
        size: metadata.pageSize,
        page: metadata.currentPage,
    };

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetchAdminCategories(params);
            setCategories(response.data);
            setMetadata(response.meta);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateForm = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            description: "",
            image: null,
        });
        setShowForm(true);
    };

    const openEditForm = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            image: null,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({
            name: "",
            description: "",
            image: null,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSaving(true);
        const loadingToast = editingCategory
            ? toast.loading("Đang cập nhật danh mục...", { duration: Infinity })
            : toast.loading("Đang tạo danh mục mới...", { duration: Infinity });

        try {
            if (editingCategory && editingCategory.id) {
                // Update existing category
                const response = await updateCategory(
                    {
                        name: formData.name,
                        description: formData.description,
                    },
                    editingCategory.id,
                    formData.image || undefined
                );
                // Update local state with form data
                setCategories((prev) =>
                    prev.map((category) =>
                        category.id === editingCategory.id
                            ? {
                                  ...category,
                                  name: formData.name,
                                  description: formData.description,
                              }
                            : category
                    )
                );
                toast.dismiss(loadingToast);
                toast.success("Cập nhật danh mục thành công");
            } else {
                // Create new category
                if (!formData.image) {
                    toast.dismiss(loadingToast);
                    toast.error("Vui lòng chọn hình ảnh cho danh mục");
                    return;
                }
                const response = await createCategory(
                    {
                        name: formData.name,
                        description: formData.description,
                        image: null,
                    },
                    formData.image
                );
                // Add new category to local state
                setCategories((prev) => [response, ...prev]);
                // Update metadata total count
                setMetadata((prev) => ({
                    ...prev,
                    totalElements: prev.totalElements + 1,
                }));
                toast.dismiss(loadingToast);
                toast.success("Tạo danh mục mới thành công");
            }
            closeForm();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.dismiss(loadingToast);
            toast.error("Có lỗi xảy ra khi lưu danh mục");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.categoryId) return;

        setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
        const loadingToast = toast.loading("Đang xóa danh mục...", {
            duration: Infinity,
        });

        try {
            await deleteCategory(deleteDialog.categoryId);
            // Remove deleted category from local state
            setCategories((prev) =>
                prev.filter(
                    (category) => category.id !== deleteDialog.categoryId
                )
            );
            // Update metadata total count
            setMetadata((prev) => ({
                ...prev,
                totalElements: prev.totalElements - 1,
            }));
            setDeleteDialog({
                isOpen: false,
                categoryId: null,
                categoryName: "",
                isDeleting: false,
            });
            toast.dismiss(loadingToast);
            toast.success("Xóa danh mục thành công");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.dismiss(loadingToast);
            toast.error("Có lỗi xảy ra khi xóa danh mục");
        } finally {
            setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    const openDeleteDialog = (category: Category) => {
        setDeleteDialog({
            isOpen: true,
            categoryId: category.id,
            categoryName: category.name,
            isDeleting: false,
        });
    };

    const handlePageChange = (newPage: number) => {
        setMetadata((prev) => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    const handlePageSizeChange = (newSize: string) => {
        setMetadata((prev) => ({
            ...prev,
            currentPage: 0, // Reset to first page
            pageSize: parseInt(newSize),
        }));
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const startIndex = metadata.currentPage * metadata.pageSize + 1;
    const endIndex = Math.min(
        (metadata.currentPage + 1) * metadata.pageSize,
        metadata.totalElements
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Quản lý danh mục
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý các danh mục sản phẩm trong hệ thống
                    </p>
                </div>
                <Button
                    onClick={openCreateForm}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Thêm danh mục
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng danh mục
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metadata.totalElements}
                        </div>
                    </CardContent>
                </Card>
                <div className="md:col-span-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách danh mục</CardTitle>
                            <CardDescription>
                                Hiển thị {startIndex}-{endIndex} của{" "}
                                {metadata.totalElements} danh mục
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Hiển thị:
                            </span>
                            <Select
                                value={metadata.pageSize.toString()}
                                onValueChange={handlePageSizeChange}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(metadata.pageSize)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hình ảnh</TableHead>
                                        <TableHead>Tên danh mục</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead className="text-right">
                                            Thao tác
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                Không có danh mục nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell>
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-12 w-12 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {category.name}
                                                </TableCell>
                                                <TableCell>
                                                    {category.description ||
                                                        "Chưa có mô tả"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        #{category.id}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    category
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    category
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {metadata.totalPage > 1 && (
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Trang {metadata.currentPage + 1} của{" "}
                                        {metadata.totalPage}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    metadata.currentPage - 1
                                                )
                                            }
                                            disabled={
                                                metadata.currentPage === 0
                                            }
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Trước
                                        </Button>

                                        {/* Page numbers */}
                                        <div className="flex items-center space-x-1">
                                            {[...Array(metadata.totalPage)].map(
                                                (_, index) => {
                                                    // Show first, last, current and adjacent pages
                                                    if (
                                                        index === 0 ||
                                                        index ===
                                                            metadata.totalPage -
                                                                1 ||
                                                        (index >=
                                                            metadata.currentPage -
                                                                1 &&
                                                            index <=
                                                                metadata.currentPage +
                                                                    1)
                                                    ) {
                                                        return (
                                                            <Button
                                                                key={index}
                                                                variant={
                                                                    index ===
                                                                    metadata.currentPage
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        index
                                                                    )
                                                                }
                                                                className="w-9"
                                                            >
                                                                {index + 1}
                                                            </Button>
                                                        );
                                                    } else if (
                                                        index ===
                                                            metadata.currentPage -
                                                                2 ||
                                                        index ===
                                                            metadata.currentPage +
                                                                2
                                                    ) {
                                                        return (
                                                            <span
                                                                key={index}
                                                                className="px-1"
                                                            >
                                                                ...
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                }
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    metadata.currentPage + 1
                                                )
                                            }
                                            disabled={
                                                metadata.currentPage >=
                                                metadata.totalPage - 1
                                            }
                                        >
                                            Sau
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Form Modal */}
            <Dialog
                open={showForm}
                onOpenChange={(open) => !open && closeForm()}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory
                                ? "Chỉnh sửa danh mục"
                                : "Thêm danh mục mới"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên danh mục</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Nhập tên danh mục"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                                id="description"
                                type="text"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Nhập mô tả danh mục (tùy chọn)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Hình ảnh</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        image: e.target.files?.[0] || null,
                                    }))
                                }
                                required={!editingCategory}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog({
                            isOpen: false,
                            categoryId: null,
                            categoryName: "",
                            isDeleting: false,
                        });
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục "
                            {deleteDialog.categoryName}"? Hành động này không
                            thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={deleteDialog.isDeleting}
                            onClick={() =>
                                setDeleteDialog({
                                    isOpen: false,
                                    categoryId: null,
                                    categoryName: "",
                                    isDeleting: false,
                                })
                            }
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
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

export default CategoryManagementPage;
