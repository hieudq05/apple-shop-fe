import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useRoutes } from "react-router-dom";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import adminProductService, {
    type AdminProduct,
} from "../../services/adminProductService";
import {
    ProductDataTable,
    type Product,
} from "@/components/product-data-table";

import type { MetadataResponse } from "@/types/api.ts";

// Transform AdminProduct to Product interface for the data table
const transformToProduct = (adminProduct: AdminProduct): Product => {
    return {
        id: adminProduct.id,
        name: adminProduct.name,
        description: adminProduct.description || null,
        categoryId: adminProduct.categoryId || 0,
        categoryName: adminProduct.categoryName || "Không có danh mục",
        createdAt: adminProduct.createdAt,
        updatedAt: adminProduct.updatedAt,
        stocks:
            adminProduct.stocks?.map((stock) => ({
                id: stock.id,
                productId: adminProduct.id,
                colorId: stock.colorId,
                colorName: stock.colorName,
                colorHexCode: stock.colorHexCode,
                quantity: stock.quantity,
                price: stock.price,
                productPhotos:
                    stock.photos?.map((photo, index) => ({
                        id: index,
                        imageUrl: photo,
                        alt: `${adminProduct.name} - ${stock.color.name}`,
                    })) || [],
            })) || [],
        features:
            adminProduct.features?.map((feature) => ({
                id: feature.id,
                name: feature.name,
                image: "", // AdminProduct features don't have images, so we use empty string
            })) || [],
    };
};

const AdminProductsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [metadata, setMetadata] = useState<MetadataResponse>({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPage: 0,
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        productId: number | null;
        productName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        productId: null,
        productName: "",
        isDeleting: false,
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // State for fetching products
    const [productsState, setProductsState] = useState<{
        data: { products: Product[]; meta: MetadataResponse } | null;
        loading: boolean;
        error: any;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsState((prev) => ({
                    ...prev,
                    loading: true,
                    error: null,
                }));
                console.log("Fetching with useState...");

                const params = {
                    page: metadata.currentPage,
                    size: metadata.pageSize,
                    search: debouncedSearchTerm || undefined,
                    categoryId:
                        selectedCategory && selectedCategory !== "all"
                            ? parseInt(selectedCategory)
                            : undefined,
                };

                const response = await adminProductService.getAdminProducts(
                    params
                );
                console.log("useState response:", response);

                if (response.success && response.data) {
                    const mappedProducts =
                        response.data.map(transformToProduct);

                    const result = {
                        products: mappedProducts,
                        meta: response.meta || {
                            currentPage: 0,
                            pageSize: mappedProducts.length,
                            totalElements: mappedProducts.length,
                            totalPage: 1,
                        },
                    };

                    console.log("useState result:", result);
                    setProductsState({
                        data: result,
                        loading: false,
                        error: null,
                    });
                    setMetadata(
                        response.meta || {
                            currentPage: 0,
                            pageSize: 10,
                            totalElements: 0,
                            totalPage: 0,
                        }
                    );
                } else {
                    throw new Error(
                        response.message || "Failed to fetch products"
                    );
                }
            } catch (error) {
                console.error("useState error:", error);
                setProductsState((prev) => ({
                    ...prev,
                    loading: false,
                    error,
                }));
            }
        };

        fetchProducts();
    }, [metadata.currentPage, debouncedSearchTerm, selectedCategory]);

    // Use useState data instead of useQuery
    const productsData = productsState.data;
    const isLoading = productsState.loading;
    const isErrorProducts = !!productsState.error;

    const openDeleteDialog = (productId: number, productName: string) => {
        setDeleteDialog({
            isOpen: true,
            productId,
            productName,
            isDeleting: false,
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            productId: null,
            productName: "",
            isDeleting: false,
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (productId: number) =>
            adminProductService.deleteProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            closeDeleteDialog();
            // Refetch products after successful deletion
            setMetadata((prev) => ({ ...prev, currentPage: 0 }));

            toast.success("Xóa sản phẩm thành công", {
                description: `Sản phẩm "${deleteDialog.productName}" đã được xóa khỏi hệ thống`,
                duration: 4000,
            });
        },
        onError: (error) => {
            console.error("Error deleting product:", error);
            setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));

            toast.error("Không thể xóa sản phẩm", {
                description:
                    "Vui lòng thử lại sau hoặc liên hệ admin nếu vấn đề vẫn tiếp diễn.",
                duration: 5000,
            });
        },
    });

    const handleDeleteProduct = () => {
        if (deleteDialog.productId) {
            setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

            toast.loading("Đang xóa sản phẩm...", {
                description: "Vui lòng đợi trong giây lát",
                duration: Infinity, // Will be dismissed when mutation completes
            });

            deleteMutation.mutate(deleteDialog.productId);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">
                                Quản lý sản phẩm
                            </CardTitle>
                            <CardDescription>
                                Quản lý danh sách sản phẩm của cửa hàng
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link to="/admin/products/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm sản phẩm
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Select
                                value={selectedCategory || undefined}
                                onValueChange={(value) =>
                                    setSelectedCategory(value || "")
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Tất cả danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả danh mục
                                    </SelectItem>
                                    <SelectItem value="1">iPhone</SelectItem>
                                    <SelectItem value="2">Mac</SelectItem>
                                    <SelectItem value="3">iPad</SelectItem>
                                    <SelectItem value="4">
                                        Apple Watch
                                    </SelectItem>
                                    <SelectItem value="5">AirPods</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-4"
                                >
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {isErrorProducts && (
                <Card>
                    <CardContent className="p-6 text-center text-destructive">
                        Đã có lỗi xảy ra khi tải danh sách sản phẩm.
                    </CardContent>
                </Card>
            )}

            {/* Products Table */}
            {!isLoading &&
                !isErrorProducts &&
                productsData?.products &&
                productsData.products.length > 0 && (
                    <div>
                        <CardContent className="pb-4 px-0">
                            <ProductDataTable
                                data={productsData.products}
                                // Navigate to product view by react-router-dom
                                onView={(productId, categoryId) =>
                                    window.open(
                                        `/admin/products/${categoryId}/${productId}`,
                                        "_blank"
                                    )
                                }
                                onEdit={(productId, categoryId) =>
                                    window.open(
                                        `/admin/products/${categoryId}/${productId}/edit`,
                                        "_blank"
                                    )
                                }
                                onDelete={openDeleteDialog}
                            />
                        </CardContent>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 text-sm text-muted-foreground">
                                Hiển thị{" "}
                                <span className="font-medium">
                                    {metadata.totalElements === 0
                                        ? 0
                                        : metadata.currentPage *
                                              metadata.pageSize +
                                          1}
                                </span>{" "}
                                -{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        (metadata.currentPage + 1) *
                                            metadata.pageSize,
                                        metadata.totalElements
                                    )}
                                </span>{" "}
                                trong{" "}
                                <span className="font-medium">
                                    {metadata.totalElements}
                                </span>{" "}
                                kết quả
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setMetadata((prev) => ({
                                            ...prev,
                                            currentPage: Math.max(
                                                0,
                                                prev.currentPage - 1
                                            ),
                                        }))
                                    }
                                    disabled={metadata.currentPage === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center space-x-1">
                                    {[
                                        ...Array(
                                            Math.min(metadata.totalPage, 5)
                                        ),
                                    ].map((_, i) => {
                                        const pageNumber =
                                            metadata.currentPage > 2
                                                ? metadata.currentPage - 2 + i
                                                : i;
                                        return pageNumber <
                                            metadata.totalPage ? (
                                            <Button
                                                key={pageNumber}
                                                className={`bg-transparent hover:bg-transparent text-black shadow-none ${
                                                    metadata.currentPage ===
                                                    pageNumber
                                                        ? "underline"
                                                        : ""
                                                }`}
                                                size="sm"
                                                onClick={() =>
                                                    setMetadata((prev) => ({
                                                        ...prev,
                                                        currentPage: pageNumber,
                                                    }))
                                                }
                                            >
                                                {pageNumber + 1}
                                            </Button>
                                        ) : null;
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setMetadata((prev) => ({
                                            ...prev,
                                            currentPage: Math.min(
                                                prev.currentPage + 1,
                                                metadata.totalPage - 1
                                            ),
                                        }))
                                    }
                                    disabled={
                                        metadata.currentPage ===
                                        metadata.totalPage - 1
                                    }
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Empty State */}
            {!isLoading &&
                !isErrorProducts &&
                productsData?.products.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-muted rounded-full">
                                <Search className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm ||
                                (selectedCategory && selectedCategory !== "all")
                                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                    : "Chưa có sản phẩm nào trong hệ thống"}
                            </p>
                            {!searchTerm &&
                                (!selectedCategory ||
                                    selectedCategory === "all") && (
                                    <Button asChild>
                                        <Link to="/admin/products/create">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm sản phẩm đầu tiên
                                        </Link>
                                    </Button>
                                )}
                        </CardContent>
                    </Card>
                )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.isOpen}
                onOpenChange={closeDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm "
                            {deleteDialog.productName}"? Hành động này không thể
                            hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={deleteDialog.isDeleting}
                        >
                            {deleteDialog.isDeleting ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProductsPage;
