import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface ProductDetail {
    id: number;
    name: string;
    title: string;
    description: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    features: Array<{
        id: number;
        name: string;
        value: string;
    }>;
    stocks: Array<{
        id: number;
        color: {
            id: number;
            name: string;
            hex: string;
        };
        quantity: number;
        price: number;
        photos: string[];
    }>;
    instanceProperties: Array<{
        id: number;
        name: string;
        value: string;
    }>;
    createdAt: string;
    updatedAt: string;
    totalSold: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
}

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockProduct: ProductDetail = {
                id: parseInt(id || '1'),
                name: "iPhone 15 Pro",
                title: "iPhone 15 Pro. Titan mạnh mẽ. Camera tiên tiến.",
                description: "iPhone 15 Pro được chế tác từ titan cấp hàng không vũ trụ và có camera chuyên nghiệp với khả năng zoom quang học 3x. Chip A17 Pro mang đến hiệu năng đột phá.",
                category: {
                    id: 1,
                    name: "iPhone",
                    slug: "iphone"
                },
                features: [
                    { id: 1, name: "Chip", value: "A17 Pro" },
                    { id: 2, name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
                    { id: 3, name: "Màn hình", value: "6.1 inch Super Retina XDR" },
                    { id: 4, name: "Dung lượng pin", value: "Lên đến 23 giờ phát video" }
                ],
                stocks: [
                    {
                        id: 1,
                        color: { id: 1, name: "Natural Titanium", hex: "#8E8E93" },
                        quantity: 50,
                        price: 28990000,
                        photos: [
                            "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png",
                            "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium-2.png"
                        ]
                    },
                    {
                        id: 2,
                        color: { id: 2, name: "Blue Titanium", hex: "#5E7CE2" },
                        quantity: 30,
                        price: 28990000,
                        photos: [
                            "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-blue-titanium.png"
                        ]
                    }
                ],
                instanceProperties: [
                    { id: 1, name: "Bộ nhớ", value: "128GB" },
                    { id: 2, name: "Kết nối", value: "5G" },
                    { id: 3, name: "Chống nước", value: "IP68" }
                ],
                createdAt: "2024-01-15T10:30:00Z",
                updatedAt: "2024-01-20T14:45:00Z",
                totalSold: 245,
                totalRevenue: 71000000,
                averageRating: 4.8,
                reviewCount: 156
            };
            
            setProduct(mockProduct);
        } catch (error) {
            console.error('Error fetching product detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                // Replace with actual API call
                console.log('Deleting product:', id);
                alert('Sản phẩm đã được xóa thành công!');
                navigate('/admin/products');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Có lỗi xảy ra khi xóa sản phẩm!');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTotalStock = () => {
        return product?.stocks.reduce((total, stock) => total + stock.quantity, 0) || 0;
    };

    const getMinPrice = () => {
        return Math.min(...(product?.stocks.map(s => s.price) || [0]));
    };

    const getAllPhotos = () => {
        return product?.stocks.flatMap(stock => stock.photos) || [];
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
                    <p className="text-gray-600 mb-4">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
                    <button
                        onClick={() => navigate('/admin/products')}
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
                        onClick={() => navigate('/admin/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-600">ID: {product.id}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                    </Link>
                    <button
                        onClick={handleDeleteProduct}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Xóa
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Images */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
                        
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
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                                selectedImageIndex === index 
                                                    ? 'border-blue-500' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={photo}
                                                alt={`${product.name} ${index + 1}`}
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
                                    <p className="text-gray-500">Chưa có hình ảnh</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                <p className="text-gray-900">{product.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.category.name}
                                </span>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <p className="text-gray-900">{product.title}</p>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê bán hàng</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{product.totalSold}</div>
                                <div className="text-sm text-gray-600">Đã bán</div>
                            </div>
                            
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(product.totalRevenue)}</div>
                                <div className="text-sm text-gray-600">Doanh thu</div>
                            </div>
                            
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{product.averageRating}/5</div>
                                <div className="text-sm text-gray-600">Đánh giá TB</div>
                            </div>
                            
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{getTotalStock()}</div>
                                <div className="text-sm text-gray-600">Tồn kho</div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features.map((feature) => (
                                <div key={feature.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">{feature.name}</span>
                                    <span className="text-gray-900">{feature.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kho hàng</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium text-gray-700">Màu sắc</th>
                                        <th className="text-left py-2 font-medium text-gray-700">Số lượng</th>
                                        <th className="text-left py-2 font-medium text-gray-700">Giá</th>
                                        <th className="text-left py-2 font-medium text-gray-700">Hình ảnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.stocks.map((stock) => (
                                        <tr key={stock.id} className="border-b border-gray-100">
                                            <td className="py-3">
                                                <div className="flex items-center space-x-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: stock.color.hex }}
                                                    ></div>
                                                    <span>{stock.color.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    stock.quantity > 20 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : stock.quantity > 5
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {stock.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3">{formatCurrency(stock.price)}</td>
                                            <td className="py-3">
                                                <span className="text-sm text-gray-600">
                                                    {stock.photos.length} ảnh
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Instance Properties */}
                    {product.instanceProperties.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thuộc tính</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.instanceProperties.map((property) => (
                                    <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">{property.name}</span>
                                        <span className="text-gray-900">{property.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Ngày tạo:</span>
                                <span className="ml-2 text-gray-600">{formatDate(product.createdAt)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Cập nhật lần cuối:</span>
                                <span className="ml-2 text-gray-600">{formatDate(product.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
