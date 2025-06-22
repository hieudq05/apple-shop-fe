import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
    id: number;
    name: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
}

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get('minPrice') || '',
        max: searchParams.get('maxPrice') || ''
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        { id: '', name: 'Tất cả sản phẩm' },
        { id: 'iphone', name: 'iPhone' },
        { id: 'mac', name: 'Mac' },
        { id: 'ipad', name: 'iPad' },
        { id: 'watch', name: 'Apple Watch' },
        { id: 'airpods', name: 'AirPods' },
        { id: 'accessories', name: 'Phụ kiện' }
    ];

    const sortOptions = [
        { value: 'relevance', label: 'Liên quan nhất' },
        { value: 'price-asc', label: 'Giá: Thấp đến cao' },
        { value: 'price-desc', label: 'Giá: Cao đến thấp' },
        { value: 'name-asc', label: 'Tên: A-Z' },
        { value: 'name-desc', label: 'Tên: Z-A' },
        { value: 'rating', label: 'Đánh giá cao nhất' }
    ];

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchTerm(query);
            performSearch();
        }
    }, [searchParams]);

    useEffect(() => {
        if (searchTerm) {
            performSearch();
        }
    }, [selectedCategory, priceRange, sortBy]);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock search results
            const mockProducts: Product[] = [
                {
                    id: 1,
                    name: "iPhone 15 Pro",
                    title: "iPhone 15 Pro 128GB - Natural Titanium",
                    price: 28990000,
                    originalPrice: 30990000,
                    image: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-natural-titanium.png",
                    category: "iPhone",
                    rating: 4.8,
                    reviewCount: 245,
                    inStock: true
                },
                {
                    id: 2,
                    name: "MacBook Pro 14",
                    title: "MacBook Pro 14 inch M3 Pro 512GB - Space Gray",
                    price: 52990000,
                    image: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/10/31/macbook-pro-14-m3-pro-space-gray.png",
                    category: "Mac",
                    rating: 4.9,
                    reviewCount: 89,
                    inStock: true
                },
                {
                    id: 3,
                    name: "iPad Pro 11",
                    title: "iPad Pro 11 inch M4 256GB WiFi - Space Gray",
                    price: 25990000,
                    originalPrice: 27990000,
                    image: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2024/05/08/ipad-pro-11-m4-space-gray.png",
                    category: "iPad",
                    rating: 4.7,
                    reviewCount: 156,
                    inStock: false
                },
                {
                    id: 4,
                    name: "Apple Watch Series 9",
                    title: "Apple Watch Series 9 45mm GPS - Midnight Aluminum",
                    price: 9990000,
                    image: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/apple-watch-series-9-midnight.png",
                    category: "Apple Watch",
                    rating: 4.6,
                    reviewCount: 203,
                    inStock: true
                }
            ];
            
            // Filter products based on search criteria
            let filteredProducts = mockProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (selectedCategory) {
                filteredProducts = filteredProducts.filter(product => 
                    product.category.toLowerCase() === selectedCategory.toLowerCase()
                );
            }

            if (priceRange.min) {
                filteredProducts = filteredProducts.filter(product => 
                    product.price >= parseInt(priceRange.min)
                );
            }

            if (priceRange.max) {
                filteredProducts = filteredProducts.filter(product => 
                    product.price <= parseInt(priceRange.max)
                );
            }

            // Sort products
            switch (sortBy) {
                case 'price-asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    // Keep original order for relevance
                    break;
            }

            setProducts(filteredProducts);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const params = new URLSearchParams();
            params.set('q', searchTerm.trim());
            if (selectedCategory) params.set('category', selectedCategory);
            if (priceRange.min) params.set('minPrice', priceRange.min);
            if (priceRange.max) params.set('maxPrice', priceRange.max);
            if (sortBy !== 'relevance') params.set('sort', sortBy);
            setSearchParams(params);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setSortBy('relevance');
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        setSearchParams(params);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search Header */}
            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </form>

                {searchTerm && (
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Kết quả tìm kiếm cho "{searchTerm}"
                        </h1>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FunnelIcon className="w-4 h-4 mr-2" />
                            Bộ lọc
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-8">
                {/* Filters Sidebar */}
                <div className={`w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Xóa tất cả
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <label key={category.id} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category.id}
                                            checked={selectedCategory === category.id}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Khoảng giá</h4>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder="Giá từ"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá đến"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Sắp xếp theo</h4>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="mb-4 text-sm text-gray-600">
                                Tìm thấy {products.length} sản phẩm
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {!product.inStock && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-medium">Hết hàng</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-center mb-2">
                                                {renderStars(product.rating)}
                                                <span className="text-sm text-gray-500 ml-1">
                                                    ({product.reviewCount})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="text-sm text-gray-500 line-through ml-2">
                                                            {formatCurrency(product.originalPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : searchTerm ? (
                        <div className="text-center py-12">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                            </p>
                            <button
                                onClick={clearFilters}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nhập từ khóa để tìm kiếm
                            </h3>
                            <p className="text-gray-600">
                                Tìm kiếm iPhone, Mac, iPad và nhiều sản phẩm Apple khác
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
