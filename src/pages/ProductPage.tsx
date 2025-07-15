import React, { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import productService from "@/services/productService";
import { cartApiService } from "../services/cartApiService";

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

const productData: ProductProps = {
    id: 1,
    name: "iPhone 15 Pro",
    description: "Một iPhone cực đỉnh.",
    stocks: [
        {
            id: 1,
            color: { id: 1, name: "Silver", hexCode: "#C0C0C0" },
            imageUrl:
                "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94Nm1neGR3bXRIczEyZHc4WTk0RkR4VEY3eHJKR1hDaEJCS2hmc2czazlldHlSTUMybCtXNXZpclhWeFpYZUcvRk80dEcwRGlZdHZNUlUyQVJ1QXFtSFFsOE8xQ2Rxc3QzeElocmgrcU1DbFJn&traceId=1",
            price: 24990000,
            instanceProperty: [
                { id: 1, name: "128GB", price: 20000000 },
                { id: 2, name: "256GB", price: 22000000 },
                { id: 3, name: "512GB", price: 24000000 },
                { id: 4, name: "1TB", price: 26000000 },
            ],
            quantity: 10,
        },
        {
            id: 2,
            color: { id: 2, name: "Space Black", hexCode: "#000000" },
            imageUrl:
                "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NVJrY0tZVVQzOFFrQ2FwbFZZamEzeEpOZTBYalh5Vk90cEc1K2wwRzFGejRMeXJHUnUva2huMjl4akFHOXNwVjA0YXFmK3VWSWZuRE9oVEFyUFR0T2hWSm5HQVhUeDlTTVJFSzVnTlpqdUV3&traceId=1",
            price: 25990000,
            instanceProperty: [
                { id: 1, name: "128GB", price: 20000000 },
                { id: 2, name: "256GB", price: 22000000 },
                { id: 3, name: "512GB", price: 24000000 },
                { id: 4, name: "1TB", price: 26000000 },
            ],
            quantity: 10,
        },
        {
            id: 3,
            color: { id: 3, name: "Gold", hexCode: "#FFD700" },
            imageUrl:
                "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-whitetitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NkppVHhtRktGckFBd2ZPSmpuTHdJcWlCQmV2WTA2cncybDF2YzFnKzI0S2prMCtUNWwzYWR0UVU3TWVsbEdUeXZka3Q2dVFYV2lxTm4wNXBJcGZoM1QzVmtFSHJkUURvdVZmQktGTnNPd1Z3&traceId=1",
            price: 26990000,
            instanceProperty: [
                { id: 1, name: "128GB", price: 20000000 },
                { id: 2, name: "256GB", price: 22000000 },
                { id: 3, name: "512GB", price: 24000000 },
            ],
            quantity: 10,
        },
    ],
};

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
    const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

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
            await cartApiService.addToCart({
                productId: product.id,
                stockId: actualSelectedStock.id,
                quantity: 1,
            });

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
        } catch (error) {
            console.error("Error adding to cart:", error);
            // You could show an error message here
            alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.");
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

    return (
        <div className="py-12 text-start lg:px-72">
            <div className={"container mx-auto flex flex-col space-y-12 mb-12"}>
                <div>
                    <h1 className="text-5xl font-semibold mb-6">
                        Mua {product?.name}
                    </h1>
                    <h2 className="text-2xl text-gray-700 mb-4">
                        {product?.description}
                    </h2>
                </div>
                <div className={"flex gap-12 flex-col md:flex-row"}>
                    <div
                        className="items-center overflow-x-auto scrollbar-hide flex-[3] sticky top-12 bg-white z-10"
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
                            <div className={"text-3xl font-semibold"}>
                                Màu.{" "}
                                <span className={"text-gray-500"}>
                                    Chọn màu bạn yêu thích.
                                </span>
                            </div>
                            <div className="my-4 text-sm text-gray-600">
                                Màu: {selectedStock?.color.name}
                            </div>
                            <div className="flex space-x-3">
                                {product?.stocks?.map((item, idx) => (
                                    <button
                                        key={item.color.id}
                                        className={`relative size-8 p-0 z-0 transition rounded-full border-2 focus:outline-none ${
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
                            <div className={"text-3xl font-semibold"}>
                                Các thuộc tính khác.{" "}
                                <span className={"text-gray-500"}>
                                    Chọn thuộc tính bạn cần.
                                </span>
                            </div>
                            {selectedStock?.allStocks &&
                            selectedStock.allStocks.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedStock.allStocks.map((stock) => (
                                        <button
                                            key={stock.id}
                                            className={`px-4 py-4 flex justify-between items-center rounded-xl w-full border-2 focus:outline-none transition ${
                                                selectedStockId === stock.id
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                                setSelectedStockId(stock.id)
                                            }
                                        >
                                            <div className="flex gap-2 items-center">
                                                {selectedStockId ===
                                                    stock.id && (
                                                    <span className="text-blue-600 font-semibold">
                                                        ✓
                                                    </span>
                                                )}
                                                <div className="text-left">
                                                    <div className="text-base font-semibold">
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
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {stock.instanceProperty
                                                            ?.length || 0}{" "}
                                                        thuộc tính • Số lượng:{" "}
                                                        {stock.quantity || 0}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600 font-normal text-right w-32">
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
                                            <span className="text-blue-600 font-semibold">
                                                ✓
                                            </span>
                                            <div className="text-left">
                                                <div className="text-base font-semibold">
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
            <div className={"bg-gray-100 p-12 rounded-4xl"}>
                <div
                    className={
                        "container mx-auto grid lg:grid-cols-3 grid-cols-2 gap-12"
                    }
                >
                    <div className={"flex flex-col space-y-12"}>
                        <div className={"text-4xl font-semibold"}>
                            {product?.name || productData.name} mới của bạn.
                            <br />
                            <span className={"text-gray-500"}>
                                Theo cách bạn muốn.
                            </span>
                        </div>
                        <div className={"overflow-hidden rounded-2xl h-64"}>
                            <div
                                className={
                                    "w-full aspect-square xl:scale-150 scale-[200%] relative xl:top-0 top-10"
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
                    <div
                        className={
                            "flex flex-col space-y-6 text-lg lg:col-span-2"
                        }
                    >
                        <div className={"flex flex-col gap-1"}>
                            <div>
                                {product?.name || productData.name}{" "}
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
                                <span className={"font-semibold text-2xl"}>
                                    Tổng cộng{" "}
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
                                </span>
                            </div>
                            <div className={"text-xs"}>
                                Bao gồm thuế GTGT khoảng{" "}
                                {(() => {
                                    const actualSelectedStock = selectedStockId
                                        ? selectedStock?.allStocks?.find(
                                              (stock) =>
                                                  stock.id === selectedStockId
                                          )
                                        : selectedStock?.allStocks?.[0] ||
                                          selectedStock;

                                    return (
                                        (actualSelectedStock?.price ?? 0) * 0.1
                                    ).toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    });
                                })()}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || !selectedStock}
                                className="text-sm w-fit font-normal px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart
                                    ? "Đang thêm..."
                                    : "Thêm vào giỏ hàng"}
                            </button>

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
        </div>
    );
};

export default ProductPage;
