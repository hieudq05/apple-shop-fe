import React, { useEffect, useState } from "react";
import ProductCard, {
    type ProductCardProps,
} from "../components/ProductCard.tsx";
import productService from "@/services/productService.ts";
import { getCategoryById } from "@/services/categoryService.ts";
import { Helmet } from "react-helmet-async";

export interface Category {
    id: string;
    name: string;
    imageUrl: string;
}

export interface ProductsPageProps {
    category: Category;
    products: ProductCardProps[];
}

const productCardDatas: ProductCardProps[] = [
    {
        id: "1",
        name: "iPhone 16 Pro",
        title: "Một iPhone cực đỉnh.",
        stock: [
            {
                color: { id: "1", name: "Titan Đen", hex: "#4D4D4D" },
                quantity: 10,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NzFzS1BRRzA4NTJUci9vckVTY21rM2lCQmV2WTA2cncybDF2YzFnKzI0S2prMCtUNWwzYWR0UVU3TWVsbEdUeXZka3Q2dVFYV2lxTm4wNXBJcGZoM1RkcERRMUVIWTBwNlRNS3dVelNTTTVB&traceId=1",
                price: 999,
                id: "stock1",
            },
            {
                color: { id: "2", name: "Titan tự nhiên", hex: "#C0C0C0" },
                quantity: 5,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NVJrY0tZVVQzOFFrQ2FwbFZZamEzeEpOZTBYalh5Vk90cEc1K2wwRzFGejRMeXJHUnUva2huMjl4akFHOXNwVjA0YXFmK3VWSWZuRE9oVEFyUFR0T2hWSm5HQVhUeDlTTVJFSzVnTlpqdUV3&traceId=1",
                price: 1099,
                id: "stock2",
            },
        ],
        category: "iphone",
    },
    {
        id: "2",
        name: "iPhone 16",
        title: "Một thiết bị siêu mạnh mẽ.",
        stock: [
            {
                color: { id: "3", name: "Xanh lưu ly", hex: "#A1B3F7" },
                quantity: 8,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=5120&hei=2880&fmt=webp&qlt=70&.v=UXp1U3VDY3IyR1hNdHZwdFdOLzg1V0tFK1lhSCtYSGRqMUdhR284NTN4L28rSU1jVGx4VGxCNEFSdVNXdG1RdzJrQmVLSXFrTCsvY1VvVmRlZkVnMzJKTG1lVWJJT2RXQWE0Mm9rU1V0V0E5L1ZBdzY3RU1aTVdUR3lMZHFNVzE0RzhwM3RLeUk1S0YzTkJVVmF2Ly9R&traceId=1",
                price: 1299,
                id: "stock3",
            },
        ],
        category: "iphone",
    },
    {
        id: "3",
        name: "iPhone 15 Plus",
        title: "Luôn tuyệt vời như thế.",
        stock: [
            {
                color: { id: "4", name: "Vàng", hex: "#fffbb3" },
                quantity: 12,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-yellow?wid=5120&hei=2880&fmt=webp&qlt=70&.v=cHJOTXEwTU92OEtKVDV2cVB1R2FTSjlERndlRTljaUdZeHJGM3dlLzR2K3IraXRtcU5ZQzFyR0o2ZWRlT1gzcTBoUVhuTWlrY2hIK090ZGZZbk9HeE1xUVVnSHY5eU9CcGxDMkFhalkvT0RIdDljQkJUS0FHR3FmR0lmaWxIVm1mbW94YnYxc1YvNXZ4emJGL0IxNFp3&traceId=1",
                price: 1399,
                id: "stock4",
            },
        ],
        category: "iphone",
    },
    {
        id: "4",
        name: "iPhone 16E",
        title: "iPhone mới nhất với giá tốt nhất.",
        stock: [
            {
                color: { id: "5", name: "Trắng", hex: "#FFFFFF" },
                quantity: 6,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16e-storage-select-202502-white?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eFBweGhLQWJCMzdyL2JTbG01RkJOSElKUkFlSEo1QVc1bW5RWkJPZnpCdGVjcGp3cGhIRW44Y2pmcUZ3N29HSkJQYkhSV3V1dC9oa0s5K3lqMGtUaFFmZ1pwOWJCVE1GNVJiNDlDdjlveUtiN3QrT0xpeXBZbGRXNE9GK28zTGo&traceId=1",
                price: 1599,
                id: "stock5",
            },
        ],
        category: "iphone",
    },
];

