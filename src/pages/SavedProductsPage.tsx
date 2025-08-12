import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Trash2, Heart, Package } from "lucide-react";
import { toast } from "sonner";
import savedProductService, {
    type SavedProduct,
} from "../services/savedProductService";
import { cartApiService } from "../services/cartApiService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const SavedProductsPage: React.FC = () => {
    const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
    const [isRemoving, setIsRemoving] = useState<number | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [productToRemove, setProductToRemove] = useState<SavedProduct | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);

    // Fetch saved products
    const fetchSavedProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await savedProductService.getSavedProducts();

            if (response.success && response.data) {
                setSavedProducts(response.data || []);
            } else {
                throw new Error(
                    response.message ||
                        "Không thể tải danh sách sản phẩm đã lưu"
                );
            }
        } catch (error: unknown) {
            console.error("Error fetching saved products:", error);
            const err = error as { message?: string };
            setError(err.message || "Có lỗi xảy ra khi tải danh sách sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedProducts();
    }, []);

    // Add to cart
    const handleAddToCart = async (savedProduct: SavedProduct) => {
        try {
            setIsAddingToCart(savedProduct.stock.id);

            await cartApiService.addToCart({
                productId: savedProduct.stock.product.id,
                stockId: savedProduct.stock.id,
                quantity: 1,
            });

            toast.success("Đã thêm vào giỏ hàng", {
                description: `${savedProduct.stock.product.name} đã được thêm vào giỏ hàng`,
                duration: 3000,
                action: {
                    label: "Xem giỏ hàng",
                    onClick: () => {
                        window.location.href = "/cart";
                    },
                },
            });
        } catch (error: unknown) {
            console.error("Error adding to cart:", error);
            const err = error as { message?: string };
            toast.error("Lỗi", {
                description:
                    err.message || "Không thể thêm sản phẩm vào giỏ hàng",
                duration: 5000,
            });
        } finally {
            setIsAddingToCart(null);
        }
    };

    // Remove from saved
    const handleRemoveFromSaved = async (stockId: number) => {
        try {
            setIsRemoving(stockId);

            await savedProductService.unsaveProduct(stockId);

            // Remove from local state
            setSavedProducts((prev) =>
                prev.filter((item) => item.stock.id !== stockId)
            );

            toast.success("Đã xóa khỏi danh sách yêu thích", {
                duration: 3000,
            });
        } catch (error: unknown) {
            console.error("Error removing from saved:", error);
            const err = error as { message?: string };
            toast.error("Lỗi", {
                description:
                    err.message ||
                    "Không thể xóa sản phẩm khỏi danh sách yêu thích",
                duration: 5000,
            });
        } finally {
            setIsRemoving(null);
        }
    };

    // Show remove confirmation dialog
    const handleShowRemoveDialog = (savedProduct: SavedProduct) => {
        setProductToRemove(savedProduct);
        setShowRemoveDialog(true);
    };

    // Confirm remove product
    const handleConfirmRemove = async () => {
        if (productToRemove) {
            await handleRemoveFromSaved(productToRemove.stock.id);
            setShowRemoveDialog(false);
            setProductToRemove(null);
        }
    };

    // Format date
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

    // Navigate to product page
    const navigateToProduct = (categoryId: number, productId: number) => {
        // Assuming product URL structure - you may need to adjust this
        window.location.href = `/product/${categoryId}/${productId}`;
    };

    return (
        <div className="min-h-screen bg-foreground/5">
            <Helmet>
                <title>Sản phẩm yêu thích - Apple Store</title>
                <meta
                    name="description"
                    content="Xem và quản lý danh sách sản phẩm yêu thích của bạn"
                />
            </Helmet>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="text-center my-12">
                    <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
                        Sản phẩm yêu thích
                    </h1>
                    <p className="text-lg font-light text-muted-foreground">
                        Những sản phẩm bạn đã lưu để mua sau
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="mb-6">
                        <CardContent className="p-6 text-center">
                            <div className="text-red-600 mb-4">
                                <Package className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-lg font-medium">
                                    Có lỗi xảy ra
                                </p>
                                <p className="text-sm">{error}</p>
                            </div>
                            <Button
                                onClick={fetchSavedProducts}
                                variant="outline"
                            >
                                Thử lại
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <CardContent className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2 mb-4" />
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <>
                        {savedProducts.length === 0 ? (
                            /* Empty State */
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Heart
                                        strokeWidth={1}
                                        className="w-16 h-16 mx-auto mb-4 text-foreground"
                                    />
                                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                                        Chưa có sản phẩm yêu thích
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Hãy khám phá và lưu những sản phẩm bạn
                                        yêu thích
                                    </p>
                                    <Button
                                        onClick={() =>
                                            (window.location.href = "/")
                                        }
                                        className="bg-blue-500 hover:bg-blue-700 text-white hover:text-white"
                                    >
                                        Khám phá sản phẩm
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Actions Bar */}
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-foreground">
                                        {savedProducts.length} sản phẩm đã lưu
                                    </p>
                                </div>

                                {/* Products Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedProducts.map((savedProduct) => (
                                        <Card
                                            key={savedProduct.stock.id}
                                            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group pt-0 flex flex-col h-full"
                                        >
                                            {/* Product Image */}
                                            <div className="relative h-64">
                                                <div
                                                    className="h-48 bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        navigateToProduct(
                                                            savedProduct.stock
                                                                .categoryId,
                                                            savedProduct.stock
                                                                .product.id
                                                        )
                                                    }
                                                >
                                                    {savedProduct.stock
                                                        .productPhotos.length >
                                                    0 ? (
                                                        <img
                                                            src={
                                                                savedProduct
                                                                    .stock
                                                                    .productPhotos[0]
                                                                    .imageUrl
                                                            }
                                                            alt={
                                                                savedProduct
                                                                    .stock
                                                                    .product
                                                                    .name
                                                            }
                                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() =>
                                                        handleShowRemoveDialog(
                                                            savedProduct
                                                        )
                                                    }
                                                    disabled={
                                                        isRemoving ===
                                                        savedProduct.stock.id
                                                    }
                                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition duration-200 disabled:opacity-50 group-hover:opacity-100 opacity-0"
                                                    aria-label="Xóa khỏi yêu thích"
                                                >
                                                    {isRemoving ===
                                                    savedProduct.stock.id ? (
                                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    )}
                                                </button>

                                                {/* Color Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                                        style={{
                                                            backgroundColor:
                                                                savedProduct
                                                                    .stock.color
                                                                    .hexCode,
                                                        }}
                                                        title={
                                                            savedProduct.stock
                                                                .color.name
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <CardContent className="p-4 pt-0 flex flex-col flex-1">
                                                {/* Product Title and Basic Info */}
                                                <div className="flex-1">
                                                    <h3
                                                        className="font-semibold text-lg text-foreground mb-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                                                        onClick={() =>
                                                            navigateToProduct(
                                                                savedProduct
                                                                    .stock
                                                                    .categoryId,
                                                                savedProduct
                                                                    .stock
                                                                    .product.id
                                                            )
                                                        }
                                                    >
                                                        {
                                                            savedProduct.stock
                                                                .product.name
                                                        }{" "}
                                                        {savedProduct.stock.instanceProperties.map(
                                                            (prop, index) => (
                                                                <span
                                                                    key={
                                                                        prop.id
                                                                    }
                                                                >
                                                                    {prop.name}
                                                                    {index <
                                                                        savedProduct
                                                                            .stock
                                                                            .instanceProperties
                                                                            .length -
                                                                            1 &&
                                                                        " "}
                                                                </span>
                                                            )
                                                        )}{" "}
                                                        {
                                                            savedProduct.stock
                                                                .color.name
                                                        }
                                                    </h3>

                                                    {/* Price */}
                                                    <div className="text-sm font-light text-muted-foreground">
                                                        Từ{" "}
                                                        {savedProduct.stock.price.toLocaleString(
                                                            "vi-VN",
                                                            {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Add to Cart Button - Always at bottom */}
                                                <div className="mt-auto">
                                                    {/* Accordion with details */}
                                                    <Accordion
                                                        type="single"
                                                        collapsible
                                                    >
                                                        <AccordionItem
                                                            value={`saved-${savedProduct.stock.id}`}
                                                        >
                                                            <AccordionTrigger>
                                                                Xem thêm
                                                            </AccordionTrigger>
                                                            <AccordionContent className="space-y-2">
                                                                <div>
                                                                    Thanh toán
                                                                    toàn bộ hoặc
                                                                    trả góp qua
                                                                    PayPal hoặc
                                                                    VnPay.
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Phí vận
                                                                    chuyển:
                                                                    <span className="font-medium ml-1 text-foreground">
                                                                        40.000đ
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Đã lưu:{" "}
                                                                    {formatDate(
                                                                        savedProduct.createdAt
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                    <button
                                                        onClick={() =>
                                                            handleAddToCart(
                                                                savedProduct
                                                            )
                                                        }
                                                        disabled={
                                                            isAddingToCart ===
                                                            savedProduct.stock
                                                                .id
                                                        }
                                                        className="w-full text-sm cursor-pointer transition-colors rounded-full font-normal py-3 bg-blue-600 hover:bg-blue-500 text-white"
                                                    >
                                                        {isAddingToCart ===
                                                        savedProduct.stock
                                                            .id ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                                                                Đang thêm...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Thêm vào giỏ
                                                                hàng
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Remove Single Product Dialog */}
                <AlertDialog
                    open={showRemoveDialog}
                    onOpenChange={setShowRemoveDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Xóa sản phẩm khỏi danh sách yêu thích?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {productToRemove && (
                                    <>
                                        Bạn có chắc chắn muốn xóa{" "}
                                        <span className="font-medium text-foreground">
                                            {productToRemove.stock.product.name}
                                        </span>{" "}
                                        khỏi danh sách yêu thích?
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmRemove}
                                disabled={
                                    isRemoving === productToRemove?.stock.id
                                }
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isRemoving === productToRemove?.stock.id
                                    ? "Đang xóa..."
                                    : "Xóa"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default SavedProductsPage;
