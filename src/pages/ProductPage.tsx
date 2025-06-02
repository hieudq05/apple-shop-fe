import React, {useState, useEffect} from "react";
import {useCart} from '../contexts/CartContext';
import {CheckCircleIcon} from "@heroicons/react/24/outline";

interface ProductStock {
    id: string;
    color: {
        id: string;
        name: string;
        hex: string;
    };
    imageUrl: string;
    price: number;
    storage: StorageOption[];
}

interface StorageOption {
    id: string;
    name: string;
    price?: number; // Optional if not used
    quantity: number;
}

export interface ProductProps {
    id: string;
    name: string;
    title: string;
    stock: ProductStock[];
}

const productData: ProductProps = {
    id: "1",
    name: "iPhone 15 Pro",
    title: "Một iPhone cực đỉnh.",
    stock: [
        {
            id: "1",
            color: {id: "1", name: "Silver", hex: "#C0C0C0"},
            imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94Nm1neGR3bXRIczEyZHc4WTk0RkR4VEY3eHJKR1hDaEJCS2hmc2czazlldHlSTUMybCtXNXZpclhWeFpYZUcvRk80dEcwRGlZdHZNUlUyQVJ1QXFtSFFsOE8xQ2Rxc3QzeElocmgrcU1DbFJn&traceId=1",
            price: 24990000,
            storage: [
                {id: "1", name: "128GB", price: 20000000, quantity: 10},
                {id: "2", name: "256GB", price: 22000000, quantity: 10},
                {id: "3", name: "512GB", price: 24000000, quantity: 10},
                {id: "4", name: "1TB", price: 26000000, quantity: 10},
            ]
        },
        {
            id: "2",
            color: {id: "2", name: "Space Black", hex: "#000000"},
            imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NVJrY0tZVVQzOFFrQ2FwbFZZamEzeEpOZTBYalh5Vk90cEc1K2wwRzFGejRMeXJHUnUva2huMjl4akFHOXNwVjA0YXFmK3VWSWZuRE9oVEFyUFR0T2hWSm5HQVhUeDlTTVJFSzVnTlpqdUV3&traceId=1",
            price: 25990000,
            storage: [
                {id: "1", name: "128GB", price: 20000000, quantity: 10},
                {id: "2", name: "256GB", price: 22000000, quantity: 10},
                {id: "3", name: "512GB", price: 24000000, quantity: 10},
                {id: "4", name: "1TB", price: 26000000, quantity: 10},
            ]
        },
        {
            id: "3",
            color: {id: "3", name: "Gold", hex: "#FFD700"},
            imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-whitetitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NkppVHhtRktGckFBd2ZPSmpuTHdJcWlCQmV2WTA2cncybDF2YzFnKzI0S2prMCtUNWwzYWR0UVU3TWVsbEdUeXZka3Q2dVFYV2lxTm4wNXBJcGZoM1QzVmtFSHJkUURvdVZmQktGTnNPd1Z3&traceId=1",
            price: 26990000,
            storage: [
                {id: "1", name: "128GB", price: 20000000, quantity: 10},
                {id: "2", name: "256GB", price: 22000000, quantity: 10},
                {id: "3", name: "512GB", price: 24000000, quantity: 10},
            ]
        },
    ],
}

