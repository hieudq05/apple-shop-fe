import React, { useState, useEffect } from "react";
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
import { type MyShippingAddress } from "@/services/userService";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";

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

interface EditAddressDialogProps {
    isOpen: boolean;
    onClose: () => void;
    address: MyShippingAddress | null;
    onSave: (addressData: Partial<MyShippingAddress>) => Promise<void>;
}

const EditAddressDialog: React.FC<EditAddressDialogProps> = ({
    isOpen,
    onClose,
    address,
    onSave,
}) => {
    const [formData, setFormData] = useState({
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
    const [errorMessage, setErrorMessage] = useState<string>("");

    // API calls
    const fetchProvinces = async (): Promise<Province[]> => {
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
    };

    const fetchDistricts = async (provinceId: string): Promise<District[]> => {
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
    };

    const fetchWards = async (districtId: string): Promise<Ward[]> => {
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
    };

    // Load initial data
    useEffect(() => {
        if (isOpen) {
            loadProvinces();
        }
    }, [isOpen]);

    // Load address data when address changes
    useEffect(() => {
        if (address) {
            setFormData({
                firstName: address.firstName,
                lastName: address.lastName,
                email: address.email,
                phone: address.phone,
                address: address.address,
                province: address.province,
                district: address.district,
                ward: address.ward,
                isDefault: address.isDefault || false,
            });

            // Load districts and wards if province/district are set
            if (address.province) {
                loadDistricts(address.province);
            }
            if (address.district) {
                loadWards(address.district);
            }
        }
    }, [address]);

    const loadProvinces = async () => {
        const provinceData = await fetchProvinces();
        setProvinces(provinceData);
    };

    const loadDistricts = async (provinceId: string) => {
        const districtData = await fetchDistricts(provinceId);
        setDistricts(districtData);
    };

    const loadWards = async (districtId: string) => {
        const wardData = await fetchWards(districtId);
        setWards(wardData);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = (provinceId: string) => {
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

    const handleDistrictChange = (districtId: string) => {
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
        } catch (error: any) {
            console.error("Error updating address:", error);
            setErrorMessage(
                error.message || "Có lỗi xảy ra khi cập nhật địa chỉ"
            );
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
                    <DialogTitle>Chỉnh sửa địa chỉ giao hàng</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin địa chỉ giao hàng của bạn.
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
                                <Label htmlFor="firstName">Họ</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Tên</Label>
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
                            <Select
                                value={formData.province}
                                onValueChange={(value) => {
                                    handleProvinceChange(value);
                                }}
                                name="province"
                                required
                            >
                                <SelectTrigger className={"w-full"}>
                                    <SelectValue placeholder={"Chọn Tỉnh/Thành phố"}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tỉnh/Thành phố</SelectLabel>
                                        {provinces.map((province) => (
                                            <SelectItem value={province.id}>{province.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="district">Quận/Huyện</Label>
                            <Select
                                value={formData.district}
                                disabled={provinces.length === 0 || !formData.province}
                                onValueChange={(value) => {
                                    handleDistrictChange(value);
                                }}
                                name="district"
                                required
                            >
                                <SelectTrigger className={"w-full"}>
                                    <SelectValue placeholder={"Chọn Quận/Huyện"}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Quận/Huyện</SelectLabel>
                                        {districts.map((district) => (
                                            <SelectItem value={district.id}>{district.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ward">Phường/Xã</Label>
                            <Select
                                value={formData.ward}
                                onValueChange={(value) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        ward: value,
                                    }));
                                }}
                                disabled={districts.length === 0 || !formData.district}
                                name="ward"
                                required
                            >
                                <SelectTrigger className={"w-full"}>
                                    <SelectValue placeholder={"Chọn Phường/Xã"}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Phường/Xã</SelectLabel>
                                        {wards.map((ward) => (
                                            <SelectItem value={ward.id}>{ward.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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
                            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditAddressDialog;
