import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import adminProductService from "../../services/adminProductService";

interface ProductDetail {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    createdBy: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image: string;
    };
    updatedAt: string;
    updatedBy: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image: string;
    };
    category: {
        id: number;
        name: string;
        image: string;
    };
    features: Array<{
        id: number;
        name: string;
        description: string;
        image: string;
        createdAt: string;
    }>;
    promotions: [];
    reviews: [];
    stocks: Array<{
        id: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        quantity: number;
        price: number;
        productPhotos: Array<{
            id: number;
            imageUrl: string;
            alt: string;
        }>;
        instanceProperties: Array<{
            id: number;
            name: string;
        }>;
    }>;
}

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            setIsLoading(true);
            const response = adminProductService.getAdminProductById(categoryId, id);
            const result = await response;
            if (result.success) {
                console.log("Product detail fetched successfully:", result.data);
                setProduct(result.data);
            } else {
                console.error("Error fetching product detail:", result.message);
            }
        } catch (error) {
            console.error("Error fetching product detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            try {
                // Replace with actual API call
                console.log("Deleting product:", id);
                alert("Sản phẩm đã được xóa thành công!");
                navigate("/admin/products");
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Có lỗi xảy ra khi xóa sản phẩm!");
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTotalStock = () => {
        return (
            product?.stocks.reduce(
                (total, stock) => total + stock.quantity,
                0
            ) || 0
        );
    };

    const getAllPhotos = () => {
        return (
            product?.stocks.flatMap((stock) =>
                stock.productPhotos?.map((p) => p.imageUrl)
            ) || []
        );
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 rounded"></div>
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy sản phẩm
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Sản phẩm có thể đã bị xóa hoặc không tồn tại.
                    </p>
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const allPhotos = getAllPhotos();

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {product.name}
                        </h1>
                        <p className="text-gray-600">ID: {product.id}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Link
                        to={`/admin/products/${product.category.id}/${product.id}/edit`}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDeleteProduct}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Images */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Hình ảnh sản phẩm
                        </h2>

                        {allPhotos.length > 0 ? (
                            <div>
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                    <img
                                        src={allPhotos[selectedImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {allPhotos.map((photo, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setSelectedImageIndex(index)
                                            }
                                            className={`aspect-square rounded-lg overflow-hidden border-2 p-0 ${
                                                selectedImageIndex === index
                                                    ? "border-blue-500"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <img
                                                src={photo}
                                                alt={`${product.name} ${
                                                    index + 1
                                                }`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">
                                        Chưa có hình ảnh
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin cơ bản
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên sản phẩm
                                </label>
                                <p className="text-gray-900">{product.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục
                                </label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.category.name}
                                </span>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <p className="text-gray-600">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thống kê bán hàng
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {getTotalStock()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Tồn kho
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Tính năng
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features?.map((feature) => (
                                <div
                                    key={feature.id}
                                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                                >
                                    <img
                                        src={feature.image}
                                        alt={feature.name}
                                        className="w-16 h-16 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-700">
                                            {feature.name}
                                        </span>
                                        <p className="text-gray-600 text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin kho hàng
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium text-gray-700">
                                            Màu sắc
                                        </th>
                                        <th className="text-left py-2 font-medium text-gray-700">
                                            Phiên bản
                                        </th>
                                        <th className="text-left py-2 font-medium text-gray-700">
                                            Số lượng
                                        </th>
                                        <th className="text-left py-2 font-medium text-gray-700">
                                            Giá
                                        </th>
                                        <th className="text-left py-2 font-medium text-gray-700">
                                            Hình ảnh
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.stocks.map((stock) => (
                                        <tr
                                            key={stock.id}
                                            className="border-b border-gray-100"
                                        >
                                            <td className="py-3">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                stock.color?.hexCode,
                                                        }}
                                                    ></div>
                                                    <span>
                                                        {stock.color?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {stock.instanceProperties?.length >
                                                0 ? (
                                                    stock.instanceProperties
                                                        .map(
                                                            (property) =>
                                                                property.name
                                                        )
                                                        .join(", ")
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Không có phiên bản
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        stock.quantity > 20
                                                            ? "bg-green-100 text-green-800"
                                                            : stock.quantity > 5
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {stock.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {formatCurrency(stock.price)}
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-gray-600">
                                                    {stock.productPhotos?.length}{" "}
                                                    ảnh
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Instance Properties */}
                    {product.stocks.map(
                        (stock) =>
                            stock.instanceProperties?.length > 0 && (
                                <div
                                    key={stock.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                >
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Thuộc tính cho màu {stock.color?.name}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {stock.instanceProperties?.map(
                                            (property) => (
                                                <div
                                                    key={property.id}
                                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <span className="font-medium text-gray-700">
                                                        {property.name}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                    )}

                    {/* Metadata */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Thông tin hệ thống
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">
                                    Ngày tạo:
                                </span>
                                <span className="ml-2 text-gray-600">
                                    {formatDate(product.createdAt)}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Cập nhật lần cuối:
                                </span>
                                <span className="ml-2 text-gray-600">
                                    {formatDate(product.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
