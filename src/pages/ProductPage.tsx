import React, { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import productService from "@/services/productService";
import { cartApiService } from "../services/cartApiService";
import savedProductService from "../services/savedProductService";
import TopSellingProducts from "@/components/TopSellingProducts";
// import ProductReviews from "@/components/ProductReviews";
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
import { AlertCircle, Bookmark } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ProductReviews from "@/components/ProductReviews";

// Define a more flexible stock interface to handle API responses
interface ApiStock {
    id: number;
    color: {
        id: number;
        name: string;
        hexCode: string;
    };
    imageUrl?: string;
    price: number;
    productPhotos?: {
        id: number;
        imageUrl: string;
        alt: string;
    }[];
    quantity?: number;
    instanceProperty?: InstanceProperty[];
    instanceProperties?: InstanceProperty[]; // Alternate field name from API
}

// Utility function to group stocks by color
const groupStocksByColor = (stocks: ApiStock[]): ProductStock[] => {
    const colorMap: { [colorId: number]: ProductStock } = {};

    stocks.forEach((stock) => {
        const colorId = stock.color.id;

        // Handle API response which might use instanceProperties (plural) instead of instanceProperty (singular)
        const properties =
            stock.instanceProperty || stock.instanceProperties || [];

        // If we haven't seen this color before, initialize it
        if (!colorMap[colorId]) {
            colorMap[colorId] = {
                id: stock.id,
                color: stock.color,
                imageUrl: stock.imageUrl,
                price: stock.price,
                productPhotos: stock.productPhotos || [],
                quantity: stock.quantity || 0,
                instanceProperty: [...properties],
                allStocks: [stock], // Keep track of all stocks for this color
            };
        } else {
            // If we have seen this color, merge the data
            const existingStock = colorMap[colorId];

            // Merge instanceProperty arrays - avoid duplicates by id
            properties.forEach((property: InstanceProperty) => {
                const propertyExists = existingStock.instanceProperty.some(
                    (existingProperty) => existingProperty.id === property.id
                );

                if (!propertyExists) {
                    existingStock.instanceProperty.push(property);
                }
            });

            // Accumulate quantities from all stocks of the same color
            existingStock.quantity =
                (existingStock.quantity || 0) + (stock.quantity || 0);

            // Add to allStocks array
            existingStock.allStocks?.push(stock);

            // Use the stock with productPhotos if current doesn't have any
            if (
                (!existingStock.productPhotos ||
                    existingStock.productPhotos.length === 0) &&
                stock.productPhotos &&
                stock.productPhotos.length > 0
            ) {
                existingStock.productPhotos = stock.productPhotos;
                existingStock.imageUrl = stock.imageUrl;
            }
        }
    });

    // Convert the map back to an array
    return Object.values(colorMap);
};

interface ProductStock {
    id: number;
    color: {
        id: number;
        name: string;
        hexCode: string;
    };
    imageUrl?: string;
    price: number;
    productPhotos?: {
        id: number;
        imageUrl: string;
        alt: string;
    }[];
    instanceProperty: InstanceProperty[];
    quantity?: number;
    allStocks?: ApiStock[]; // Keep track of all stocks for this color
}

interface InstanceProperty {
    id: number;
    name: string;
    price?: number; // Optional if not used
}

export interface ProductProps {
    id: number;
    name: string;
    description?: string;
    stocks: ProductStock[];
}

const ProductPage: React.FC = () => {
    // Get product ID from end path URL
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const categoryId = pathParts[pathParts.length - 2];
    const [product, setProduct] = useState<ProductProps | null>(null);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await productService.getProductById(
                Number(id),
                Number(categoryId)
            );
            if (response.success && response.data) {
                // Group stocks by color and update the product data
                const groupedData = {
                    ...response.data,
                    stocks: groupStocksByColor(response.data.stocks || []),
                };
                setProduct(groupedData);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [id, categoryId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedStock = product?.stocks
        ? product.stocks[selectedIndex]
        : null;
    const [isDialogErrorOpen, setIsDialogErrorOpen] = useState(false);
    const [errorWhenAddingToCart, setErrorWhenAddingToCart] = useState("");
    const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const [isSaved, setIsSaved] = useState(false);
    const [isCheckingSaved, setIsCheckingSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const checkSavedStatus = useCallback(async (stockId: number) => {
        try {
            setIsCheckingSaved(true);
            const response = await savedProductService.checkSavedStatus(
                stockId
            );
            if (response.success) {
                setIsSaved(response.data?.isSaved || false);
            }
        } catch (error) {
            console.error("Error checking saved status:", error);
            // Don't show error to user for this non-critical operation
        } finally {
            setIsCheckingSaved(false);
        }
    }, []);

    const handleToggleSave = async () => {
        if (!selectedStockId) return;

        try {
            setIsSaving(true);

            if (isSaved) {
                // Unsave the product
                await savedProductService.unsaveProduct(selectedStockId);
                setIsSaved(false);
            } else {
                // Save the product
                await savedProductService.saveProduct(selectedStockId);
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error toggling save status:", error);
            // Show error to user
            setIsDialogErrorOpen(true);
            setErrorWhenAddingToCart(
                "Không thể thực hiện thao tác lưu sản phẩm. Vui lòng thử lại."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedStock || !product) return;

        // Find the actual selected stock from allStocks
        const actualSelectedStock = selectedStockId
            ? selectedStock.allStocks?.find(
                  (stock) => stock.id === selectedStockId
              )
            : selectedStock.allStocks?.[0] || selectedStock;

        if (!actualSelectedStock) return;

        try {
            setIsAddingToCart(true);

            // Add to cart using API
            const response = await cartApiService.addToCart({
                productId: product.id,
                stockId: actualSelectedStock.id,
                quantity: 1,
            });

            if (response.success) {
                // Show success message
                setAddedToCart(true);

                // Hide message after 3 seconds
                setTimeout(() => {
                    setAddedToCart(false);
                }, 3000);

                // Redirect to cart after 1 second
                setTimeout(() => {
                    window.location.href = "/cart";
                }, 1000);
            } else {
                // Show error dialog
                setIsDialogErrorOpen(true);
                setErrorWhenAddingToCart(
                    response.msg || "Không thể thêm vào giỏ hàng"
                );
            }
        } catch (error) {
            setIsDialogErrorOpen(true);
            setErrorWhenAddingToCart("Không thể thêm vào giỏ hàng");
            console.error("Error adding to cart:", error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Reset selected storage when product changes
    useEffect(() => {
        // Auto-select first stock when color changes
        if (selectedStock?.allStocks && selectedStock.allStocks.length > 0) {
            setSelectedStockId(selectedStock.allStocks[0].id);
        } else {
            setSelectedStockId(null);
        }
    }, [selectedIndex, selectedStock]);

    // Also set initial storage when product first loads
    useEffect(() => {
        if (product?.stocks && product.stocks.length > 0) {
            const firstStock = product.stocks[0];
            if (firstStock.allStocks && firstStock.allStocks.length > 0) {
                setSelectedStockId(firstStock.allStocks[0].id);
            }
        }
    }, [product]);

    // ✅ Check saved status when selectedStockId changes
    useEffect(() => {
        if (selectedStockId) {
            checkSavedStatus(selectedStockId);
        } else {
            setIsSaved(false);
        }
    }, [selectedStockId, checkSavedStatus]);

    return (
        <div className="py-12 text-start lg:px-72">
            <Helmet>
                <title>{product?.name || "Sản phẩm"}</title>
                <meta
                    name="description"
                    content={
                        product?.description ||
                        "Mua sản phẩm này tại cửa hàng của chúng tôi."
                    }
                />
            </Helmet>
            <div className={"container mx-auto flex flex-col space-y-12 mb-12"}>
                <div>
                    <h1 className="text-5xl font-medium mb-4">
                        Mua {product?.name}
                    </h1>

                    <h2 className="text-xl font-light mb-1">
                        {product?.description}
                    </h2>
                    <p className={"text-sm font-light"}>
                        Thanh toán toàn bộ hoặc trả góp qua PayPal hoặc VnPay.
                    </p>
                </div>
                <div className={"flex gap-12 flex-col xl:flex-row"}>
                    <div
                        className="items-center overflow-x-auto scrollbar-hide flex-[3] md:relative sticky top-12 z-10"
                        style={{ scrollSnapType: "x mandatory" }}
                    >
                        <img
                            key={selectedStock?.id}
                            src={
                                selectedStock?.productPhotos &&
                                selectedStock.productPhotos.length > 0
                                    ? selectedStock.productPhotos[0].imageUrl
                                    : selectedStock?.imageUrl
                            }
                            alt={product?.name || "Product Image"}
                            className={`w-full object-cover transition duration-500 rounded-2xl mb-4 md:aspect-square aspect-video`}
                            style={{ scrollSnapAlign: "center" }}
                        />
                    </div>
                    <div className={"flex-[2] flex flex-col space-y-28"}>
                        <div>
                            <div className={"text-3xl font-medium"}>
                                Màu.{" "}
                                <span className={"text-muted-foreground"}>
                                    Chọn màu bạn yêu thích.
                                </span>
                            </div>
                            <div className="my-4 text-sm text-muted-foreground">
                                Màu: {selectedStock?.color.name}
                            </div>
                            <div className="flex space-x-3">
                                {product?.stocks?.map((item, idx) => (
                                    <button
                                        key={item.color.id}
                                        className={`relative cursor-pointer size-8 p-0 z-0 transition rounded-full border-2 focus:outline-none ${
                                            selectedIndex === idx
                                                ? "border-blue-600"
                                                : "border-transparent"
                                        }`}
                                        onClick={() => {
                                            setSelectedIndex(idx);
                                        }}
                                        aria-label={item.color.name}
                                    >
                                        <div
                                            className={
                                                "absolute top-[0.155rem] left-[0.15rem] size-6 rounded-full"
                                            }
                                            style={{
                                                backgroundColor:
                                                    item.color.hexCode,
                                                boxShadow: `inset -2px 1px 5px -1px rgba(0,0,0,0.30)`,
                                            }}
                                        ></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={"flex flex-col space-y-4 my-6"}>
                            <div className={"text-3xl font-medium"}>
                                Các thuộc tính khác.{" "}
                                <span className={"text-muted-foreground"}>
                                    Chọn thuộc tính bạn cần.
                                </span>
                            </div>
                            {selectedStock?.allStocks &&
                            selectedStock.allStocks.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedStock.allStocks.map((stock) => (
                                        <button
                                            disabled={stock.quantity === 0}
                                            key={stock.id}
                                            className={`px-4 cursor-pointer py-4 gap-2 flex justify-between items-center rounded-xl w-full border-2 focus:outline-none transition ${
                                                selectedStockId === stock.id
                                                    ? "border-blue-600 bg-blue-500/7"
                                                    : "border-accent hover:bg-foreground/2"
                                            }`}
                                            onClick={() => {
                                                setSelectedStockId(stock.id);
                                            }}
                                            style={{
                                                boxShadow: `inset 0px 0px 10px 0px rgba(133, 133, 133, 0.094)`,
                                            }}
                                        >
                                            <div className="flex gap-2 items-center">
                                                <div className="text-left">
                                                    <div className="text-base font-medium">
                                                        {stock.instanceProperty?.map(
                                                            (
                                                                property,
                                                                propIndex
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        property.id
                                                                    }
                                                                >
                                                                    {
                                                                        property.name
                                                                    }
                                                                    {propIndex <
                                                                        (stock
                                                                            .instanceProperty
                                                                            ?.length ||
                                                                            0) -
                                                                            1 &&
                                                                        " • "}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-normal text-right w-48">
                                                Trả toàn bộ <br />
                                                {stock.price.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}{" "}
                                                <br />
                                                bằng tài khoản <br /> hoặc{" "}
                                                <br /> khi nhận hàng.
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : selectedStock?.instanceProperty &&
                              selectedStock.instanceProperty.length > 0 ? (
                                <div className="space-y-3">
                                    <button className="px-4 py-4 flex justify-between items-center rounded-xl w-full border-2 border-blue-600 bg-blue-50 focus:outline-none transition">
                                        <div className="flex gap-2 items-center">
                                            <div className="text-left">
                                                <div className="text-base font-medium">
                                                    {selectedStock.instanceProperty.map(
                                                        (property, index) => (
                                                            <span
                                                                key={
                                                                    property.id
                                                                }
                                                            >
                                                                {property.name}
                                                                {index <
                                                                    selectedStock
                                                                        .instanceProperty
                                                                        .length -
                                                                        1 &&
                                                                    " • "}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Tổng{" "}
                                                    {
                                                        selectedStock
                                                            .instanceProperty
                                                            .length
                                                    }{" "}
                                                    thuộc tính
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 font-normal text-right w-32">
                                            Trả toàn bộ <br />
                                            {selectedStock.price.toLocaleString(
                                                "vi-VN",
                                                {
                                                    style: "currency",
                                                    currency: "VND",
                                                }
                                            )}{" "}
                                            <br />
                                            bằng tài khoản <br /> hoặc <br />{" "}
                                            khi nhận hàng.
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    Không có thuộc tính nào cho sản phẩm này
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={"bg-muted p-12 rounded-4xl"}>
                <div
                    className={
                        "container mx-auto grid lg:grid-cols-1 grid-cols-2 xl:grid-cols-2 gap-12"
                    }
                >
                    <div className={"flex flex-col space-y-2"}>
                        <div className={"xl:text-4xl text-3xl font-medium"}>
                            {product?.name} mới của bạn.
                            <br />
                            <span className={"text-muted-foreground"}>
                                Theo cách bạn muốn.
                            </span>
                        </div>
                        <div
                            className={
                                "overflow-hidden rounded-2xl aspect-square w-full flex items-center justify-center"
                            }
                        >
                            <div
                                className={
                                    "w-full h-full object-cover relative 2xl:top-24 2xl:scale-200 xl:top-28 lg:top-20 md:top-28 top-18 left-20 scale-250 lg:scale-200 xl:scale-250"
                                }
                                style={{
                                    backgroundImage: `url(${
                                        selectedStock?.productPhotos &&
                                        selectedStock.productPhotos.length > 0
                                            ? selectedStock.productPhotos[0]
                                                  .imageUrl
                                            : selectedStock?.imageUrl
                                    })`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "top",
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className={"flex flex-col space-y-6 text-lg"}>
                        <div className={"flex flex-col gap-3"}>
                            <div className={"font-light"}>
                                {product?.name}{" "}
                                {(() => {
                                    const actualSelectedStock = selectedStockId
                                        ? selectedStock?.allStocks?.find(
                                              (stock) =>
                                                  stock.id === selectedStockId
                                          )
                                        : selectedStock?.allStocks?.[0] ||
                                          selectedStock;

                                    return actualSelectedStock?.instanceProperty &&
                                        actualSelectedStock.instanceProperty
                                            .length > 0 ? (
                                        <span>
                                            {actualSelectedStock.instanceProperty.map(
                                                (property, index) => (
                                                    <span key={property.id}>
                                                        {property.name}
                                                        {index <
                                                            (actualSelectedStock
                                                                .instanceProperty
                                                                ?.length || 0) -
                                                                1 && " • "}
                                                    </span>
                                                )
                                            )}
                                        </span>
                                    ) : null;
                                })()}{" "}
                                {selectedStock?.color?.name}
                            </div>
                            <div>
                                <div>
                                    <span className={"font-medium"}>
                                        Tổng cộng
                                        <div
                                            className={"text-2xl font-semibold"}
                                        >
                                            {(() => {
                                                const actualSelectedStock =
                                                    selectedStockId
                                                        ? selectedStock?.allStocks?.find(
                                                              (stock) =>
                                                                  stock.id ===
                                                                  selectedStockId
                                                          )
                                                        : selectedStock
                                                              ?.allStocks?.[0] ||
                                                          selectedStock;

                                                return actualSelectedStock?.price?.toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                );
                                            })()}
                                        </div>
                                    </span>
                                    <div className={"font-light mt-3"}>
                                        <span className={"font-medium"}>
                                            Thanh toán toàn bộ
                                        </span>{" "}
                                        hoặc{" "}
                                        <span className={"font-medium"}>
                                            trả góp qua PayPal hoặc VnPay
                                        </span>
                                    </div>
                                </div>
                                <div className={"text-xs font-light"}>
                                    Bao gồm thuế GTGT khoảng{" "}
                                    {(() => {
                                        const actualSelectedStock =
                                            selectedStockId
                                                ? selectedStock?.allStocks?.find(
                                                      (stock) =>
                                                          stock.id ===
                                                          selectedStockId
                                                  )
                                                : selectedStock
                                                      ?.allStocks?.[0] ||
                                                  selectedStock;

                                        return (
                                            (actualSelectedStock?.price ?? 0) *
                                            0.1
                                        ).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || !selectedStock}
                                    className="text-sm w-fit flex gap-2 items-center cursor-pointer justify-center font-normal px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingToCart
                                        ? "Đang thêm..."
                                        : "Thêm vào giỏ hàng"}
                                </button>
                                <button
                                    onClick={handleToggleSave}
                                    disabled={
                                        isSaving ||
                                        !selectedStockId ||
                                        isCheckingSaved
                                    }
                                    className={
                                        "text-sm flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-foreground/7 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed" +
                                        (isSaved
                                            ? " hover:text-blue-600 text-blue-500"
                                            : " hover:text-foreground text-muted-foreground")
                                    }
                                    aria-label={
                                        isSaved
                                            ? "Bỏ lưu sản phẩm"
                                            : "Lưu sản phẩm"
                                    }
                                >
                                    {isSaving || isCheckingSaved ? (
                                        <>
                                            <div className="size-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            {isSaving
                                                ? isSaved
                                                    ? "Đang bỏ lưu..."
                                                    : "Đang lưu..."
                                                : "Đang kiểm tra..."}
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark
                                                className={"size-4"}
                                                fill={
                                                    isSaved
                                                        ? "oklch(62.3% 0.214 259.815)"
                                                        : "none"
                                                }
                                            />

                                            <span>
                                                {isSaved ? "Đã lưu" : "Lưu"}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {addedToCart && (
                                <div className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                    <CheckCircleIcon className={"size-5"} /> Đã
                                    thêm vào giỏ hàng
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Reviews Section */}
            {product && (
                <div className="mt-16">
                    <ProductReviews productId={product.id.toString()} />
                </div>
            )}

            {/* Top Selling Products Section */}
            {product && (
                <div className="mt-16">
                    <TopSellingProducts
                        categoryId={Number(categoryId)}
                        currentProductId={product.id}
                        limit={6}
                    />
                </div>
            )}

            <AlertDialog
                open={isDialogErrorOpen}
                onOpenChange={setIsDialogErrorOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="size-5" />
                            Lỗi khi thêm vào giỏ hàng
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {errorWhenAddingToCart ||
                                "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setIsDialogErrorOpen(false);
                                setErrorWhenAddingToCart("");
                                // Navigate to cart page
                                window.location.href = "/cart";
                            }}
                        >
                            Giỏ hàng
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProductPage;
