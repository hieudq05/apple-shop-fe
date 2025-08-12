import React from "react";
import type { CartItem } from "../services/cartApiService";
import { Link } from "react-router-dom";
import {useTheme} from "@/components/theme-provider.tsx";

interface ProductCartProps extends CartItem {
    onQuantityChange?: (itemId: number, newQuantity: number) => void;
    onRemoveItem?: (itemId: number) => void;
}

const ProductCart: React.FC<ProductCartProps> = ({
    id,
    productId,
    productName,
    categoryId,
    productDescription,
    productImage,
    color,
    price,
    quantity,
    maxQuantity,
    instances,
    onQuantityChange,
    onRemoveItem,
}) => {
    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newQuantity = parseInt(e.target.value);
        if (onQuantityChange) {
            onQuantityChange(id, newQuantity);
        }
    };

    // Generate display name with instances
    const displayName = `${productName}${
        instances.length > 0 ? ` ${instances.map((i) => i.name).join(" ")}` : ""
    } ${color.name}`;

    return (
        <div className={"border-t py-20 grid-cols-6 grid gap-12"}>
            <div
                className={
                    "col-span-2 xl:col-span-1 overflow-hidden w-full rounded-2xl aspect-[8/10] flex justify-center items-center"
                }
            >
                <img
                    src={productImage}
                    alt={productName}
                    className={"w-full h-full object-cover"}
                />
            </div>
            <div
                className={
                    "md:grid md:grid-cols-5 w-full gap-4 col-span-4 xl:col-span-5 flex flex-col"
                }
            >
                <div className={"col-span-3 space-y-4"}>
                    <a
                        href={`/product/${categoryId}/${productId}`}
                        className={
                            "text-xl font-semibold hover:text-blue-600 transition"
                        }
                    >
                        {displayName}
                    </a>
                    {productDescription && (
                        <p className="text-muted-foreground text-sm">
                            {productDescription}
                        </p>
                    )}
                    <div className={"flex gap-4"}>
                        <svg
                            className="as-svgicon-rtl-mirrored as-svgicon as-svgicon-boxtruck as-svgicon-tiny as-svgicon-boxtrucktiny"
                            viewBox="0 0 21 21"
                            role="img"
                            aria-hidden="true"
                            width="28px"
                            height="28px"
                        >
                            <path fill="none" d="M0 0h21v21H0z"></path>
                            <path
                                fill={
                                    useTheme().theme === "dark" ? "#ffffff" : useTheme().theme === "light" ? "#000000" :
                                        new Date().getHours() >= 6 && new Date().getHours() <= 18 ? "#000000" : "#ffffff"
                                }
                                d="M19.559 10.274 17.24 7.53A1.688 1.688 0 0 0 15.918 7H15v-.75A2.25 2.25 0 0 0 12.75 4h-8.5A2.25 2.25 0 0 0 2 6.25V13a2.25 2.25 0 0 0 2.25 2.25h.56A2.248 2.248 0 0 0 7 17a2.202 2.202 0 0 0 2.19-2H14a2.214 2.214 0 0 0 2.25 2 2.248 2.248 0 0 0 2.19-1.75h.016A1.4 1.4 0 0 0 20 13.747v-2.363a1.61 1.61 0 0 0-.441-1.11ZM8.142 15.25a1.245 1.245 0 0 1-2.284 0 1.212 1.212 0 0 1 0-1 1.245 1.245 0 0 1 2.284 0 1.212 1.212 0 0 1 0 1ZM9.15 14a2.267 2.267 0 0 0-4.34.25h-.56A1.252 1.252 0 0 1 3 13V6.25A1.251 1.251 0 0 1 4.25 5h8.5A1.251 1.251 0 0 1 14 6.25V14Zm8.242 1.25a1.245 1.245 0 0 1-2.284 0 1.212 1.212 0 0 1 0-1 1.245 1.245 0 0 1 2.284 0 1.212 1.212 0 0 1 0 1ZM19 13.747c0 .334-.084.503-.544.503h-.016A2.245 2.245 0 0 0 15 12.88V8h.918a.681.681 0 0 1 .592.211l2.324 2.752a.617.617 0 0 1 .166.42Z"
                            ></path>
                        </svg>
                        <div className={"text-sm"}>
                            <p>Đặt hàng trong hôm nay. Phí giao hàng 40.000đ</p>
                            <p className={"font-semibold"}>
                                {new Date(
                                    Date.now() + 24 * 60 * 60 * 1000
                                ).toLocaleString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    weekday: "short",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={"flex-1"}>
                    <select
                        className="appearance-none rounded-lg ps-2 text-2xl font-medium focus:outline-none w-16 cursor-pointer"
                        value={quantity}
                        onChange={handleQuantityChange}
                        style={{
                            backgroundImage:
                                'url(\'data:image/svg+xml;utf8,<svg fill="none" stroke="%23007bff" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>\')',
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem bottom 0.2rem",
                            backgroundSize: "0.9em 0.9em",
                        }}
                    >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (q) => (
                                <option key={q} value={q}>
                                    {q}
                                </option>
                            )
                        )}
                    </select>
                    {maxQuantity < 10 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Còn lại: {maxQuantity}
                        </p>
                    )}
                </div>
                <div
                    className={
                        "flex flex-col items-end md:text-right text-left"
                    }
                >
                    <p className={"text-lg font-semibold w-full"}>
                        {price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}{" "}
                        x {quantity}
                    </p>
                    <p className={"text-sm text-gray-500 w-full"}>
                        {(price * quantity).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </p>
                    {onRemoveItem && (
                        <div
                            className={
                                "w-full flex md:justify-end justify-start md:mt-4 md:mb-0 mb-4"
                            }
                        >
                            <button
                                className="text-blue-700 text-lg font-light underline bg-transparent p-0 mt-4 transition focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-blue-600"
                                onClick={() => onRemoveItem(id)}
                            >
                                Xóa
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCart;
