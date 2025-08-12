import React, { useEffect, useState } from "react";
import ProductCard, {
    type ProductCardProps,
} from "../components/ProductCard.tsx";
import productService, { type Product } from "@/services/productService.ts";
import { getCategoryById, type Category } from "@/services/categoryService.ts";
import { Helmet } from "react-helmet-async";

export interface ProductsPageProps {
    category: Category;
    products: ProductCardProps[];
}

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
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);

    const fetchCategory = async () => {
        try {
            if (!id) return;
            const response = await getCategoryById(Number(id));
            if (response.success) {
                setCategory(response.data || null);
            }
        } catch (error) {
            console.error("Error fetching category:", error);
        }
    };
    const fetchProducts = async () => {
        try {
            if (!id) return;
            const response = await productService.getProductsByCategory(
                Number(id),
                pageParams
            );
            if (response.success) {
                setProducts(response.data || []);
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
                            <ProductCard key={product.id} product={product} />
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
                                                    productService
                                                        .getProductsByCategory(
                                                            Number(id),
                                                            newParams
                                                        )
                                                        .then((response) => {
                                                            if (
                                                                response.success
                                                            ) {
                                                                if (
                                                                    response.data
                                                                ) {
                                                                    setProducts(
                                                                        products.concat(
                                                                            response.data
                                                                        )
                                                                    );
                                                                }
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
