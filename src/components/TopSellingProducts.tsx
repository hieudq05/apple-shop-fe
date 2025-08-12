import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import productService, { type Product } from "@/services/productService";

interface TopSellingProductsProps {
    categoryId: number;
    currentProductId?: number; // Để loại trừ sản phẩm hiện tại
    limit?: number;
}

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({
    categoryId,
    currentProductId,
    limit = 6,
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopSellingProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await productService.getTopSellingProducts(
                    categoryId,
                    0,
                    limit + 1 // Lấy thêm 1 sản phẩm để có thể loại trừ sản phẩm hiện tại
                );

                if (response.success && response.data) {
                    let filteredProducts = response.data;

                    // Loại trừ sản phẩm hiện tại nếu có
                    if (currentProductId) {
                        filteredProducts = filteredProducts.filter(
                            (product) => product.id !== currentProductId
                        );
                    }

                    // Giới hạn số lượng sản phẩm hiển thị
                    setProducts(filteredProducts.slice(0, limit));
                } else {
                    throw new Error(
                        response.message || "Không thể tải sản phẩm bán chạy"
                    );
                }
            } catch (error: unknown) {
                console.error("Error fetching top selling products:", error);
                const err = error as { message?: string };
                setError(err.message || "Có lỗi xảy ra khi tải sản phẩm");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopSellingProducts();
    }, [categoryId, currentProductId, limit]);

    // Navigate to product page
    const navigateToProduct = (product: Product) => {
        window.location.href = `/product/${categoryId}/${product.id}`;
    };

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-5 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="pt-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-semibold text-foreground">
                            Sản phẩm bán chạy
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Những sản phẩm được yêu thích nhất trong danh mục
                            này
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 px-6">
                        {products.map((product, index) => (
                            <Card
                                key={product.id}
                                className="overflow-hidden pt-0 shadow-none hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                                onClick={() => navigateToProduct(product)}
                            >
                                {/* Product Image */}
                                <div className="relative h-64 bg-gray-100">
                                    {product.images &&
                                    product.images.length > 0 ? (
                                        <img
                                            src={
                                                product.images.sort(
                                                    (a, b) => a.id - b.id
                                                )[0].imageUrl
                                            }
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : product.stocks &&
                                      product.stocks.length > 0 &&
                                      product.stocks[0].productPhotos &&
                                      product.stocks[0].productPhotos.length >
                                          0 ? (
                                        <img
                                            src={
                                                product.stocks
                                                    .sort(
                                                        (a, b) => a.id - b.id
                                                    )[0]
                                                    .productPhotos.sort(
                                                        (a, b) => b.id - a.id
                                                    )[0].imageUrl
                                            }
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-300 rounded" />
                                        </div>
                                    )}

                                    {/* Best seller badge */}
                                    {index < 3 && (
                                        <div className="absolute top-3 left-3 bg-foreground text-white text-xs font-medium px-2 py-1 rounded-full">
                                            #{index + 1} Bán chạy
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <CardContent className="p-4 pt-0">
                                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    {product.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-semibold text-foreground">
                                            {product.price ? (
                                                <>
                                                    {product.price.toLocaleString(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }
                                                    )}
                                                    {product.originalPrice &&
                                                        product.originalPrice >
                                                            product.price && (
                                                            <span className="text-sm text-muted-foreground line-through ml-2">
                                                                {product.originalPrice.toLocaleString(
                                                                    "vi-VN",
                                                                    {
                                                                        style: "currency",
                                                                        currency:
                                                                            "VND",
                                                                    }
                                                                )}
                                                            </span>
                                                        )}
                                                </>
                                            ) : product.stocks &&
                                              product.stocks.length > 0 ? (
                                                `Từ ${product.stocks[0].price.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}`
                                            ) : (
                                                "Liên hệ"
                                            )}
                                        </div>

                                        {/* Rating */}
                                        {product.rating && (
                                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                                                <span>★</span>
                                                <span>
                                                    {product.rating.toFixed(1)}
                                                </span>
                                                {product.reviewCount && (
                                                    <span className="text-muted-foreground">
                                                        ({product.reviewCount})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default TopSellingProducts;
