import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    X,
    DollarSign,
    Package,
    ChevronDown,
    ChevronUp,
    Sliders,
    Star,
    Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import type { ProductSearchParams } from "@/services/adminProductService";

// Simple Switch component
const Switch: React.FC<{
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
}> = ({ checked = false, onCheckedChange, id }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            checked ? "bg-primary" : "bg-input"
        }`}
        onClick={() => onCheckedChange?.(!checked)}
    >
        <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                checked ? "translate-x-5" : "translate-x-0"
            }`}
        />
    </button>
);

// Price formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

// Quick price filters
const QUICK_PRICE_FILTERS = [
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10 - 20 triệu", min: 10000000, max: 20000000 },
    { label: "20 - 30 triệu", min: 20000000, max: 30000000 },
    { label: "30 - 50 triệu", min: 30000000, max: 50000000 },
    { label: "Trên 50 triệu", min: 50000000, max: 100000000 },
];

interface AdvancedProductSearchProps {
    onSearch: (params: ProductSearchParams) => void;
    onReset: () => void;
    loading?: boolean;
    setSearchParams: (params: ProductSearchParams) => void;
}

const AdvancedProductSearch: React.FC<AdvancedProductSearchProps> = ({
    onSearch,
    onReset,
    loading = false,
    setSearchParams: setSearchParams1,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams, setSearchParams] = useState<ProductSearchParams>({
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
        searchKeyword: "",
    });

    // Collapsible states
    const [basicOpen, setBasicOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(false);
    const [quantityOpen, setQuantityOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    // Price range state for slider
    const [priceRange, setPriceRange] = useState([0, 100000000]);

    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Update active filters when search params change
    useEffect(() => {
        const filters: string[] = [];
        if (searchParams.searchKeyword) filters.push("Từ khóa");
        if (searchParams.categoryId?.length) filters.push("Danh mục");
        if (searchParams.minPrice || searchParams.maxPrice) filters.push("Giá");
        if (searchParams.minQuantity || searchParams.maxQuantity)
            filters.push("Số lượng");
        if (searchParams.colorIds?.length) filters.push("Màu sắc");
        if (searchParams.featureIds?.length) filters.push("Tính năng");
        if (searchParams.inStock !== undefined) filters.push("Tồn kho");
        if (searchParams.hasReviews !== undefined) filters.push("Đánh giá");
        if (searchParams.minRating || searchParams.maxRating)
            filters.push("Xếp hạng");
        if (searchParams.createdAfter || searchParams.createdBefore)
            filters.push("Ngày tạo");
        if (searchParams.isDeleted !== undefined) filters.push("Thùng rác");

        setActiveFilters(filters);
        setSearchParams1(searchParams);
    }, [searchParams, setSearchParams1]);

    const handleInputChange = (
        field: keyof ProductSearchParams,
        value: string | number | boolean | undefined
    ) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePriceRangeChange = (values: number[]) => {
        setPriceRange(values);
        setSearchParams((prev) => ({
            ...prev,
            minPrice: values[0] || undefined,
            maxPrice: values[1] || undefined,
        }));
    };

    const handleQuickPriceFilter = (min: number, max: number) => {
        setPriceRange([min, max]);
        setSearchParams((prev) => ({
            ...prev,
            minPrice: min,
            maxPrice: max,
        }));
    };

    const handleSearch = () => {
        onSearch(searchParams);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetParams: ProductSearchParams = {
            page: 0,
            size: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
        };
        setSearchParams(resetParams);
        setPriceRange([0, 100000000]);
        onReset();
        setIsOpen(false);
    };

    const quickSearch = (keyword: string) => {
        const params = {
            ...searchParams,
            searchKeyword: keyword,
        };
        setSearchParams(params);
        onSearch(params);
    };

    return (
        <div className="space-y-4">
            {/* Quick Search */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm (tên, mô tả, features...)..."
                        value={searchParams.searchKeyword || ""}
                        onChange={(e) =>
                            handleInputChange("searchKeyword", e.target.value)
                        }
                        className="pl-10"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                quickSearch(e.currentTarget.value);
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={() =>
                        quickSearch(searchParams.searchKeyword || "")
                    }
                    disabled={loading}
                    className="shrink-0"
                >
                    <Search className="h-4 w-4" />
                </Button>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="relative">
                            <Filter className="h-4 w-4 mr-2" />
                            Bộ lọc nâng cao
                            {activeFilters.length > 0 && (
                                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                                    {activeFilters.length}
                                </Badge>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sliders className="h-5 w-5" />
                                Tìm kiếm và lọc sản phẩm nâng cao
                            </DialogTitle>
                            <DialogDescription>
                                Sử dụng các bộ lọc chi tiết để tìm kiếm sản phẩm
                                chính xác
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto space-y-6">
                            {/* Active Filters Preview */}
                            {activeFilters.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Bộ lọc đang áp dụng (
                                        {activeFilters.length}):
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {activeFilters.map((filter) => (
                                            <Badge
                                                key={filter}
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                            >
                                                {filter}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Basic Search Section */}
                            <Collapsible
                                open={basicOpen}
                                onOpenChange={setBasicOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between p-0 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium">
                                                Tìm kiếm cơ bản
                                            </span>
                                        </div>
                                        {basicOpen ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-medium"
                                            >
                                                Tên sản phẩm
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="iPhone, MacBook, iPad..."
                                                value={searchParams.name || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="description"
                                                className="text-sm font-medium"
                                            >
                                                Mô tả sản phẩm
                                            </Label>
                                            <Input
                                                id="description"
                                                placeholder="Tìm trong mô tả..."
                                                value={
                                                    searchParams.description ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <Separator />

                            {/* Price Range Section */}
                            <Collapsible
                                open={priceOpen}
                                onOpenChange={setPriceOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between p-0 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="font-medium">
                                                Khoảng giá
                                            </span>
                                            {(searchParams.minPrice ||
                                                searchParams.maxPrice) && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2"
                                                >
                                                    {formatCurrency(
                                                        priceRange[0]
                                                    )}{" "}
                                                    -{" "}
                                                    {formatCurrency(
                                                        priceRange[1]
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        {priceOpen ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 space-y-4">
                                    {/* Quick Price Filters */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">
                                            Chọn nhanh mức giá:
                                        </Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {QUICK_PRICE_FILTERS.map(
                                                (filter) => (
                                                    <Button
                                                        key={filter.label}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleQuickPriceFilter(
                                                                filter.min,
                                                                filter.max
                                                            )
                                                        }
                                                        className={`text-xs h-8 ${
                                                            priceRange[0] ===
                                                                filter.min &&
                                                            priceRange[1] ===
                                                                filter.max
                                                                ? "bg-primary text-primary-foreground"
                                                                : ""
                                                        }`}
                                                    >
                                                        {filter.label}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Price Range Slider */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">
                                            Tùy chỉnh khoảng giá:{" "}
                                            {formatCurrency(priceRange[0])} -{" "}
                                            {formatCurrency(priceRange[1])}
                                        </Label>
                                        <Slider
                                            value={priceRange}
                                            onValueChange={
                                                handlePriceRangeChange
                                            }
                                            max={100000000}
                                            min={0}
                                            step={1000000}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>0₫</span>
                                            <span>100.000.000₫</span>
                                        </div>
                                    </div>

                                    {/* Manual Price Input */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="minPrice"
                                                className="text-sm"
                                            >
                                                Giá từ (VND)
                                            </Label>
                                            <Input
                                                id="minPrice"
                                                type="number"
                                                placeholder="0"
                                                value={priceRange[0] || ""}
                                                onChange={(e) => {
                                                    const value =
                                                        Number(
                                                            e.target.value
                                                        ) || 0;
                                                    handlePriceRangeChange([
                                                        value,
                                                        priceRange[1],
                                                    ]);
                                                }}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="maxPrice"
                                                className="text-sm"
                                            >
                                                Giá đến (VND)
                                            </Label>
                                            <Input
                                                id="maxPrice"
                                                type="number"
                                                placeholder="100000000"
                                                value={priceRange[1] || ""}
                                                onChange={(e) => {
                                                    const value =
                                                        Number(
                                                            e.target.value
                                                        ) || 100000000;
                                                    handlePriceRangeChange([
                                                        priceRange[0],
                                                        value,
                                                    ]);
                                                }}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <Separator />

                            {/* Quantity Section */}
                            <Collapsible
                                open={quantityOpen}
                                onOpenChange={setQuantityOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between p-0 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-orange-600" />
                                            <span className="font-medium">
                                                Số lượng tồn kho
                                            </span>
                                        </div>
                                        {quantityOpen ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="minQuantity"
                                                className="text-sm font-medium"
                                            >
                                                Số lượng từ
                                            </Label>
                                            <Input
                                                id="minQuantity"
                                                type="number"
                                                placeholder="0"
                                                value={
                                                    searchParams.minQuantity ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "minQuantity",
                                                        Number(
                                                            e.target.value
                                                        ) || undefined
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="maxQuantity"
                                                className="text-sm font-medium"
                                            >
                                                Số lượng đến
                                            </Label>
                                            <Input
                                                id="maxQuantity"
                                                type="number"
                                                placeholder="999999"
                                                value={
                                                    searchParams.maxQuantity ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "maxQuantity",
                                                        Number(
                                                            e.target.value
                                                        ) || undefined
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="inStock"
                                            checked={
                                                searchParams.inStock || false
                                            }
                                            onCheckedChange={(checked) =>
                                                handleInputChange(
                                                    "inStock",
                                                    checked || undefined
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="inStock"
                                            className="text-sm"
                                        >
                                            Chỉ hiển thị sản phẩm còn hàng
                                        </Label>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <Separator />

                            {/* Status & Options */}
                            <Collapsible
                                open={statusOpen}
                                onOpenChange={setStatusOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between p-0 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Archive className="h-4 w-4 text-purple-600" />
                                            <span className="font-medium">
                                                Trạng thái & Tùy chọn
                                            </span>
                                        </div>
                                        {statusOpen ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="hasReviews"
                                                checked={
                                                    searchParams.hasReviews ||
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleInputChange(
                                                        "hasReviews",
                                                        checked || undefined
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="hasReviews"
                                                className="text-sm"
                                            >
                                                Có đánh giá từ khách hàng
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="isDeleted"
                                                checked={
                                                    searchParams.isDeleted ||
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleInputChange(
                                                        "isDeleted",
                                                        checked || undefined
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="isDeleted"
                                                className="text-sm"
                                            >
                                                Hiển thị sản phẩm đã xóa
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Rating Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="minRating"
                                                className="text-sm font-medium flex items-center gap-1"
                                            >
                                                <Star className="h-3 w-3" />
                                                Đánh giá từ
                                            </Label>
                                            <Select
                                                value={
                                                    searchParams.minRating?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        "minRating",
                                                        value
                                                            ? Number(value)
                                                            : undefined
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Chọn sao tối thiểu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 sao
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 sao
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 sao
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 sao
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 sao
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="maxRating"
                                                className="text-sm font-medium flex items-center gap-1"
                                            >
                                                <Star className="h-3 w-3" />
                                                Đánh giá đến
                                            </Label>
                                            <Select
                                                value={
                                                    searchParams.maxRating?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        "maxRating",
                                                        value
                                                            ? Number(value)
                                                            : undefined
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Chọn sao tối đa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 sao
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 sao
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 sao
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 sao
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 sao
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Đặt lại tất cả
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <Search className="h-4 w-4" />
                                    {loading ? "Đang tìm..." : "Tìm kiếm"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">
                        Đang lọc:
                    </span>
                    {activeFilters.map((filter) => (
                        <Badge
                            key={filter}
                            variant="secondary"
                            className="text-xs"
                        >
                            {filter}
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="ml-auto text-xs h-6"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Xóa tất cả
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdvancedProductSearch;
