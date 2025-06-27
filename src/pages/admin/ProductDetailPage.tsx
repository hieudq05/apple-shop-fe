import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import adminProductService from "../../services/adminProductService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel";

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
            if (!categoryId || !id) {
                console.error("Missing categoryId or id");
                return;
            }
            const response = await adminProductService.getAdminProductById(
                parseInt(categoryId),
                parseInt(id)
            );
            if (response.success && response.data) {
                console.log("Product detail fetched successfully:", response.data);
                setProduct(response.data);
            } else {
                console.error("Error fetching product detail:", response.message);
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
                    <Button
                        onClick={() => navigate("/admin/products")}
                        variant="outline"
                    >
                        Quay lại danh sách
                    </Button>
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
                    <Button
                        onClick={() => navigate("/admin/products")}
                        variant="ghost"
                        size="sm"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {product.name}
                        </h1>
                        <p className="text-gray-600">ID: {product.id}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                    >
                        <Link
                            to={`/admin/products/${product.category.id}/${product.id}/edit`}
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <Button
                        onClick={handleDeleteProduct}
                        variant="destructive"
                        size="sm"
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Images */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PhotoIcon className="w-5 h-5 mr-2" />
                                Hình ảnh sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Product Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    <Badge variant="secondary">
                                        {product.category.name}
                                    </Badge>
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
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê bán hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {getTotalStock()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tổng tồn kho
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {product.stocks.length}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Phiên bản
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {product.features?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Tính năng
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {allPhotos.length}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Hình ảnh
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin kho hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Màu sắc</TableHead>
                                        <TableHead>Phiên bản</TableHead>
                                        <TableHead>Số lượng</TableHead>
                                        <TableHead>Giá</TableHead>
                                        <TableHead>Hình ảnh</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.stocks.map((stock) => (
                                        <TableRow key={stock.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                stock.color?.hexCode,
                                                        }}
                                                    />
                                                    <span>{stock.color?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {stock.instanceProperties?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {stock.instanceProperties.map((property) => (
                                                            <Badge
                                                                key={property.id}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {property.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Không có phiên bản
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        stock.quantity > 20
                                                            ? "default"
                                                            : stock.quantity > 5
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {stock.quantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {formatCurrency(stock.price)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {stock.productPhotos?.length || 0} ảnh
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tính năng sản phẩm</CardTitle>
                                <CardDescription>
                                    {product.features.length} tính năng được cấu hình
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.features.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex items-start p-3 bg-gray-50 rounded-lg"
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.name}
                                                className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-700 mb-1">
                                                    {feature.name}
                                                </h4>
                                                <p className="text-gray-600 text-sm">
                                                    {feature.description}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    ID: {feature.id}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hệ thống</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">
                                        Người tạo:
                                    </span>
                                    <div className="mt-1">
                                        <p className="text-gray-900">
                                            {product.createdBy?.firstName} {product.createdBy?.lastName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {product.createdBy?.email}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">
                                        Người cập nhật:
                                    </span>
                                    <div className="mt-1">
                                        <p className="text-gray-900">
                                            {product.updatedBy?.firstName} {product.updatedBy?.lastName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {product.updatedBy?.email}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">
                                        Ngày tạo:
                                    </span>
                                    <p className="text-gray-600 mt-1">
                                        {formatDate(product.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">
                                        Cập nhật lần cuối:
                                    </span>
                                    <p className="text-gray-600 mt-1">
                                        {formatDate(product.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
