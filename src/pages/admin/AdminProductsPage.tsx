import React, {useEffect, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {ChevronLeft, ChevronRight, Plus, Search} from "lucide-react";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
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
import {Skeleton} from "@/components/ui/skeleton";
import adminProductService, {type AdminProduct, type ProductSearchParams,} from "../../services/adminProductService";
import {type Product, ProductDataTable,} from "@/components/product-data-table";
import AdvancedProductSearch from "@/components/AdvancedProductSearch";

import type {MetadataResponse} from "@/types/api.ts";

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
                    stock.productPhotos?.map((photo) => ({
                        id: photo.id,
                        imageUrl: photo.imageUrl,
                        alt: photo.alt,
                    })) || [],
            })) || [],
        features:
            adminProduct.features?.map((feature) => ({
                id: feature.id,
                name: feature.name,
                image: "", // AdminProduct features don't have images, so we use empty string
            })) || [],
        isDeleted: adminProduct.isDeleted,
    };
};

const AdminProductsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchParams, setSearchParams] = useState<ProductSearchParams>({
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
        searchKeyword: "",
    })
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
        categoryId?: number;
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
        error: unknown;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    const searchParamsResets: ProductSearchParams = {
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
        searchKeyword: "",
    }

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
            };

            const response = await adminProductService.getAdminProducts(params);

            if (response.success && response.data) {
                const mappedProducts = response.data.map(transformToProduct);

                const result = {
                    products: mappedProducts,
                    meta: response.meta || {
                        currentPage: 0,
                        pageSize: mappedProducts.length,
                        totalElements: mappedProducts.length,
                        totalPage: 1,
                    },
                };

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
                throw new Error(response.message || "Failed to fetch products");
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

    useEffect(() => {
        handleAdvancedSearch(searchParams);
    }, [searchParams.page, debouncedSearchTerm, selectedCategory]);

    // Advanced search function
    const handleAdvancedSearch = async (searchParams: ProductSearchParams) => {
        try {
            setProductsState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            const response = await adminProductService.searchProducts(
                searchParams
            );

            if (response.success && response.data) {
                const mappedProducts = response.data.map(transformToProduct);
                setProductsState({
                    data: {
                        products: mappedProducts,
                        meta: {
                            currentPage: searchParams.page || 0,
                            pageSize: searchParams.size || 10,
                            totalElements:
                                response.meta?.totalElements ||
                                mappedProducts.length,
                            totalPage: Math.ceil(
                                (response.meta?.totalElements ||
                                    mappedProducts.length) /
                                    (searchParams.size || 10)
                            ),
                        },
                    },
                    loading: false,
                    error: null,
                });

                setMetadata({
                    currentPage: searchParams.page || 0,
                    pageSize: searchParams.size || 10,
                    totalElements:
                        response.meta?.totalElements || mappedProducts.length,
                    totalPage: Math.ceil(
                        (response.meta?.totalElements ||
                            mappedProducts.length) / (searchParams.size || 10)
                    ),
                });
            }
        } catch (error) {
            console.error("Advanced search error:", error);
            setProductsState((prev) => ({
                ...prev,
                loading: false,
                error,
            }));
        }
    };

    // Reset search function
    const handleResetSearch = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMetadata((prev) => ({ ...prev, currentPage: 0 }));
        handleAdvancedSearch(searchParamsResets);
    };

    // Use useState data instead of useQuery
    const productsData = productsState.data;
    const isLoading = productsState.loading;
    const isErrorProducts = !!productsState.error;

    const openDeleteDialog = (
        productId: number,
        productName: string,
        categoryId: number
    ) => {
        setDeleteDialog({
            isOpen: true,
            productId,
            productName,
            categoryId,
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
            adminProductService.deleteProduct(
                productId,
                productsData?.products.find((p) => p.id === productId)
                    ?.categoryId || 0
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            closeDeleteDialog();
            // Refetch products after successful deletion
            fetchProducts();
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
                    {/* Advanced Search */}
                    <div>
                        <AdvancedProductSearch
                            onSearch={handleAdvancedSearch}
                            onReset={handleResetSearch}
                            loading={isLoading}
                            setSearchParams={setSearchParams}
                        />
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
                                    (window.location.href = `/admin/products/${categoryId}/${productId}`)
                                }
                                onEdit={(productId, categoryId) =>
                                    (window.location.href = `/admin/products/${categoryId}/${productId}/edit`)
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
                                        /*setMetadata((prev) => ({
                                            ...prev,
                                            currentPage: Math.max(
                                                0,
                                                prev.currentPage - 1
                                            ),
                                        }))*/
                                        setSearchParams((prev) => ({
                                            ...prev,
                                            page: Math.max(
                                                0,
                                                Math.max(
                                                    0,
                                                    prev.page - 1
                                                )
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
                                                className={`bg-transparent hover:bg-transparent text-foreground shadow-none ${
                                                    metadata.currentPage ===
                                                    pageNumber
                                                        ? "underline"
                                                        : ""
                                                }`}
                                                size="sm"
                                                onClick={() =>
                                                    /*setMetadata((prev) => ({
                                                        ...prev,
                                                        currentPage: pageNumber,
                                                    }))*/
                                                    setSearchParams((prev) => ({
                                                        ...prev,
                                                        page: pageNumber,
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
                                        /*setMetadata((prev) => ({
                                            ...prev,
                                            currentPage: Math.min(
                                                prev.currentPage + 1,
                                                metadata.totalPage - 1
                                            ),
                                        }))*/
                                        setSearchParams((prev) => ({
                                            ...prev,
                                            page: Math.min(
                                                Math.min(
                                                    metadata.currentPage + 1,
                                                )
                                            )
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
                        <AlertDialogTitle>
                            Xác nhận thao tác với sản phẩm "{deleteDialog.productName}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn thực hiện hành động này với sản phẩm "
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
                            {deleteDialog.isDeleting ? "Đang thực hiện..." : "Tiếp tục"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProductsPage;
