import React, {useState, useEffect} from "react";
import type {CartItem} from "../contexts/CartContext.tsx";
import ProductCart from "../components/ProductCart.tsx";
import {useCart} from "../contexts/CartContext.tsx";
import AccessoryCard from "../components/AccessoryCard.tsx";
import type {ProductCardProps} from "../components/ProductCard.tsx";
import {Link} from "react-router-dom";

const accessoryDatas: ProductCardProps[] = [
    {
        id: "1",
        name: "Ốp Lưng Trong Suốt MagSafe cho iPhone 16 Pro",
        title: "Âm thanh đỉnh cao với khả năng chống ồn.",
        stock: [
            {
                color: {id: "1", name: "Trắng", hex: "#FFFFFF"},
                quantity: 20,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA7E4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=TXZpSEg0MGF0QUNTNGpkTzhrU3hndllvYS9naDJJdU9KTWdGWjhKWFRmS09ndGkreVVaZTdmSmpUOUozdHRlU0pPRjNYblFJVkwzR2MyTG5BQ1RpRlE",
                price: 2490000,
                id: "stock6"
            }
        ],
        category: "iphone"
    },
    {
        id: "2",
        name: "Ốp Lưng Silicon MagSafe cho iPhone 16 Pro – Xanh Hồ Nước",
        title: ".",
        stock: [
            {
                color: {id: "2", name: "Hồng Mẫu Đơn", hex: "#d964ff"},
                quantity: 15,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFX4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a0w4aUNRdVRBU0RuTitHR3hrR2RCdllvYS9naDJJdU9KTWdGWjhKWFRmS1ZGS1d3SDlTVjBOQWIxNCszUkpvN1Z0V1grbituVlRzQkUwY0R1QWF2REE",
                price: 3999000,
                id: "stock7",
            },
            {
                color: {id: "3", name: "Xanh Hồ Nước", hex: "#116148"},
                quantity: 15,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MYYR3?wid=400&hei=400&fmt=jpeg&qlt=90&.v=NXlsc0NSUUNXL3VpN0FEcldNTjZDZllvYS9naDJJdU9KTWdGWjhKWFRmSU9OZ09xWFVJVlEwTGV2SFNmMDNBQ3JOQUhhRk43RGdKTDFwWXpvVThHelE",
                price: 3999000,
                id: "stock7b"
            },
            {
                color: {id: "4", name: "Xám Đá", hex: "#737048"},
                quantity: 15,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MYYL3?wid=400&hei=400&fmt=jpeg&qlt=90&.v=b1RQWmVjRXMvNUlOblpOQlh2SWp3dllvYS9naDJJdU9KTWdGWjhKWFRmSU9OZ09xWFVJVlEwTGV2SFNmMDNBQ1BHd2FETFVCTElrTzhMVW9XdGdNdGc",
                price: 3999000,
                id: "stock7c"
            }
        ],
        category: "iphone"
    },
    {
        id: "3",
        name: "AirTag",
        title: "Theo dõi đồ vật của bạn dễ dàng.",
        stock: [
            {
                color: {id: "3", name: "Trắng", hex: "#FFFFFF"},
                quantity: 30,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-single-select-202104?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a2ZqcUtUS1VMaUZQNkl6T3JzY1ZmM2VtMnRWRDBsa0dSNys0czlzRGpsWkQ4eDQxcUNOL3l1WDd2VTYzMXJYbkJkRlpCNVhYU3AwTldRQldlSnpRa09uQUloSkVKVkcwallkSU9VTjVpWVU",
                price: 890000,
                id: "stock8"
            }
        ],
        category: "iphone"
    },
    {
        id: "4",
        name: "Bộ sạc USB-C 20W",
        title: "",
        stock: [
            {
                color: {id: "4", name: "Trắng", hex: "#FFFFFF"},
                quantity: 10,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=OGtweE9EQm0vTmJwVFZ2Y1ZxS014UFlvYS9naDJJdU9KTWdGWjhKWFRmS3JsWm5HNGNBd0Rud0licVNoTVJXRFltcUlQTFplaEppV2xjU0huOE9Ma2c",
                price: 549000,
                id: "stock9"
            }
        ],
        category: "iphone"
    }
]

