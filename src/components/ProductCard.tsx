import React from 'react';
import {ChevronRightIcon} from "@heroicons/react/24/outline";

export interface ProductColor {
    id: string;
    name: string;
    hex: string;
}

export interface ProductStock {
    id: string;
    color: ProductColor;
    quantity: number;
    imageUrl: string;
    price: number;
}

export interface ProductCardProps {
    id: string;
    name: string;
    title: string;
    stock: ProductStock[];
    category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     id,
                                                     name,
                                                     title,
                                                     stock,
                                                 }) => {
    return (
        <div className="bg-transparent flex flex-col space-y-6" key={id}>
            <a href={`/product/${id}`} style={{
                backgroundImage: `url(${stock[0].imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
               className="h-[33rem] w-full rounded-3xl hover:scale-[1.03] transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-blue-500"></a>
            <div className={"flex justify-center gap-2"}>
                {
                    stock.map((stockItem) => (
                        <div className={"size-4 rounded-full shadow-inner"}
                             style={{
                                 backgroundColor: stockItem.color.hex,
                                 boxShadow: `inset -2px 1px 4px -1px rgba(0,0,0,0.30)`,
                             }}>
                        </div>
                    ))
                }
            </div>
            <div className={"flex flex-col items-center"}>
                <h2 className="text-2xl font-semibold mb-2">{name}</h2>
                <p className="text-gray-600 mb-2">{title}</p>
                <div className="text-lg font-semibold">
                    Từ {Math.min(...stock.map((stockItem) => stockItem.price)).toLocaleString(
                    'vi-VN',
                    {style: 'currency', currency: 'VND'}
                )} đến {Math.max(...stock.map((stockItem) => stockItem.price)).toLocaleString(
                    'vi-VN',
                    {style: 'currency', currency: 'VND'}
                )}
                </div>
                <div className={"flex justify-center"}>
                    <button
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Tìm hiểu thêm
                    </button>
                    <button
                        className="mt-4 flex items-center gap-1 ml-4 bg-transparent text-blue-600 hover:underline rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Mua <ChevronRightIcon className={"size-4 mt-0.5"}/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;