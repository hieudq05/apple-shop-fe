import React from 'react';
import {ChevronRightIcon} from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";

export interface ProductColor {
    id: string;
    name: string;
    hexCode: string;
}

export interface ProductStock {
    id: string;
    color: ProductColor;
    quantity: number;
    productPhotos: ProductPhoto[];
    price: number;
}

export interface ProductPhoto {
    id: string;
    imageUrl: string;
    alt: string;
}

export interface ProductCardProps {
    id: string;
    name: string;
    description: string;
    stocks: ProductStock[];
    category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     id,
                                                     name,
                                                     description,
                                                     stocks,
                                                 }) => {
    return (
        <div className="bg-transparent flex flex-col space-y-6" key={id}>
            <a href={`/product/${id}`} style={{
                backgroundImage: `url(${stocks? stocks[0].productPhotos[0]?.imageUrl : ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
               className="w-full aspect-[9/12] object-cover rounded-3xl hover:scale-[1.03] transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-blue-500">
               </a>
            <div className={"flex justify-center gap-2"}>
                {
                    stocks?.map((stockItem) => (
                        <div className={"size-4 rounded-full shadow-inner"}
                             style={{
                                 backgroundColor: stockItem.color.hexCode,
                                 boxShadow: `inset -2px 1px 4px -1px rgba(0,0,0,0.30)`,
                             }}>
                        </div>
                    ))
                }
            </div>
            <div className={"flex flex-col items-center"}>
                <h2 className="text-2xl font-semibold mb-2">{name}</h2>
                <p className="text-gray-600 mb-2">{description}</p>
                <div className="text-lg font-medium text-center">
                    {stocks && stocks.length > 0 ? (
                        stocks.length === 1 ? (
                            // Nếu chỉ có 1 stock, hiển thị giá đơn
                            stocks[0].price.toLocaleString('vi-VN', {
                                style: 'currency', 
                                currency: 'VND'
                            })
                        ) : (
                            // Nếu có nhiều stocks, hiển thị khoảng giá
                            `Từ ${Math.min(...stocks.map(stockItem => stockItem.price)).toLocaleString(
                                'vi-VN',
                                {style: 'currency', currency: 'VND'}
                            )} đến ${Math.max(...stocks.map(stockItem => stockItem.price)).toLocaleString(
                                'vi-VN',
                                {style: 'currency', currency: 'VND'}
                            )}`
                        )
                    ) : (
                        'Liên hệ để biết giá'
                    )}
                </div>
                <div className={"flex justify-center"}>
                    <button
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Tìm hiểu thêm
                    </button>
                    <a href={`/product/${id}`}
                        className="mt-4 flex items-center gap-1 ml-4 bg-transparent text-blue-600 hover:underline rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Mua <ChevronRightIcon className={"size-4 mt-0.5"}/>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;