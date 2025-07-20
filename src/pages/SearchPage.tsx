import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import searchService, {
    type SearchProduct,
    type SearchFilters,
} from "../services/searchService";
import { fetchCategories, type Category } from "../services/categoryService";
import { fetchColors, type Color } from "../services/colorService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { X } from "lucide-react";

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get("category")?.split(",").filter(Boolean) || []
    );
    const [selectedColors, setSelectedColors] = useState<number[]>(
        searchParams
            .get("colors")
            ?.split(",")
            .map((id) => parseInt(id))
            .filter(Boolean) || []
    );
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get("minPrice") || "",
        max: searchParams.get("maxPrice") || "",
    });
    const [inStockOnly, setInStockOnly] = useState(
        searchParams.get("inStock") === "true"
    );
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");
    const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">(
        (searchParams.get("direction") as "ASC" | "DESC") || "ASC"
    );
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // API data
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableColors, setAvailableColors] = useState<Color[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);

    const sortOptions = [
        { value: "name", label: "Tên sản phẩm" },
        { value: "createdbyname", label: "Ngày mở bán" },
        { value: "quantity", label: "Giá" },
        { value: "createdAt", label: "Mới nhất" },
        { value: "updatedAt", label: "Cập nhật gần đây" },
    ];

    // Fetch filter data
    const fetchFilterData = useCallback(async () => {
        setIsLoadingFilters(true);
        try {
            const [categoriesData, colorsData] = await Promise.all([
                fetchCategories(),
                fetchColors(),
            ]);
            setCategories(categoriesData);
            setAvailableColors(colorsData);
        } catch (error) {
            console.error("Error fetching filter data:", error);
        } finally {
            setIsLoadingFilters(false);
        }
    }, []);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData]);

    // Auto search khi component mount để hiển thị tất cả sản phẩm
    useEffect(() => {
        performSearch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const performSearch = useCallback(async () => {
        console.log("performSearch called with:", {
            searchTerm,
            selectedCategories,
            selectedColors,
            priceRange,
            inStockOnly,
            // sortBy,
            // sortDirection,
            currentPage,
        });

        setIsLoading(true);
        try {
            const filters: SearchFilters = {
                searchKeyword: searchTerm || undefined,
                categoryId:
                    selectedCategories.length > 0
                        ? selectedCategories
                              .map((id) => parseInt(id))
                              .filter((id) => !isNaN(id))
                        : undefined,
                colorIds:
                    selectedColors.length > 0 ? selectedColors : undefined,
                minPrice: priceRange.min ? parseInt(priceRange.min) : undefined,
                maxPrice: priceRange.max ? parseInt(priceRange.max) : undefined,
                inStock: inStockOnly || undefined,
            };

            console.log("Sending search request with filters:", filters);
            const response = await searchService.searchProducts(filters);
            console.log("Search response:", response);

            if (response.success) {
                console.log("Setting products:", response.data);
                setProducts(response.data);
                setCurrentPage(response.meta.currentPage);
                setTotalPages(response.meta.totalPage);
                setTotalElements(response.meta.totalElements);
            } else {
                console.log("Search was not successful:", response);
                setProducts([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [
        searchTerm,
        selectedCategories,
        selectedColors,
        priceRange,
        inStockOnly,
        // sortBy,
        // sortDirection,
        currentPage,
    ]);

    useEffect(() => {
        const query = searchParams.get("q");
        if (query) {
            console.log("Setting search term from URL:", query);
            setSearchTerm(query);
        }

        // Kiểm tra nếu có bất kỳ filter nào từ URL, thực hiện search
        const hasUrlFilters =
            query ||
            searchParams.get("category") ||
            searchParams.get("colors") ||
            searchParams.get("minPrice") ||
            searchParams.get("maxPrice") ||
            searchParams.get("inStock");
        //|| searchParams.get("sort") ||
        // searchParams.get("direction");

        if (hasUrlFilters) {
            performSearch();
        }
    }, [searchParams, performSearch]);

    useEffect(() => {
        // Luôn luôn search khi có thay đổi các parameter (kể cả khi tất cả đều empty)
        performSearch();
    }, [
        searchTerm,
        selectedCategories,
        selectedColors,
        priceRange,
        inStockOnly,
        sortBy,
        sortDirection,
        currentPage,
        performSearch,
    ]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        // Thêm search term nếu có
        if (searchTerm.trim()) {
            params.set("q", searchTerm.trim());
        }

        // Thêm các filter khác
        if (selectedCategories.length > 0)
            params.set("category", selectedCategories.join(","));
        if (selectedColors.length > 0)
            params.set("colors", selectedColors.join(","));
        if (priceRange.min) params.set("minPrice", priceRange.min);
        if (priceRange.max) params.set("maxPrice", priceRange.max);
        if (inStockOnly) params.set("inStock", "true");
        // if (sortBy !== "name") params.set("sort", sortBy);
        // if (sortDirection !== "ASC") params.set("direction", sortDirection);

        setSearchParams(params);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedColors([]);
        setPriceRange({ min: "", max: "" });
        setInStockOnly(false);
        // setSortBy("name");
        // setSortDirection("ASC");
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        setSearchParams(params);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Helper function to get selected color names
    const getSelectedColorNames = () => {
        return availableColors
            .filter((color) => selectedColors.includes(color.id ?? 0))
            .map((color) => color.name);
    };

    // Helper function to get selected category names
    const getSelectedCategoryNames = () => {
        return categories
            .filter((category) =>
                selectedCategories.includes(category.id?.toString() ?? "")
            )
            .map((category) => category.name);
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
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                searchParams.set("q", e.target.value);
                            }}
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

                {(searchTerm ||
                    selectedCategories.length > 0 ||
                    selectedColors.length > 0 ||
                    priceRange.min ||
                    priceRange.max ||
                    inStockOnly ||
                    products.length > 0) && (
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {searchTerm
                                ? `Kết quả tìm kiếm cho "${searchTerm}"`
                                : selectedCategories.length > 0 ||
                                  selectedColors.length > 0 ||
                                  priceRange.min ||
                                  priceRange.max ||
                                  inStockOnly
                                ? "Kết quả lọc sản phẩm"
                                : "Tất cả sản phẩm"}
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
                <div
                    className={`w-64 space-y-6 ${
                        showFilters ? "block" : "hidden lg:block"
                    }`}
                >
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">
                                Bộ lọc
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Xóa tất cả
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Danh mục
                            </h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors">
                                        <span className="text-sm text-gray-700 truncate">
                                            {selectedCategories.length > 0
                                                ? selectedCategories.length ===
                                                  1
                                                    ? getSelectedCategoryNames()[0]
                                                    : `${selectedCategories.length} danh mục đã chọn`
                                                : "Chọn danh mục"}
                                        </span>
                                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0 ml-2" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-52 max-h-60 overflow-y-auto">
                                    {isLoadingFilters ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">
                                            <div className="animate-pulse">
                                                Đang tải...
                                            </div>
                                        </div>
                                    ) : categories.length > 0 ? (
                                        <>
                                            {selectedCategories.length > 0 && (
                                                <>
                                                    <div className="p-0">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedCategories(
                                                                    []
                                                                )
                                                            }
                                                            className="w-full flex items-center gap-2 text-left text-sm text-red-600 hover:text-red-800 py-1 px-2 rounded hover:bg-red-50"
                                                        >
                                                            <X className="size-4" />
                                                            Xóa tất cả đã chọn
                                                        </button>
                                                    </div>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            {categories.map((category) => (
                                                <DropdownMenuCheckboxItem
                                                    key={category.id}
                                                    checked={selectedCategories.includes(
                                                        category.id?.toString() ||
                                                            ""
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        const categoryId =
                                                            category.id?.toString() ||
                                                            "";
                                                        if (checked) {
                                                            setSelectedCategories(
                                                                (prev) => [
                                                                    ...prev,
                                                                    categoryId,
                                                                ]
                                                            );
                                                        } else {
                                                            setSelectedCategories(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            categoryId
                                                                    )
                                                            );
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <span className="truncate">
                                                        {category.name}
                                                    </span>
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="p-3 text-sm text-gray-500 text-center">
                                            Không có danh mục nào
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Color Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Màu sắc
                            </h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors">
                                        <span className="text-sm text-gray-700 truncate">
                                            {selectedColors.length > 0
                                                ? selectedColors.length === 1
                                                    ? getSelectedColorNames()[0]
                                                    : `${selectedColors.length} màu đã chọn`
                                                : "Chọn màu sắc"}
                                        </span>
                                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0 ml-2" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-52 max-h-60 overflow-y-auto">
                                    {isLoadingFilters ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">
                                            <div className="animate-pulse">
                                                Đang tải...
                                            </div>
                                        </div>
                                    ) : availableColors.length > 0 ? (
                                        <>
                                            {selectedColors.length > 0 && (
                                                <>
                                                    <div className="p-0">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedColors(
                                                                    []
                                                                )
                                                            }
                                                            className="w-full gap-2 flex items-center text-left text-sm text-red-600 hover:text-red-800 py-1 px-2 rounded hover:bg-red-50"
                                                        >
                                                            <X className="size-4" />
                                                            Xóa tất cả đã chọn
                                                        </button>
                                                    </div>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            {availableColors.map((color) => (
                                                <DropdownMenuCheckboxItem
                                                    key={color.id}
                                                    checked={selectedColors.includes(
                                                        color.id ?? 0
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        const colorId =
                                                            color.id ?? 0;
                                                        if (checked) {
                                                            setSelectedColors(
                                                                (prev) => [
                                                                    ...prev,
                                                                    colorId,
                                                                ]
                                                            );
                                                        } else {
                                                            setSelectedColors(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            colorId
                                                                    )
                                                            );
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center w-full">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-300 mr-3 flex-shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    color.hexCode,
                                                            }}
                                                        />
                                                        <span className="truncate">
                                                            {color.name}
                                                        </span>
                                                    </div>
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="p-3 text-sm text-gray-500 text-center">
                                            Không có màu sắc nào
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Khoảng giá
                            </h4>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder="Giá từ"
                                    value={priceRange.min}
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            min: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 rounded-lg py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá đến"
                                    value={priceRange.max}
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            max: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 rounded-lg py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Stock Filter */}
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) =>
                                        setInStockOnly(e.target.checked)
                                    }
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Chỉ hiển thị sản phẩm còn hàng
                                </span>
                            </label>
                        </div>

                        {/* Sort Options */}
                        {/* <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                                Sắp xếp theo
                            </h4>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                            >
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortDirection}
                                onChange={(e) =>
                                    setSortDirection(
                                        e.target.value as "ASC" | "DESC"
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="ASC">Tăng dần</option>
                                <option value="DESC">Giảm dần</option>
                            </select>
                        </div> */}
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
                                Tìm thấy {totalElements} sản phẩm
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => {
                                    // Get the main image - always use the first available image across all stocks
                                    // Sort stocks by ID to ensure consistent ordering
                                    const sortedStocks = [
                                        ...product.stocks,
                                    ].sort((a, b) => a.id - b.id);
                                    let mainImageUrl =
                                        "https://via.placeholder.com/400x400?text=No+Image";

                                    // Find first image from all stocks (sorted by stock ID, then by photo ID)
                                    for (const stock of sortedStocks) {
                                        if (
                                            stock.productPhotos &&
                                            stock.productPhotos.length > 0
                                        ) {
                                            const sortedPhotos = [
                                                ...stock.productPhotos,
                                            ].sort((a, b) => a.id - b.id);
                                            mainImageUrl =
                                                sortedPhotos[0].imageUrl;
                                            break;
                                        }
                                    }

                                    // Get the lowest price from all stocks
                                    const lowestPrice = Math.min(
                                        ...product.stocks.map(
                                            (stock) => stock.price
                                        )
                                    );
                                    const hasMultiplePrices =
                                        product.stocks.some(
                                            (stock) =>
                                                stock.price !== lowestPrice
                                        );

                                    // Check if product has stock
                                    const totalQuantity = product.stocks.reduce(
                                        (sum, stock) => sum + stock.quantity,
                                        0
                                    );

                                    return (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.categoryId}/${product.id}`}
                                            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={mainImageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {totalQuantity === 0 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="text-white font-medium">
                                                            Hết hàng
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {hasMultiplePrices
                                                                ? `Từ `
                                                                : ""}
                                                            {formatCurrency(
                                                                lowestPrice
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mb-1">
                                                            {
                                                                product.stocks
                                                                    .length
                                                            }{" "}
                                                            biến thể
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Còn: {totalQuantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-8 space-x-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.max(0, currentPage - 1)
                                            )
                                        }
                                        disabled={currentPage === 0}
                                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-600">
                                        Trang {currentPage + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.min(
                                                    totalPages - 1,
                                                    currentPage + 1
                                                )
                                            )
                                        }
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Tiếp
                                    </button>
                                </div>
                            )}
                        </>
                    ) : searchTerm ||
                      selectedCategories.length > 0 ||
                      selectedColors.length > 0 ||
                      priceRange.min ||
                      priceRange.max ||
                      inStockOnly ? (
                        <div className="text-center py-12">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm
                                    ? "Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc"
                                    : "Thử điều chỉnh bộ lọc để tìm sản phẩm phù hợp"}
                            </p>
                            <button
                                onClick={clearFilters}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : !isLoading &&
                      products.length === 0 &&
                      !searchTerm &&
                      selectedCategories.length === 0 &&
                      selectedColors.length === 0 &&
                      !priceRange.min &&
                      !priceRange.max &&
                      !inStockOnly ? (
                        <div className="text-center py-12">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nhập từ khóa để tìm kiếm
                            </h3>
                            <p className="text-gray-600">
                                Tìm kiếm iPhone, Mac, iPad và nhiều sản phẩm
                                Apple khác
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
