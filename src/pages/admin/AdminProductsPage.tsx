import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";

interface Product {
    id: number;
    name: string;
    title: string;
    category: {
        id: number;
        name: string;
    };
    stocks: Array<{
        id: number;
        color: {
            name: string;
            hex: string;
        };
        quantity: number;
        price: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm, selectedCategory]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockProducts: Product[] = [
                {
                    id: 1,
                    name: "iPhone 15 Pro",
                    title: "iPhone 15 Pro. Titan mạnh mẽ. Camera tiên tiến.",
                    category: { id: 1, name: "iPhone" },
                    stocks: [
                        { id: 1, color: { name: "Natural Titanium", hex: "#8E8E93" }, quantity: 50, price: 28990000 },
                        { id: 2, color: { name: "Blue Titanium", hex: "#5E7CE2" }, quantity: 30, price: 28990000 }
                    ],
                    createdAt: "2024-01-15T10:30:00Z",
                    updatedAt: "2024-01-20T14:45:00Z"
                },
                {
                    id: 2,
                    name: "MacBook Pro 14",
                    title: "MacBook Pro 14 inch với chip M3 Pro",
                    category: { id: 2, name: "Mac" },
                    stocks: [
                        { id: 3, color: { name: "Space Gray", hex: "#5C5C5C" }, quantity: 25, price: 52990000 },
                        { id: 4, color: { name: "Silver", hex: "#E3E3E3" }, quantity: 20, price: 52990000 }
                    ],
                    createdAt: "2024-01-10T09:15:00Z",
                    updatedAt: "2024-01-18T16:20:00Z"
                }
            ];
            
            setProducts(mockProducts);
            setTotalPages(5); // Mock pagination
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                // Replace with actual API call
                console.log('Deleting product:', productId);
                // Remove from local state
                setProducts(products.filter(p => p.id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
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
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getMinPrice = (stocks: Product['stocks']) => {
        return Math.min(...stocks.map(s => s.price));
    };

    const getTotalStock = (stocks: Product['stocks']) => {
        return stocks.reduce((total, stock) => total + stock.quantity, 0);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                    <Link
                        to="/admin/products/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Thêm sản phẩm
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="iphone">iPhone</option>
                            <option value="mac">Mac</option>
                            <option value="ipad">iPad</option>
                            <option value="watch">Apple Watch</option>
                            <option value="airpods">AirPods</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tồn kho
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {product.title}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.category.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(getMinPrice(product.stocks))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            getTotalStock(product.stocks) > 20 
                                                ? 'bg-green-100 text-green-800' 
                                                : getTotalStock(product.stocks) > 5
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {getTotalStock(product.stocks)} sản phẩm
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(product.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/admin/products/${product.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/admin/products/${product.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến{' '}
                                <span className="font-medium">{Math.min(currentPage * 10, products.length)}</span> trong{' '}
                                <span className="font-medium">{products.length}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            currentPage === i + 1
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductsPage;
