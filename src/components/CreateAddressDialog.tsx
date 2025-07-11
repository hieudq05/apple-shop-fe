import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { type CreateShippingAddressData } from "@/services/userService";

// API response interfaces for provinces.open-api.vn
interface ApiProvince {
    code: number;
    name: string;
}

interface ApiDistrict {
    code: number;
    name: string;
}

interface ApiWard {
    code: number;
    name: string;
}

interface ApiProvinceWithDistricts {
    code: number;
    name: string;
    districts: ApiDistrict[];
}

interface ApiDistrictWithWards {
    code: number;
    name: string;
    wards: ApiWard[];
}

interface Province {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
    provinceId: string;
}

interface Ward {
    id: string;
    name: string;
    districtId: string;
}

interface CreateAddressDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addressData: CreateShippingAddressData) => Promise<void>;
}

const CreateAddressDialog: React.FC<CreateAddressDialogProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<CreateShippingAddressData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        province: "",
        district: "",
        ward: "",
        isDefault: false,
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchProvinces = useCallback(async (): Promise<Province[]> => {
        try {
            const response = await fetch(
                "https://provinces.open-api.vn/api/?depth=1"
            );
            const data: ApiProvince[] = await response.json();

            return data.map((province: ApiProvince) => ({
                id: province.code.toString(),
                name: province.name,
            }));
        } catch (error) {
            console.error("Error fetching provinces:", error);
            return [];
        }
    }, []);

    const fetchDistricts = useCallback(
        async (provinceId: string): Promise<District[]> => {
            try {
                const response = await fetch(
                    `https://provinces.open-api.vn/api/p/${provinceId}?depth=2`
                );
                const data: ApiProvinceWithDistricts = await response.json();

                return data.districts.map((district: ApiDistrict) => ({
                    id: district.code.toString(),
                    name: district.name,
                    provinceId: provinceId,
                }));
            } catch (error) {
                console.error("Error fetching districts:", error);
                return [];
            }
        },
        []
    );

    const fetchWards = useCallback(
        async (districtId: string): Promise<Ward[]> => {
            try {
                const response = await fetch(
                    `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
                );
                const data: ApiDistrictWithWards = await response.json();

                return data.wards.map((ward: ApiWard) => ({
                    id: ward.code.toString(),
                    name: ward.name,
                    districtId: districtId,
                }));
            } catch (error) {
                console.error("Error fetching wards:", error);
                return [];
            }
        },
        []
    );

    const loadProvinces = useCallback(async () => {
        const provinceData = await fetchProvinces();
        setProvinces(provinceData);
    }, [fetchProvinces]);

    const loadDistricts = useCallback(
        async (provinceId: string) => {
            const districtData = await fetchDistricts(provinceId);
            setDistricts(districtData);
        },
        [fetchDistricts]
    );

    const loadWards = useCallback(
        async (districtId: string) => {
            const wardData = await fetchWards(districtId);
            setWards(wardData);
        },
        [fetchWards]
    );

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                province: "",
                district: "",
                ward: "",
                isDefault: false,
            });
            setDistricts([]);
            setWards([]);
            setErrorMessage("");
            loadProvinces();
        }
    }, [isOpen, loadProvinces]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            province: provinceId,
            district: "",
            ward: "",
        }));
        setDistricts([]);
        setWards([]);

        if (provinceId) {
            loadDistricts(provinceId);
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            district: districtId,
            ward: "",
        }));
        setWards([]);

        if (districtId) {
            loadWards(districtId);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi tạo địa chỉ";
            console.error("Error creating address:", error);
            setErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setErrorMessage("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Thêm địa chỉ giao hàng mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin địa chỉ giao hàng mới của bạn.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">Tên</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Họ</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="province">Tỉnh/Thành phố</Label>
                            <select
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleProvinceChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((province) => (
                                    <option
                                        key={province.id}
                                        value={province.id}
                                    >
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="district">Quận/Huyện</Label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleDistrictChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!formData.province}
                                required
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map((district) => (
                                    <option
                                        key={district.id}
                                        value={district.id}
                                    >
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ward">Phường/Xã</Label>
                            <select
                                id="ward"
                                name="ward"
                                value={formData.ward}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!formData.district}
                                required
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Địa chỉ cụ thể</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Số nhà, tên đường..."
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        isDefault: checked === true,
                                    }));
                                }}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="isDefault"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Đặt làm địa chỉ mặc định
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Địa chỉ này sẽ được sử dụng làm mặc định cho
                                    các đơn hàng
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang tạo..." : "Tạo địa chỉ"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAddressDialog;