const CartPage: React.FC = () => {
    const {cartItems, updateQuantity, removeFromCart} = useCart();
    const [cartDatas, setCartDatas] = useState<CartItem[]>([]);

    useEffect(() => {
        setCartDatas(cartItems);
    }, [cartItems]);

    const handleQuantityChange = (itemId: string, colorId: string, storageId: string, newQuantity: number) => {
        updateQuantity(itemId, colorId, storageId, newQuantity);
    };

    const handleRemoveItem = (itemId: string, colorId: string, storageId: string) => {
        removeFromCart(itemId, colorId, storageId);
    };

    return (
        <div className={"py-12 container mx-auto"}>
            <div className={"space-y-10 text-center pb-12"}>
                <p>Xin lưu ý rằng chúng tôi không chấp nhận đổi trả đối với các đơn hàng trực
                    tuyến.</p>
                <h1 className={"font-semibold"}>Tổng giá trị giỏ hàng của bạn là {
                    cartDatas.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    })
                }</h1>
                <div className={"flex flex-col space-y-4 items-center"}>
                    <p>Phí vận chuyển cho đơn hàng của bạn - <strong>Miễn phí</strong></p>
                    <Link to={"/payment"}
                        className={"bg-blue-600 hover:bg-blue-500 transition w-fit text-white px-16 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}>Thanh
                        toán
                    </Link>
                </div>
            </div>
            {
                cartDatas.length > 0 ? (
                    <div className={"mt-10 flex flex-col border-b"}>
                        {cartDatas.map((item) => (
                            <ProductCart
                                key={`${item.id}-${item.color.id}-${item.storage.id}`}
                                {...item}
                                onQuantityChange={handleQuantityChange}
                                onRemoveItem={handleRemoveItem}
                            />
                        ))}
                    </div>
                ) : (
                    <p className={"text-center mt-10"}>Giỏ hàng của bạn hiện đang trống.</p>
                )
            }
            <div className={"grid grid-cols-6 gap-12 py-20 border-b"}>
                <div className="col-span-4 xl:col-span-5 col-start-3 xl:col-start-2 space-y-3">
                    <div className={"flex justify-between items-center"}>
                        <p>Tổng phụ</p>
                        <p>
                            {cartDatas.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            })}
                        </p>
                    </div>
                    <div className={"flex justify-between items-center"}>
                        <p>Thuế GTGT</p>
                        <p>
                            {(cartDatas.reduce((total, item) => total + item.price * item.quantity, 0) * 0.1).toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            })}
                        </p>
                    </div>
                    <div className={"flex justify-between items-center"}>
                        <p>Vận chuyển</p>
                        <p className={"uppercase"}>
                            Miễn phí
                        </p>
                    </div>
                    <hr/>
                    <div className={"flex justify-between py-4"}>
                        <p className={"font-semibold text-2xl"}>Thanh toán toàn bộ</p>
                        <p className={"text-right"}>
                            <p className={"font-semibold text-2xl"}>
                                {(cartDatas.reduce((total, item) => total + item.price * item.quantity, 0) * 1.1).toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                })}
                            </p>
                            <p className={"text-sm text-gray-500 w-56"}>
                                Giá trên đã bao gồm thuế GTGT và phí vận chuyển miễn phí.
                            </p>
                        </p>
                    </div>
                    <div className={"flex justify-end"}>
                        <Link to={"/payment"}
                            className={"bg-blue-600 hover:bg-blue-500 transition text-white px-16 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}>
                            Thanh toán
                        </Link>
                    </div>
                </div>
            </div>
            <div className={"pb-12 pt-20 px-4"}>
                <h2 className={"text-5xl font-semibold text-center"}>Có thể bạn cũng sẽ thích</h2>
                <p className={"text-center text-gray-500 mt-4 mb-12"}>Các sản phẩm khác mà bạn có thể quan tâm.</p>
                <div className={"grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"}>
                    {
                        accessoryDatas.map((accessory) => (
                            <AccessoryCard
                                key={accessory.id}
                                id={accessory.id}
                                name={accessory.name}
                                title={accessory.title}
                                stock={accessory.stock} category={""}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default CartPage;