const accessoryDatas: ProductCardProps[] = [
    {
        id: "1",
        name: "Ốp Lưng Trong Suốt MagSafe cho iPhone 16 Pro",
        title: "Âm thanh đỉnh cao với khả năng chống ồn.",
        stock: [
            {
                color: { id: "1", name: "Trắng", hex: "#FFFFFF" },
                quantity: 20,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA7E4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=TXZpSEg0MGF0QUNTNGpkTzhrU3hndllvYS9naDJJdU9KTWdGWjhKWFRmS09ndGkreVVaZTdmSmpUOUozdHRlU0pPRjNYblFJVkwzR2MyTG5BQ1RpRlE",
                price: 2490000,
                id: "stock6",
            },
        ],
        category: "iphone",
    },
    {
        id: "2",
        name: "Ốp Lưng Silicon MagSafe cho iPhone 16 Pro – Xanh Hồ Nước",
        title: ".",
        stock: [
            {
                color: { id: "2", name: "Hồng Mẫu Đơn", hex: "#d964ff" },
                quantity: 15,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFX4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a0w4aUNRdVRBU0RuTitHR3hrR2RCdllvYS9naDJJdU9KTWdGWjhKWFRmS1ZGS1d3SDlTVjBOQWIxNCszUkpvN1Z0V1grbituVlRzQkUwY0R1QWF2REE",
                price: 3999000,
                id: "stock7",
            },
            {
                color: { id: "3", name: "Xanh Hồ Nước", hex: "#116148" },
                quantity: 15,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MYYR3?wid=400&hei=400&fmt=jpeg&qlt=90&.v=NXlsc0NSUUNXL3VpN0FEcldNTjZDZllvYS9naDJJdU9KTWdGWjhKWFRmSU9OZ09xWFVJVlEwTGV2SFNmMDNBQ3JOQUhhRk43RGdKTDFwWXpvVThHelE",
                price: 3999000,
                id: "stock7b",
            },
            {
                color: { id: "4", name: "Xám Đá", hex: "#737048" },
                quantity: 15,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MYYL3?wid=400&hei=400&fmt=jpeg&qlt=90&.v=b1RQWmVjRXMvNUlOblpOQlh2SWp3dllvYS9naDJJdU9KTWdGWjhKWFRmSU9OZ09xWFVJVlEwTGV2SFNmMDNBQ1BHd2FETFVCTElrTzhMVW9XdGdNdGc",
                price: 3999000,
                id: "stock7c",
            },
        ],
        category: "iphone",
    },
    {
        id: "3",
        name: "AirTag",
        title: "Theo dõi đồ vật của bạn dễ dàng.",
        stock: [
            {
                color: { id: "3", name: "Trắng", hex: "#FFFFFF" },
                quantity: 30,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-single-select-202104?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a2ZqcUtUS1VMaUZQNkl6T3JzY1ZmM2VtMnRWRDBsa0dSNys0czlzRGpsWkQ4eDQxcUNOL3l1WDd2VTYzMXJYbkJkRlpCNVhYU3AwTldRQldlSnpRa09uQUloSkVKVkcwallkSU9VTjVpWVU",
                price: 890000,
                id: "stock8",
            },
        ],
        category: "iphone",
    },
    {
        id: "4",
        name: "Bộ sạc USB-C 20W",
        title: "",
        stock: [
            {
                color: { id: "4", name: "Trắng", hex: "#FFFFFF" },
                quantity: 10,
                imageUrl:
                    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=OGtweE9EQm0vTmJwVFZ2Y1ZxS014UFlvYS9naDJJdU9KTWdGWjhKWFRmS3JsWm5HNGNBd0Rud0licVNoTVJXRFltcUlQTFplaEppV2xjU0huOE9Ma2c",
                price: 549000,
                id: "stock9",
            },
        ],
        category: "iphone",
    },
];

