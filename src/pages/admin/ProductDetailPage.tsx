import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import adminProductService, {
    type AdminProduct,
} from "../../services/adminProductService";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                setProduct(response.data);
            } else {
                console.error(
                    "Error fetching product detail:",
                    response.message
                );
            }
        } catch (error) {
            console.error("Error fetching product detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        setIsDeleting(true);
        try {
            if (!product) return;
            const response = await adminProductService.deleteProduct(
                product.id,
                product.categoryId
            );
            if (response.success) {
                console.log("Product deleted successfully");
                navigate("/admin/products");
            } else {
                console.error("Error deleting product:", response.message);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
        setIsDeleting(false);
        setIsDialogOpen(false);
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
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Không tìm thấy sản phẩm
                    </h2>
                    <p className="text-muted-foreground mb-4">
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
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {product.name}
                        </h1>
                        <p className="text-muted-foreground">
                            ID: {product.id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            to={`/admin/products/${product.categoryId}/${product.id}/edit`}
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
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
                    <Card className={"rounded-3xl"}>
                        <CardContent>
                            {allPhotos.length > 0 ? (
                                <div>
                                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={
                                                typeof allPhotos[
                                                    selectedImageIndex
                                                ] === "string"
                                                    ? allPhotos[
                                                          selectedImageIndex
                                                      ]
                                                    : ""
                                            }
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
                                                    src={
                                                        typeof photo ===
                                                        "string"
                                                            ? photo
                                                            : ""
                                                    }
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
                                <div className="aspect-square bg-foreground/5 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <EyeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">
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
                    <Card className={"rounded-3xl"}>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Tên sản phẩm
                                    </label>
                                    <p className="text-foreground">
                                        {product.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Danh mục
                                    </label>
                                    <Badge variant="outline">
                                        {product.categoryName}
                                    </Badge>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Mô tả
                                    </label>
                                    <p className="text-foreground">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card className={"rounded-3xl"}>
                        <CardHeader>
                            <CardTitle>Thống kê bán hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-foreground/5 border rounded-2xl">
                                    <div className="text-2xl font-bold text-foreground">
                                        {getTotalStock()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Tổng tồn kho
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-foreground/5 border rounded-2xl">
                                    <div className="text-2xl font-bold text-foreground">
                                        {product.stocks.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Phiên bản
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-foreground/5 border rounded-2xl">
                                    <div className="text-2xl font-bold text-foreground">
                                        {product.features?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Tính năng
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-foreground/5 border rounded-2xl">
                                    <div className="text-2xl font-bold text-foreground">
                                        {allPhotos.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Hình ảnh
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card className={"rounded-3xl"}>
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
                                        <TableRow
                                            className={"h-18"}
                                            key={stock.id}
                                        >
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                stock.hexCode,
                                                        }}
                                                    />
                                                    <span>
                                                        {stock.colorName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {(stock?.instanceProperties
                                                    ?.length || 0) > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {stock?.instanceProperties?.map(
                                                            (property) => (
                                                                <Badge
                                                                    key={
                                                                        property.id
                                                                    }
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        property.name
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
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
                                                    {formatCurrency(
                                                        stock.price
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {stock.productPhotos
                                                        ?.length || 0}{" "}
                                                    ảnh
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
                        <Card className={"rounded-3xl"}>
                            <CardHeader>
                                <CardTitle>Tính năng sản phẩm</CardTitle>
                                <CardDescription>
                                    {product.features.length} tính năng được cấu
                                    hình
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.features.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex items-start p-3 bg-foreground/5 hover:outline transition rounded-xl"
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.name}
                                                className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-foreground mb-1">
                                                    {feature.name}
                                                </h4>
                                                <p className="text-muted-foreground text-sm">
                                                    {feature.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground/50 mt-1">
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
                    <Card className={"rounded-3xl"}>
                        <CardHeader>
                            <CardTitle>Thông tin hệ thống</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs">
                                        Người tạo:
                                    </span>
                                    <div className="mt-1 flex gap-2 items-center">
                                        <img
                                            src={product.createdBy?.image}
                                            alt=""
                                            className={
                                                "size-10 rounded-full object-cover"
                                            }
                                        />
                                        <div>
                                            <p className="text-foreground">
                                                {product.createdBy?.firstName}{" "}
                                                {product.createdBy?.lastName}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {product.createdBy?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">
                                        Người cập nhật:
                                    </span>
                                    <div className="mt-1 flex gap-2 items-center">
                                        <img
                                            src={product.updatedBy?.image}
                                            alt=""
                                            className={
                                                "size-10 rounded-full object-cover"
                                            }
                                        />
                                        <div>
                                            <p className="text-foreground">
                                                {product.updatedBy?.firstName}{" "}
                                                {product.updatedBy?.lastName}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {product.updatedBy?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">
                                        Ngày tạo:
                                    </span>
                                    <div className={"flex gap-2 items-center"}>
                                        <Clock
                                            className={
                                                "size-4 mt-1 text-muted-foreground"
                                            }
                                        />
                                        <p className="text-foreground mt-1">
                                            {formatDate(product.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">
                                        Cập nhật lần cuối:
                                    </span>
                                    <div className={"flex gap-2 items-center"}>
                                        <Clock
                                            className={
                                                "size-4 mt-1 text-muted-foreground"
                                            }
                                        />
                                        <p className="text-foreground mt-1">
                                            {formatDate(product.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm "{product.name}"?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProductDetailPage;