const ProductPage: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedStock = productData.stock[selectedIndex];
    const [selectedStorageId, setSelectedStorageId] = useState(productData.stock[0].storage[0].id);
    const {addToCart} = useCart();
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddToCart = () => {
        const selectedStorage = selectedStock.storage.find(storage => storage.id === selectedStorageId);
        if (!selectedStorage) return;

        addToCart({
            id: productData.id,
            name: productData.name,
            price: selectedStorage.price || selectedStock.price,
            color: selectedStock.color,
            storage: {
                id: selectedStorage.id,
                name: selectedStorage.name,
            },
            quantity: 1,
            imageUrl: selectedStock.imageUrl
        });

        // Show added to cart message
        setAddedToCart(true);

        // Hide message after 3 seconds
        setTimeout(() => {
            setAddedToCart(false);
        }, 3000);
        setTimeout(() => {
            window.location.href = "/cart";
        }, 1000);
    };

    // Reset selected storage when product changes
    useEffect(() => {
        // Make sure the selectedStorageId exists in the current stock
        const storageExists = selectedStock.storage.some(storage => storage.id === selectedStorageId);
        if (!storageExists && selectedStock.storage.length > 0) {
            setSelectedStorageId(selectedStock.storage[0].id);
        }
    }, [selectedStock]);

    return (
        <div className="py-12 text-start">
            <div className={"container mx-auto flex flex-col space-y-12 mb-12"}>
                <div>
                    <h1 className="text-5xl font-semibold mb-6">Mua {productData.name}</h1>
                    <h2 className="text-2xl text-gray-700 mb-4">{productData.title}</h2>
                </div>
                <div className={"flex gap-12 flex-col md:flex-row"}>
                    <div className="items-center overflow-x-auto scrollbar-hide flex-[5] sticky top-12 bg-white z-10"
                         style={{scrollSnapType: "x mandatory"}}>
                        <img
                            key={selectedStock.id}
                            src={selectedStock.imageUrl}
                            alt={productData.name}
                            className={`w-full object-cover transition duration-500 rounded-2xl mb-4 md:aspect-square aspect-video`}
                            style={{scrollSnapAlign: "center"}}
                        />
                    </div>
                    <div className={"flex-[2] flex flex-col space-y-28"}>
                        <div>
                            <div className={"text-3xl font-semibold"}>
                                Màu. <span className={"text-gray-500"}>Chọn màu bạn yêu thích.</span>
                            </div>
                            <div className="my-4 text-sm text-gray-600">
                                Màu: {selectedStock.color.name}
                            </div>
                            <div className="flex space-x-3">
                                {productData.stock.map((item, idx) => (
                                    <button
                                        key={item.color.id}
                                        className={`relative size-8 p-0 z-0 transition rounded-full border-2 focus:outline-none ${selectedIndex === idx ? "border-blue-600" : "border-transparent"}`}
                                        onClick={() => {
                                            setSelectedIndex(idx);
                                            const hasCurrentStorage = item.storage.some(storage => storage.id === selectedStorageId);
                                            if (!hasCurrentStorage) {
                                                setSelectedStorageId(item.storage[0].id);
                                            }
                                        }}
                                        aria-label={item.color.name}
                                    >
                                        <div className={"absolute top-[0.155rem] left-[0.15rem] size-6 rounded-full"}
                                             style={{
                                                 backgroundColor: item.color.hex,
                                                 boxShadow: `inset -2px 1px 5px -1px rgba(0,0,0,0.30)`,
                                             }}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={"flex flex-col space-y-4 my-6"}>
                            <div className={"text-3xl font-semibold"}>
                                Dung lượng lưu trữ. <span className={"text-gray-500"}>Bạn cần bao nhiêu dung lượng lưu trữ.</span>
                            </div>
                            {
                                selectedStock.storage.map((storageItem) => (
                                    <button
                                        key={storageItem.id}
                                        className={`px-4 py-4 flex justify-between items-center rounded-xl w-full border-1 focus:outline-none transition ${selectedStorageId === storageItem.id ? "border-2 border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                                        onClick={() => {
                                            setSelectedStorageId(storageItem.id);
                                        }}
                                    >
                                        <div className={"flex gap-2 items-center"}>
                                            {selectedStorageId === storageItem.id && (
                                                <span className="text-blue-600 font-semibold">✓</span>
                                            )}
                                            <span className={"text-base font-semibold"}>{storageItem.name}</span>
                                        </div>
                                        <div className={"text-xs text-gray-600 font-normal text-right w-32"}>
                                            Trả toàn bộ <br/>
                                            {storageItem.price ? `${storageItem.price.toLocaleString('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            })}` : ""} <br/>
                                            bằng tài khoản <br/> hoặc <br/> khi nhận hàng.
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={"bg-gray-100"}>
                <div className={"container mx-auto grid lg:grid-cols-3 grid-cols-2 gap-12"}>
                    <div className={"flex flex-col py-12 space-y-12"}>
                        <div className={"text-4xl font-semibold"}>
                            {productData.name} mới của bạn.<br/>
                            <span className={"text-gray-500"}>Theo cách bạn muốn.</span>
                        </div>
                        <div className={"overflow-hidden h-64"}>
                            <div className={"w-full aspect-square xl:scale-150 scale-[200%] relative xl:top-0 top-10"}
                                 style={{
                                     backgroundImage: `url(${selectedStock.imageUrl})`,
                                     backgroundSize: 'cover',
                                     backgroundPosition: 'top',
                                 }}></div>
                        </div>
                    </div>
                    <div className={"flex flex-col py-12 space-y-6 text-lg lg:col-span-2"}>
                        <div className={"flex flex-col gap-1"}>
                            <div>
                                {productData.name}{' '}
                                {selectedStock.storage.map((storageItem) => (
                                    storageItem.id === selectedStorageId ? (
                                        <span key={storageItem.id}>
                                        {storageItem.name}
                                    </span>
                                    ) : null
                                ))}{' '}
                                {selectedStock.color.name}
                            </div>
                            <div>
                            <span className={"font-semibold text-2xl"}>Tổng cộng{' '}
                                {
                                    selectedStock.storage.find(storage => storage.id === selectedStorageId)?.price
                                        ? selectedStock.storage.find(storage => storage.id === selectedStorageId)?.price?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        })
                                        : selectedStock.price.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        })
                                }</span>
                            </div>
                            <div className={"text-xs"}>
                                Bao gồm thuế GTGT khoảng {(
                                selectedStock.storage.find(storage => storage.id === selectedStorageId)?.price
                                    ? (selectedStock.storage.find(storage => storage.id === selectedStorageId)?.price ?? 0) * 0.1
                                    : selectedStock.price * 0.1
                            ).toLocaleString(
                                'vi-VN',
                                {style: 'currency', currency: 'VND'}
                            )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleAddToCart}
                                className="text-sm w-fit font-normal px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Thêm vào giỏ hàng
                            </button>

                            {addedToCart && (
                                <div className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                    <CheckCircleIcon className={"size-5"}/> Đã thêm vào giỏ hàng
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