const productPageProps: ProductsPageProps = {
    category: {
        id: "1",
        name: "iPhone",
        imageUrl:
            "https://www.apple.com/vn/iphone/home/images/overview/banner/privacy__cum61s425o6e_xlarge_2x.jpg",
    },
    products: productCardDatas,
};

export interface MetaData {
    currentPage: number;
    totalPage: number;
    totalElements: number;
    pageSize: number;
}

const ProductsPage: React.FC = () => {
    // Lấy id từ URL end path
    const id = window.location.pathname.split("/").pop();
    const [metaData, setMetaData] = useState<MetaData>();
    const [pageParams, setPageParams] = useState({ page: 0, size: 6 });
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);

    const fetchCategory = async () => {
        try {
            const response = await getCategoryById(id);
            if (response.success) {
                setCategory(response.data);
            }
        } catch (error) {
            console.error("Error fetching category:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await productService.getProductsByCategory(
                id,
                pageParams
            );
            if (response.success) {
                setProducts(
                    products.concat(
                        response.data.map((product) => ({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            stocks: product.stocks,
                            category: category?.id || "",
                        }))
                    )
                );
                setMetaData(response.meta);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchCategory();
        fetchProducts();
    }, []);

    return (
        <>
            <Helmet>
                <title>{category?.name}</title>
            </Helmet>
            <div>
                <div
                    className={
                        "bg-accent sticky top-[44px] z-10 bg-opacity-75 backdrop-blur-md"
                    }
                >
                    <div
                        className={
                            "text-start container mx-auto py-5 font-semibold text-xl"
                        }
                    >
                        {category?.name}
                    </div>
                </div>
                <img
                    src={category?.image}
                    className={
                        "container h-[35rem] mx-auto rounded-3xl my-6 object-cover object-center"
                    }
                ></img>
                <div className={"container mx-auto py-24"}>
                    <div
                        className={
                            "text-start lg:pb-10 lg:text-5xl text-4xl font-medium"
                        }
                    >
                        Khám phá dòng sản phẩm {category?.name} mới nhất.
                        <div className={"text-3xl mt-2"}>
                            Mọi phiên bản.{" "}
                            <span className={"text-muted-foreground"}>
                                Hãy chọn mẫu bạn thích.
                            </span>
                        </div>
                    </div>
                    <div
                        className={
                            "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-10 mb-12"
                        }
                    >
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                stocks={product.stocks}
                                category={category?.name}
                                categoryId={id}
                            />
                        ))}
                    </div>
                    {/* Pagination */}
                    {metaData &&
                        !(metaData.currentPage == metaData.totalPage - 1) && (
                            <div className={"container mx-auto"}>
                                <div className={"flex justify-center"}>
                                    <button
                                        onClick={() => {
                                            if (
                                                metaData &&
                                                metaData.currentPage <
                                                    metaData.totalPage - 1
                                            ) {
                                                setPageParams((prev) => {
                                                    const newParams = {
                                                        ...prev,
                                                        page: prev.page + 1,
                                                    };

                                                    // Gọi fetchProducts với tham số mới
                                                    productService
                                                        .getProductsByCategory(
                                                            id,
                                                            newParams
                                                        )
                                                        .then((response) => {
                                                            if (
                                                                response.success
                                                            ) {
                                                                setProducts(
                                                                    products.concat(
                                                                        response.data.map(
                                                                            (
                                                                                product
                                                                            ) => ({
                                                                                id: product.id,
                                                                                name: product.name,
                                                                                description:
                                                                                    product.description,
                                                                                stocks: product.stocks,
                                                                                category:
                                                                                    category?.name ||
                                                                                    "",
                                                                            })
                                                                        )
                                                                    )
                                                                );
                                                                setMetaData(
                                                                    response.meta
                                                                );
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            console.error(
                                                                "Error fetching products:",
                                                                error
                                                            );
                                                        });

                                                    return newParams;
                                                });
                                            }
                                        }}
                                        className={
                                            "text-blue-600 hover:cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2"
                                        }
                                    >
                                        Xem thêm
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
