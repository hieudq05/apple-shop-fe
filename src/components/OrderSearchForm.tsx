import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { OrderSearchParams } from "../services/orderHistoryService";
import { ORDER_STATUS_MAP } from "../types/order";
import {
    addressService,
    type Province,
    type District,
    type Ward,
} from "../services/addressService";

export interface OrderSearchFormProps {
    onSearch: (params: OrderSearchParams) => void;
    onClear: () => void;
    isLoading?: boolean;
}

const OrderSearchForm: React.FC<OrderSearchFormProps> = ({
    onSearch,
    onClear,
    isLoading = false,
}) => {
    const [searchParams, setSearchParams] = useState<OrderSearchParams>({});
    const [isExpanded, setIsExpanded] = useState(false);

    // Address data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Load provinces on component mount
    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        try {
            setLoadingAddress(true);
            const provincesData = await addressService.getProvinces();
            setProvinces(provincesData);
        } catch (error) {
            console.error("Error loading provinces:", error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const loadDistricts = async (provinceCode: string) => {
        try {
            setLoadingAddress(true);
            const districtsData = await addressService.getDistrictsByProvince(
                provinceCode
            );
            setDistricts(districtsData);
            setWards([]); // Clear wards when province changes
        } catch (error) {
            console.error("Error loading districts:", error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const loadWards = async (districtCode: string) => {
        try {
            setLoadingAddress(true);
            const wardsData = await addressService.getWardsByDistrict(
                districtCode
            );
            setWards(wardsData);
        } catch (error) {
            console.error("Error loading wards:", error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleInputChange = (
        field: keyof OrderSearchParams,
        value: string
    ) => {
        // Handle address field changes with proper reset logic
        if (field === "province") {
            if (value && value !== "ALL") {
                loadDistricts(value);
                // Clear district and ward when province changes
                setSearchParams((prev) => ({
                    ...prev,
                    province: value,
                    district: undefined,
                    ward: undefined,
                }));
            } else {
                // Clear districts and wards when "All" is selected
                setDistricts([]);
                setWards([]);
                setSearchParams((prev) => ({
                    ...prev,
                    province: value === "ALL" ? undefined : value,
                    district: undefined,
                    ward: undefined,
                }));
            }
        } else if (field === "district") {
            if (value && value !== "ALL") {
                loadWards(value);
                // Clear ward when district changes
                setSearchParams((prev) => ({
                    ...prev,
                    district: value,
                    ward: undefined,
                }));
            } else {
                // Clear wards when "All" is selected
                setWards([]);
                setSearchParams((prev) => ({
                    ...prev,
                    district: value === "ALL" ? undefined : value,
                    ward: undefined,
                }));
            }
        } else {
            // Handle other fields
            setSearchParams((prev) => ({
                ...prev,
                [field]: value === "ALL" || !value ? undefined : value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchParams);
    };

    const handleClear = () => {
        setSearchParams({});
        setDistricts([]);
        setWards([]);
        onClear();
        setIsExpanded(false);
    };

    const hasActiveFilters = Object.values(searchParams).some(
        (value) => value && value !== "ALL"
    );

    return (
        <Card className="gap-3">
            <CardHeader>
                <CardTitle className="flex items-center justify-between p-0">
                    <span className="flex items-center gap-2">
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        Tìm kiếm đơn hàng
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "Thu gọn" : "Mở rộng"}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic search - always visible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="searchTerm">
                                Tìm kiếm tổng quát
                            </Label>
                            <Input
                                id="searchTerm"
                                placeholder="Tìm kiếm..."
                                value={searchParams.searchTerm || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "searchTerm",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={searchParams.status || "ALL"}
                                onValueChange={(value) =>
                                    handleInputChange("status", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        Tất cả trạng thái
                                    </SelectItem>
                                    {Object.entries(ORDER_STATUS_MAP).map(
                                        ([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="shippingTrackingCode">
                                Mã vận đơn
                            </Label>
                            <Input
                                id="shippingTrackingCode"
                                placeholder="Nhập mã vận đơn"
                                value={searchParams.shippingTrackingCode || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "shippingTrackingCode",
                                        e.target.value
                                    )
                                }
                            />
                        </div> */}
                    </div>

                    {/* Advanced search - expandable */}
                    {isExpanded && (
                        <div className="space-y-4 pt-4 border-t">
                            {/* Customer information */}
                            <div className="space-y-2">
                                <h4 className="text-md font-medium mb-3">
                                    Thông tin khách hàng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">
                                            Tên khách hàng
                                        </Label>
                                        <Input
                                            id="customerName"
                                            placeholder="Nhập tên khách hàng"
                                            value={
                                                searchParams.customerName || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "customerName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">
                                            Email
                                        </Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            placeholder="Nhập email"
                                            value={
                                                searchParams.customerEmail || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "customerEmail",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">
                                            Số điện thoại
                                        </Label>
                                        <Input
                                            id="customerPhone"
                                            placeholder="Nhập số điện thoại"
                                            value={
                                                searchParams.customerPhone || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "customerPhone",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping address */}
                            <div className="space-y-2">
                                <h4 className="text-md font-medium mb-3">
                                    Địa chỉ giao hàng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shippingAddress">
                                            Địa chỉ chi tiết
                                        </Label>
                                        <Input
                                            id="shippingAddress"
                                            placeholder="Nhập địa chỉ"
                                            value={
                                                searchParams.shippingAddress ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "shippingAddress",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province">
                                            Tỉnh/Thành phố
                                        </Label>
                                        <Select
                                            value={
                                                searchParams.province || "ALL"
                                            }
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "province",
                                                    value
                                                )
                                            }
                                            disabled={loadingAddress}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">
                                                    Tất cả tỉnh/thành phố
                                                </SelectItem>
                                                {provinces.map((province) => (
                                                    <SelectItem
                                                        key={province.code}
                                                        value={province.code}
                                                    >
                                                        {province.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district">
                                            Quận/Huyện
                                        </Label>
                                        <Select
                                            value={
                                                searchParams.district || "ALL"
                                            }
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "district",
                                                    value
                                                )
                                            }
                                            disabled={
                                                loadingAddress ||
                                                !searchParams.province ||
                                                searchParams.province === "ALL"
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn quận/huyện" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">
                                                    Tất cả quận/huyện
                                                </SelectItem>
                                                {districts.map((district) => (
                                                    <SelectItem
                                                        key={district.code}
                                                        value={district.code}
                                                    >
                                                        {district.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ward">Phường/Xã</Label>
                                        <Select
                                            value={searchParams.ward || "ALL"}
                                            onValueChange={(value) =>
                                                handleInputChange("ward", value)
                                            }
                                            disabled={
                                                loadingAddress ||
                                                !searchParams.district ||
                                                searchParams.district === "ALL"
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phường/xã" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">
                                                    Tất cả phường/xã
                                                </SelectItem>
                                                {wards.map((ward) => (
                                                    <SelectItem
                                                        key={ward.code}
                                                        value={ward.code}
                                                    >
                                                        {ward.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Date range */}
                            <div className="space-y-2">
                                <h4 className="text-md font-medium mb-3">
                                    Khoảng thời gian
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="createdAtFrom">
                                            Từ ngày
                                        </Label>
                                        <Input
                                            id="createdAtFrom"
                                            type="datetime-local"
                                            value={
                                                searchParams.createdAtFrom || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "createdAtFrom",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="createdAtTo">
                                            Đến ngày
                                        </Label>
                                        <Input
                                            id="createdAtTo"
                                            type="datetime-local"
                                            value={
                                                searchParams.createdAtTo || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "createdAtTo",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                            {isLoading ? "Đang tìm..." : "Tìm kiếm"}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                className="flex items-center gap-2"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default OrderSearchForm;
