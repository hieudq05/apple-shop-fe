import React, { useState, useEffect } from "react";
import { cartApiService, type CartItem } from "../services/cartApiService";
import ProductCart from "../components/ProductCart.tsx";
import AccessoryCard from "../components/AccessoryCard.tsx";
import type { ProductCardProps } from "../components/ProductCard.tsx";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight } from "lucide-react";

// Mock accessory data for "Có thể bạn cũng sẽ thích" section

const accessoryDatas: ProductCardProps[] = [
    {
        id: "1",
        name: "Ốp Lưng Trong Suốt MagSafe cho iPhone 16 Pro",
        description: "Âm thanh đỉnh cao với khả năng chống ồn.",
        stocks: [
            {
                color: { id: "1", name: "Trắng", hexCode: "#FFFFFF" },
                quantity: 20,
                productPhotos: [
                    {
                        id: "1",
                        imageUrl:
                            "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA7E4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=TXZpSEg0MGF0QUNTNGpkTzhrU3hndllvYS9naDJJdU9KTWdGWjhKWFRmS09ndGkreVVaZTdmSmpUOUozdHRlU0pPRjNYblFJVkwzR2MyTG5BQ1RpRlE",
                        alt: "Ốp Lưng Trong Suốt",
                    },
                ],
                price: 2490000,
                id: "stock6",
            },
        ],
        category: "iphone",
    },
    {
        id: "2",
        name: "Ốp Lưng Silicon MagSafe cho iPhone 16 Pro – Xanh Hồ Nước",
        description: "Bảo vệ hoàn hảo với thiết kế sang trọng.",
        stocks: [
            {
                color: { id: "2", name: "Hồng Mẫu Đơn", hexCode: "#d964ff" },
                quantity: 15,
                productPhotos: [
                    {
                        id: "2",
                        imageUrl:
                            "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFX4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a0w4aUNRdVRBU0RuTitHR3hrR2RCdllvYS9naDJJdU9KTWdGWjhKWFRmS1ZGS1d3SDlTVjBOQWIxNCszUkpvN1Z0V1grbituVlRzQkUwY0R1QWF2REE",
                        alt: "Ốp Lưng Silicon Hồng",
                    },
                ],
                price: 3999000,
                id: "stock7",
            },
        ],
        category: "iphone",
    },
    {
        id: "3",
        name: "AirTag",
        description: "Theo dõi đồ vật của bạn dễ dàng.",
        stocks: [
            {
                color: { id: "3", name: "Trắng", hexCode: "#FFFFFF" },
                quantity: 30,
                productPhotos: [
                    {
                        id: "3",
                        imageUrl:
                            "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-single-select-202104?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a2ZqcUtUS1VMaUZQNkl6T3JzY1ZmM2VtMnRWRDBsa0dSNys0czlzRGpsWkQ4eDQxcUNOL3l1WDd2VTYzMXJYbkJkRlpCNVhYU3AwTldRQldlSnpRa09uQUloSkVKVkcwallkSU9VTjVpWVU",
                        alt: "AirTag",
                    },
                ],
                price: 890000,
                id: "stock8",
            },
        ],
        category: "iphone",
    },
    {
        id: "4",
        name: "Bộ sạc USB-C 20W",
        description: "Sạc nhanh an toàn cho thiết bị của bạn.",
        stocks: [
            {
                color: { id: "4", name: "Trắng", hexCode: "#FFFFFF" },
                quantity: 10,
                productPhotos: [
                    {
                        id: "4",
                        imageUrl:
                            "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=OGtweE9EQm0vTmJwVFZ2Y1ZxS014UFlvYS9naDJJdU9KTWdGWjhKWFRmS3JsWm5HNGNBd0Rud0licVNoTVJXRFltcUlQTFplaEppV2xjU0huOE9Ma2c",
                        alt: "Bộ sạc USB-C",
                    },
                ],
                price: 549000,
                id: "stock9",
            },
        ],
        category: "iphone",
    },
];

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load cart data from API
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const items = await cartApiService.getCart();
            setCartItems(items);
        } catch (err) {
            console.error("Error loading cart:", err);
            setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (
        itemId: number,
        newQuantity: number
    ) => {
        try {
            await cartApiService.updateCartItem(itemId, {
                quantity: newQuantity,
            });
            // Update local state
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId
                        ? {
                              ...item,
                              quantity: newQuantity,
                              total: item.price * newQuantity,
                          }
                        : item
                )
            );
        } catch (err) {
            console.error("Error updating quantity:", err);
            setError("Không thể cập nhật số lượng. Vui lòng thử lại.");
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await cartApiService.removeFromCart(itemId);
            // Remove from local state
            setCartItems((prevItems) =>
                prevItems.filter((item) => item.id !== itemId)
            );
        } catch (err) {
            console.error("Error removing item:", err);
            setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
        }
    };

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + item.total, 0);
    const vatRate = 0.1;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount + 40000; // Adding shipping fee of 40,000 VND

    if (loading) {
        return (
            <div className="py-12 container mx-auto">
                <div className="text-center">
                    <p>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 container mx-auto">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={loadCart}
                        className="mt-4 bg-blue-600 hover:bg-blue-500 transition text-white px-6 py-2 rounded"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={"py-12 container mx-auto"}>
            <Helmet>
                <title>Giỏ hàng</title>
            </Helmet>
            {cartItems.length > 0 ? (
                <div>
                    <div className={"space-y-10 text-center pb-12"}>
                        <p>
                            Xin lưu ý rằng chúng tôi không chấp nhận đổi trả đối
                            với các đơn hàng trực tuyến.
                        </p>
                        <h1 className={"font-semibold text-4xl"}>
                            Tổng giá trị giỏ hàng của bạn là{" "}
                            {subtotal.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })}
                        </h1>
                        <div className={"flex flex-col space-y-4 items-center"}>
                            <p>
                                Phí vận chuyển cho đơn hàng của bạn -{" "}
                                <strong>40.000đ</strong>
                            </p>
                            <Link
                                to={"/payment"}
                                className={
                                    "bg-blue-600 hover:bg-blue-500 transition w-fit text-white px-16 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                }
                            >
                                Thanh toán
                            </Link>
                        </div>
                    </div>
                    <div className={"mt-10 flex flex-col border-b"}>
                        {cartItems.map((item) => (
                            <ProductCart
                                key={item.id}
                                {...item}
                                onQuantityChange={handleQuantityChange}
                                onRemoveItem={handleRemoveItem}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mx-auto w-fit flex flex-col items-center">
                    <img
                        src="/public/Page Not Found.png"
                        className="h-80 object-cover w-max-80 mx-auto object-center"
                    />
                    <h2 className="text-3xl lg:text-4xl font-semibold text-foreground text-center">
                        Giỏ hàng của bạn hiện đang trống.
                    </h2>
                    <p
                        className={
                            "text-center mt-4 mb-10 text-muted-foreground"
                        }
                    >
                        Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.
                    </p>
                    <Link
                        to={"/"}
                        className={
                            "mx-auto flex items-center w-fit font-light hover:bg-blue-600 transition bg-blue-500 text-white py-3 px-6 rounded-full"
                        }
                    >
                        Tiếp tục mua sắm
                        <ArrowUpRight className={"inline-block size-5 ml-1"} />
                    </Link>
                </div>
            )}
            {cartItems.length > 0 && (
                <>
                    <div className={"grid grid-cols-6 gap-12 py-20 border-b"}>
                        <div className="col-span-4 xl:col-span-5 col-start-3 xl:col-start-2 space-y-3">
                            <div
                                className={"flex justify-between items-center"}
                            >
                                <p>Tổng phụ</p>
                                <p>
                                    {subtotal.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </p>
                            </div>
                            <div
                                className={"flex justify-between items-center"}
                            >
                                <p>Thuế GTGT</p>
                                <p>
                                    {vatAmount.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </p>
                            </div>
                            <div
                                className={"flex justify-between items-center"}
                            >
                                <p>Vận chuyển</p>
                                <p className={"uppercase"}>40.000đ</p>
                            </div>
                            <hr />
                            <div className={"flex justify-between py-4"}>
                                <p className={"font-semibold text-2xl"}>
                                    Thanh toán toàn bộ
                                </p>
                                <p className={"text-right"}>
                                    <p className={"font-semibold text-2xl"}>
                                        {totalAmount.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </p>
                                    <p className={"text-sm text-gray-500 w-56"}>
                                        Giá trên đã bao gồm thuế GTGT và phí vận
                                        chuyển.
                                    </p>
                                </p>
                            </div>
                            <div className={"flex justify-end"}>
                                <Link
                                    to={"/payment"}
                                    className={
                                        "bg-blue-600 hover:bg-blue-500 transition text-white px-16 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    }
                                >
                                    Thanh toán
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* <div className={"pb-12 pt-20 px-4"}>
                <h2 className={"text-5xl font-semibold text-center"}>
                    Có thể bạn cũng sẽ thích
                </h2>
                <p className={"text-center text-gray-500 mt-4 mb-12"}>
                    Các sản phẩm khác mà bạn có thể quan tâm.
                </p>
                <div
                    className={
                        "grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                    }
                >
                    {" "}
                    {accessoryDatas.map((accessory) => (
                        <AccessoryCard
                            key={accessory.id}
                            id={accessory.id}
                            name={accessory.name}
                            description={accessory.description}
                            stocks={accessory.stocks}
                            category={accessory.category}
                        />
                    ))}
                </div>
            </div> */}
        </div>
    );
};

export default CartPage;
