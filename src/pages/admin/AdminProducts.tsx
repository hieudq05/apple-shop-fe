import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import AdminService from '../../services/adminService';
import type { AdminProduct } from '../../types/admin';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading products from API...');
      const response = await AdminService.getAdminProducts({
        page: currentPage - 1, // Backend uses 0-based pagination
        size: 10,
        search: searchTerm || undefined,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined
      });

      console.log('📦 API Response:', response);

      if (response.success && response.data) {
        setProducts(response.data || []);
        setTotalPages(response.meta?.totalPage || 1);
        setTotalItems(response.meta?.totalElements || 0);
        console.log('✅ Products loaded successfully:', response.data?.length || 0);
      } else {
        setError(response.message || 'Không thể tải danh sách sản phẩm');
        console.error('❌ API Error:', response);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError('Có lỗi xảy ra khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo - Updated to match backend DTO
  const mockProducts: AdminProduct[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      description: 'Flagship smartphone với chip A17 Pro',
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      updatedAt: '2024-01-20T15:30:00Z',
      updatedBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      category: {
        id: 1,
        name: 'iPhone',
        image: ''
      },
      stocks: [
        {
          id: 1,
          quantity: 150,
          imageUrl: '/images/iphone-15-pro-max.jpg',
          price: 29990000
        }
      ]
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      description: 'Laptop siêu mỏng với chip M3 mạnh mẽ',
      createdAt: '2024-01-10T09:00:00Z',
      createdBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      updatedAt: '2024-01-18T14:20:00Z',
      updatedBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      category: {
        id: 2,
        name: 'MacBook',
        image: ''
      },
      stocks: [
        {
          id: 2,
          quantity: 75,
          imageUrl: '/images/macbook-air-m3.jpg',
          price: 27990000
        }
      ]
    },
    {
      id: 3,
      name: 'iPad Pro 12.9"',
      description: 'Tablet chuyên nghiệp với màn hình Liquid Retina XDR',
      createdAt: '2024-01-05T08:00:00Z',
      createdBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      updatedAt: '2024-01-15T11:45:00Z',
      updatedBy: {
        id: 1,
        email: 'admin@appleshop.com',
        firstName: 'Admin',
        lastName: 'User',
        image: ''
      },
      category: {
        id: 3,
        name: 'iPad',
        image: ''
      },
      stocks: [
        {
          id: 3,
          quantity: 0,
          imageUrl: '/images/ipad-pro-12.jpg',
          price: 25990000
        }
      ]
    }
  ];

  // Use real products data, fallback to mock only if no data and no error
  const displayProducts = products.length > 0 ? products : (error ? [] : mockProducts);

  const categories = [
    { id: '', name: 'Tất cả danh mục' },
    { id: '1', name: 'iPhone' },
    { id: '2', name: 'MacBook' },
    { id: '3', name: 'iPad' },
    { id: '4', name: 'Apple Watch' },
    { id: '5', name: 'AirPods' }
  ];

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const response = await AdminService.deleteProduct(productId);
        if (response.success) {
          loadProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm trong cửa hàng</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/create')}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <div className="relative">
              <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadProducts}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách sản phẩm ({totalItems})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có sản phẩm nào
          </div>
        ) : (
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
                    Kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
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
                {displayProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.stocks[0]?.imageUrl || '/placeholder-image.jpg'}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stocks.length > 0 ? formatPrice(product.stocks[0].price) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stocks.reduce((total, stock) => total + stock.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stocks.reduce((total, stock) => total + stock.quantity, 0) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stocks.reduce((total, stock) => total + stock.quantity, 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(product.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          bởi {product.createdBy.firstName} {product.createdBy.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalItems)}
                </span>
                {' '}trong{' '}
                <span className="font-medium">{totalItems}</span>
                {' '}kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
