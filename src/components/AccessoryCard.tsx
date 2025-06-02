import React, {useState} from "react";
import type {ProductCardProps} from "./ProductCard.tsx";

const AccessoryCard: React.FC<ProductCardProps> = ({
                                              id,
                                              name,
                                              stock,
                                          }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedStock = stock[selectedIndex];

    return (
        <div className="bg-white flex flex-col justify-between space-y-6 p-12 rounded-[2rem]" key={id}>
            <>
                <a
                    href={"#"}
                    style={{
                        backgroundImage: `url(${selectedStock.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    className="aspect-[2/3] w-[10rem] rounded-3xl hover:scale-[1.03] transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-blue-500 mx-auto"
                ></a>
                <div className="flex flex-col items-start">
                    <h2 className="text-lg font-semibold mb-2 text-start">{name}</h2>
                    <div>
                        {selectedStock.price.toLocaleString(
                            'vi-VN',
                            {style: 'currency', currency: 'VND'}
                        )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        Màu: {selectedStock.color.name}
                    </div>
                </div>
                <div className={"flex gap-2"}>
                    {stock.map((stockItem, idx) => (
                        <button
                            key={stockItem.id}
                            className={`relative size-8 p-0 transition rounded-full border-2 focus:outline-none ${selectedIndex === idx ? "border-blue-600" : "border-transparent"}`}
                            onClick={() => setSelectedIndex(idx)}
                            aria-label={stockItem.color.name}
                        >
                            <div className={"absolute top-[0.155rem] left-[0.15rem] size-6 rounded-full"} style={{
                                backgroundColor: stockItem.color.hex,
                                boxShadow: `inset -2px 1px 5px -1px rgba(0,0,0,0.30)`,
                            }}></div>
                        </button>
                    ))}
                </div>
            </>
            <button
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`Thêm ${name} vào giỏ hàng`}
            >
                Thêm vào giỏ hàng
            </button>
        </div>
    );
};

export default AccessoryCard;