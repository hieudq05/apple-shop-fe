import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./ui/carousel";

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
    categoryId,
}) => {
    const allPhotos = React.useMemo(() => {
        if (!stocks || stocks.length === 0) return [];

        // Thu thập tất cả ảnh từ tất cả stocks
        const photos = stocks.flatMap((stock) => stock.productPhotos || []);

        // Sắp xếp theo id, xử lý cả trường hợp id là số hoặc chuỗi
        return photos.sort((a, b) => {
            if (!a.id || !b.id) return 0;

            // Chuyển đổi thành chuỗi để đảm bảo so sánh an toàn
            const idA = String(a.id);
            const idB = String(b.id);

            return idA.localeCompare(idB);
        });
    }, [stocks]);

    return (
        <div className="bg-transparent flex flex-col space-y-6 h-full" key={id}>
            <Carousel className="w-full aspect-[9/12] relative hover:scale-[1.03] transition-transform duration-200">
                <CarouselContent className="w-full h-full">
                    {allPhotos.length > 0 ? (
                        allPhotos.map((photo, index) => (
                            <CarouselItem
                                key={photo.id || index}
                                className="w-fit h-full"
                            >
                                <a
                                    href={`/product/${categoryId}/${id}`}
                                    className="block w-full h-full focus:outline-none rounded-3xl"
                                    style={{
                                        backgroundImage: `url(${photo.imageUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                ></a>
                            </CarouselItem>
                        ))
                    ) : (
                        <CarouselItem>
                            <a
                                href={`/product/${categoryId}/${id}`}
                                className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="w-full h-full rounded-3xl bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">
                                        Không có ảnh
                                    </span>
                                </div>
                            </a>
                        </CarouselItem>
                    )}
                </CarouselContent>
                {/*{allPhotos.length > 1 && (*/}
                {/*    <>*/}
                {/*        <CarouselPrevious className="absolute left-[-15px]" />*/}
                {/*        <CarouselNext className="absolute right-[-15px]" />*/}
                {/*    </>*/}
                {/*)}*/}
            </Carousel>
            <div className={"flex justify-center gap-2"}>
                {stocks?.map((stockItem) => (
                    <div
                        className={"size-3 rounded-full shadow-inner"}
                        style={{
                            backgroundColor: stockItem.color.hexCode,
                            boxShadow: `inset -2px 1px 4px -1px rgba(0,0,0,0.30)`,
                        }}
                    ></div>
                ))}
            </div>
            <div className={"flex flex-col items-center h-full"}>
                <h2 className="text-xl font-medium">{name}</h2>
                <p className="mb-8 font-light text-center h-full">{description}</p>
                <div className="text-center">
                    {stocks && stocks.length > 0
                        ? `Từ ${Math.min(
                              ...stocks.map((stockItem) => stockItem.price)
                          ).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                          })}`
                        : "Liên hệ để biết giá"}
                </div>
                <div className={"flex justify-center"}>
                    <button className="mt-4 text-sm bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Tìm hiểu thêm
                    </button>
                    <a
                        href={`/product/${categoryId}/${id}`}
                        className="mt-4 flex text-sm items-center gap-1 ml-4 bg-transparent text-blue-600 hover:underline rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Mua <ChevronRightIcon className={"size-4 mt-0.5"} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
