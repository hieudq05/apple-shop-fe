import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    X,
    Calendar,
    DollarSign,
    Package,
    Tag,
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

// Simple accordion implementation
const Accordion: React.FC<{
    children: React.ReactNode;
    type: string;
    className?: string;
}> = ({ children }) => <div className="space-y-2">{children}</div>;

const AccordionItem: React.FC<{ children: React.ReactNode; value: string }> = ({
    children,
}) => <div className="border rounded-lg">{children}</div>;

const AccordionTrigger: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
}> = ({ children, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 rounded-t-lg"
    >
        {children}
    </button>
);

const AccordionContent: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => (
    <div className={`px-4 pb-4 ${className}`}>{children}</div>
);

interface AdvancedProductSearchProps {
    onSearch: (params: ProductSearchParams) => void;
    onReset: () => void;
    loading?: boolean;
}

const AdvancedProductSearch: React.FC<AdvancedProductSearchProps> = ({
    onSearch,
    onReset,
    loading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams, setSearchParams] = useState<ProductSearchParams>({
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
    });

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
        if (searchParams.isDeleted !== undefined) filters.push("Trạng thái");

        setActiveFilters(filters);
    }, [searchParams]);

    const handleInputChange = (
        field: keyof ProductSearchParams,
        value: string | number | boolean | undefined
    ) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: value,
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
                        placeholder="Tìm kiếm sản phẩm..."
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
                            Lọc nâng cao
                            {activeFilters.length > 0 && (
                                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                                    {activeFilters.length}
                                </Badge>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tìm kiếm nâng cao</DialogTitle>
                            <DialogDescription>
                                Sử dụng các bộ lọc chi tiết để tìm kiếm sản phẩm
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Active Filters */}
                            {activeFilters.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Bộ lọc đang áp dụng:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {activeFilters.map((filter) => (
                                            <Badge
                                                key={filter}
                                                variant="secondary"
                                            >
                                                {filter}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Accordion type="multiple" className="w-full">
                                {/* Basic Search */}
                                <AccordionItem value="basic">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4" />
                                            Tìm kiếm cơ bản
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="searchKeyword">
                                                Từ khóa
                                            </Label>
                                            <Input
                                                id="searchKeyword"
                                                placeholder="Tìm kiếm trong tên, mô tả..."
                                                value={
                                                    searchParams.searchKeyword ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "searchKeyword",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">
                                                    Tên sản phẩm
                                                </Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Tìm theo tên..."
                                                    value={
                                                        searchParams.name || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">
                                                    Mô tả
                                                </Label>
                                                <Input
                                                    id="description"
                                                    placeholder="Tìm theo mô tả..."
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
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Price Range */}
                                <AccordionItem value="price">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Khoảng giá
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="minPrice">
                                                    Giá từ (VND)
                                                </Label>
                                                <Input
                                                    id="minPrice"
                                                    type="number"
                                                    placeholder="0"
                                                    value={
                                                        searchParams.minPrice ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "minPrice",
                                                            Number(
                                                                e.target.value
                                                            ) || undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="maxPrice">
                                                    Giá đến (VND)
                                                </Label>
                                                <Input
                                                    id="maxPrice"
                                                    type="number"
                                                    placeholder="999999999"
                                                    value={
                                                        searchParams.maxPrice ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "maxPrice",
                                                            Number(
                                                                e.target.value
                                                            ) || undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Quantity Range */}
                                <AccordionItem value="quantity">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Số lượng tồn kho
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="minQuantity">
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
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="maxQuantity">
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
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Date Range */}
                                <AccordionItem value="date">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Khoảng thời gian
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="createdAfter">
                                                        Tạo sau ngày
                                                    </Label>
                                                    <Input
                                                        id="createdAfter"
                                                        type="datetime-local"
                                                        value={
                                                            searchParams.createdAfter ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "createdAfter",
                                                                e.target
                                                                    .value ||
                                                                    undefined
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="createdBefore">
                                                        Tạo trước ngày
                                                    </Label>
                                                    <Input
                                                        id="createdBefore"
                                                        type="datetime-local"
                                                        value={
                                                            searchParams.createdBefore ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "createdBefore",
                                                                e.target
                                                                    .value ||
                                                                    undefined
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="updatedAfter">
                                                        Cập nhật sau ngày
                                                    </Label>
                                                    <Input
                                                        id="updatedAfter"
                                                        type="datetime-local"
                                                        value={
                                                            searchParams.updatedAfter ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "updatedAfter",
                                                                e.target
                                                                    .value ||
                                                                    undefined
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="updatedBefore">
                                                        Cập nhật trước ngày
                                                    </Label>
                                                    <Input
                                                        id="updatedBefore"
                                                        type="datetime-local"
                                                        value={
                                                            searchParams.updatedBefore ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "updatedBefore",
                                                                e.target
                                                                    .value ||
                                                                    undefined
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Status & Settings */}
                                <AccordionItem value="status">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Trạng thái & Cài đặt
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="inStock">
                                                    Chỉ sản phẩm còn hàng
                                                </Label>
                                                <Switch
                                                    id="inStock"
                                                    checked={
                                                        searchParams.inStock ||
                                                        false
                                                    }
                                                    onCheckedChange={(
                                                        checked: boolean
                                                    ) =>
                                                        handleInputChange(
                                                            "inStock",
                                                            checked
                                                                ? true
                                                                : undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="hasReviews">
                                                    Có đánh giá
                                                </Label>
                                                <Switch
                                                    id="hasReviews"
                                                    checked={
                                                        searchParams.hasReviews ||
                                                        false
                                                    }
                                                    onCheckedChange={(
                                                        checked: boolean
                                                    ) =>
                                                        handleInputChange(
                                                            "hasReviews",
                                                            checked
                                                                ? true
                                                                : undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="isDeleted">
                                                    Bao gồm sản phẩm đã xóa
                                                </Label>
                                                <Switch
                                                    id="isDeleted"
                                                    checked={
                                                        searchParams.isDeleted ||
                                                        false
                                                    }
                                                    onCheckedChange={(
                                                        checked: boolean
                                                    ) =>
                                                        handleInputChange(
                                                            "isDeleted",
                                                            checked
                                                                ? true
                                                                : undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Rating Range */}
                                <AccordionItem value="rating">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Xếp hạng đánh giá
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="minRating">
                                                    Xếp hạng từ
                                                </Label>
                                                <Input
                                                    id="minRating"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    step="0.1"
                                                    placeholder="0"
                                                    value={
                                                        searchParams.minRating ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "minRating",
                                                            Number(
                                                                e.target.value
                                                            ) || undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="maxRating">
                                                    Xếp hạng đến
                                                </Label>
                                                <Input
                                                    id="maxRating"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    step="0.1"
                                                    placeholder="5"
                                                    value={
                                                        searchParams.maxRating ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "maxRating",
                                                            Number(
                                                                e.target.value
                                                            ) || undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={handleReset}>
                                <X className="h-4 w-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                            <Button onClick={handleSearch} disabled={loading}>
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Filters Display */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">
                        Bộ lọc:
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
                        className="h-6 px-2 text-xs"
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
