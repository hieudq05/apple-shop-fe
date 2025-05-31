import React from "react";
import ProductCard, {type Product} from "../components/ProductCard.tsx";
import Footer from "../components/Footer.tsx";

export interface Category {
    id: string;
    name: string;
    imageUrl: string;
}

export interface ProductsPageProps {
    category: Category;
    products: Product[];
}

const productDatas: Product[] = [
    {
        id: "1",
        name: "iPhone 16 Pro",
        title: "Một iPhone cực đỉnh.",
        stock: [
            {
                color: {id: "1", name: "Titan Đen", hex: "#4D4D4D"},
                quantity: 10,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NzFzS1BRRzA4NTJUci9vckVTY21rM2lCQmV2WTA2cncybDF2YzFnKzI0S2prMCtUNWwzYWR0UVU3TWVsbEdUeXZka3Q2dVFYV2lxTm4wNXBJcGZoM1RkcERRMUVIWTBwNlRNS3dVelNTTTVB&traceId=1",
                price: 999,
                id: "stock1"
            },
            {
                color: {id: "2", name: "Titan tự nhiên", hex: "#C0C0C0"},
                quantity: 5,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eUdsd0dIb3VUOXdtWkY0VFUwVE8vbEdkZHNlSjBQRklnaFB2d3I5MW94NVJrY0tZVVQzOFFrQ2FwbFZZamEzeEpOZTBYalh5Vk90cEc1K2wwRzFGejRMeXJHUnUva2huMjl4akFHOXNwVjA0YXFmK3VWSWZuRE9oVEFyUFR0T2hWSm5HQVhUeDlTTVJFSzVnTlpqdUV3&traceId=1",
                price: 1099,
                id: "stock2"
            }
        ]
    },
    {
        id: "2",
        name: "iPhone 16",
        title: "Một thiết bị siêu mạnh mẽ.",
        stock: [
            {
                color: {id: "3", name: "Xanh lưu ly", hex: "#A1B3F7"},
                quantity: 8,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=5120&hei=2880&fmt=webp&qlt=70&.v=UXp1U3VDY3IyR1hNdHZwdFdOLzg1V0tFK1lhSCtYSGRqMUdhR284NTN4L28rSU1jVGx4VGxCNEFSdVNXdG1RdzJrQmVLSXFrTCsvY1VvVmRlZkVnMzJKTG1lVWJJT2RXQWE0Mm9rU1V0V0E5L1ZBdzY3RU1aTVdUR3lMZHFNVzE0RzhwM3RLeUk1S0YzTkJVVmF2Ly9R&traceId=1",
                price: 1299,
                id: "stock3"
            }
        ]
    },
    {
        id: "3",
        name: "iPhone 15 Plus",
        title: "Luôn tuyệt vời như thế.",
        stock: [
            {
                color: {id: "4", name: "Vàng", hex: "#fffbb3"},
                quantity: 12,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-yellow?wid=5120&hei=2880&fmt=webp&qlt=70&.v=cHJOTXEwTU92OEtKVDV2cVB1R2FTSjlERndlRTljaUdZeHJGM3dlLzR2K3IraXRtcU5ZQzFyR0o2ZWRlT1gzcTBoUVhuTWlrY2hIK090ZGZZbk9HeE1xUVVnSHY5eU9CcGxDMkFhalkvT0RIdDljQkJUS0FHR3FmR0lmaWxIVm1mbW94YnYxc1YvNXZ4emJGL0IxNFp3&traceId=1",
                price: 1399,
                id: "stock4"
            }
        ]
    },
    {
        id: "4",
        name: "iPhone 16E",
        title: "iPhone mới nhất với giá tốt nhất.",
        stock: [
            {
                color: {id: "5", name: "Trắng", hex: "#FFFFFF"},
                quantity: 6,
                imageUrl: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16e-storage-select-202502-white?wid=5120&hei=2880&fmt=webp&qlt=70&.v=eFBweGhLQWJCMzdyL2JTbG01RkJOSElKUkFlSEo1QVc1bW5RWkJPZnpCdGVjcGp3cGhIRW44Y2pmcUZ3N29HSkJQYkhSV3V1dC9oa0s5K3lqMGtUaFFmZ1pwOWJCVE1GNVJiNDlDdjlveUtiN3QrT0xpeXBZbGRXNE9GK28zTGo&traceId=1",
                price: 1599,
                id: "stock5"
            }
        ]
    }
];

const productPageProps: ProductsPageProps = {
    category: {
        id: "1",
        name: "iPhone",
        imageUrl: "https://www.apple.com/vn/iphone/home/images/overview/banner/privacy__cum61s425o6e_xlarge_2x.jpg"
    },
    products: productDatas
}

const ProductsPage: React.FC = () => {
    return (
        <>
            <div>
                <div className={"bg-gray-100 sticky top-[52px] z-10 bg-opacity-75 backdrop-blur-md"}>
                    <div
                        className={"text-start max-w-7xl mx-auto py-5 font-semibold text-xl"}>{productPageProps.category.name}</div>
                </div>
                <div className={"max-w-7xl h-[35rem] mx-auto rounded-3xl my-6"}
                     style={{
                         backgroundImage: `url(https://www.apple.com/vn/iphone/home/images/overview/banner/privacy__cum61s425o6e_xlarge_2x.jpg)`,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                     }}></div>
                <div className={"max-w-7xl mx-auto"}>
                    <div className={"text-start py-12 text-5xl font-semibold"}>
                        Khám phá dòng sản phẩm {productPageProps.category.name} mới nhất.
                    </div>
                    <div className={"grid grid-cols-1 gap-16 lg:grid-cols-3 md:grid-cols-2"}>
                        {
                            productPageProps.products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    title={product.title}
                                    stock={product.stock}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default ProductsPage;