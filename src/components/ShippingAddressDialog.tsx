import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import userService, { type MyShippingAddress } from "@/services/userService";
import EditAddressDialog from "./EditAddressDialog";
import CreateAddressDialog from "./CreateAddressDialog";

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

interface ShippingAddressDialogProps {
    children: React.ReactNode;
}

const ShippingAddressDialog: React.FC<ShippingAddressDialogProps> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [addresses, setAddresses] = useState<MyShippingAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Edit address dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] =
        useState<MyShippingAddress | null>(null);

    // Delete confirmation dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
        null
    );

    // Create address dialog state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Cache for API responses to avoid repeated calls
    const apiCache = React.useRef<{
        provinces?: Province[];
        districts: { [provinceId: string]: District[] };
        wards: { [districtId: string]: Ward[] };
    }>({
        districts: {},
        wards: {},
    });

    // Fetch provinces, districts, and wards from API
    const fetchProvinces = async (): Promise<Province[]> => {
        if (apiCache.current.provinces) {
            return apiCache.current.provinces;
        }

        try {
            const response = await fetch(
                "https://provinces.open-api.vn/api/?depth=1"
            );
            const data: ApiProvince[] = await response.json();

            // Transform data to match our interface
            const provinces = data.map((province: ApiProvince) => ({
                id: province.code.toString(),
                name: province.name,
            }));

            apiCache.current.provinces = provinces;
            return provinces;
        } catch (error) {
            console.error("Error fetching provinces:", error);
            return [];
        }
    };

    const fetchDistricts = async (provinceId: string): Promise<District[]> => {
        if (apiCache.current.districts[provinceId]) {
            return apiCache.current.districts[provinceId];
        }

        try {
            const response = await fetch(
                `https://provinces.open-api.vn/api/p/${provinceId}?depth=2`
            );
            const data: ApiProvinceWithDistricts = await response.json();

            // Transform data to match our interface
            const districts = data.districts.map((district: ApiDistrict) => ({
                id: district.code.toString(),
                name: district.name,
                provinceId: provinceId,
            }));

            apiCache.current.districts[provinceId] = districts;
            return districts;
        } catch (error) {
            console.error("Error fetching districts:", error);
            return [];
        }
    };

    const fetchWards = async (districtId: string): Promise<Ward[]> => {
        if (apiCache.current.wards[districtId]) {
            return apiCache.current.wards[districtId];
        }

        try {
            const response = await fetch(
                `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
            );
            const data: ApiDistrictWithWards = await response.json();

            // Transform data to match our interface
            const wards = data.wards.map((ward: ApiWard) => ({
                id: ward.code.toString(),
                name: ward.name,
                districtId: districtId,
            }));

            apiCache.current.wards[districtId] = wards;
            return wards;
        } catch (error) {
            console.error("Error fetching wards:", error);
            return [];
        }
    };

    const fetchShippingAddresses = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await userService.getMyShippingAddress();

            if (response.success) {
                setAddresses(response.data);
            } else {
                setErrorMessage(
                    response.message || "Không thể tải địa chỉ giao hàng"
                );
            }
        } catch (error) {
            console.error("Error fetching shipping addresses:", error);
            setErrorMessage("Có lỗi xảy ra khi tải địa chỉ giao hàng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchShippingAddresses();
        }
    };

    const formatAddress = async (
        address: MyShippingAddress
    ): Promise<string> => {
        try {
            const parts = [];

            // Add specific address first
            if (address.address) parts.push(address.address);

            // Get ward name from API
            if (address.ward && address.district) {
                const wardData = await fetchWards(address.district);

                // Try both exact match and string conversion
                const ward = wardData.find(
                    (w) =>
                        w.id === address.ward ||
                        w.id === address.ward.toString()
                );
                if (ward) {
                    parts.push(`${ward.name}`);
                } else {
                    parts.push(`Phường/Xã ${address.ward}`);
                }
            }

            // Get district name from API
            if (address.district && address.province) {
                const districtData = await fetchDistricts(address.province);

                // Try both exact match and string conversion
                const district = districtData.find(
                    (d) =>
                        d.id === address.district ||
                        d.id === address.district.toString()
                );
                if (district) {
                    parts.push(`${district.name}`);
                } else {
                    parts.push(`Quận/Huyện ${address.district}`);
                }
            }

            // Get province name from API
            if (address.province) {
                const provinceData = await fetchProvinces();

                // Try both exact match and string conversion
                const province = provinceData.find(
                    (p) =>
                        p.id === address.province ||
                        p.id === address.province.toString()
                );
                if (province) {
                    parts.push(`${province.name}`);
                } else {
                    parts.push(`Tỉnh/TP ${address.province}`);
                }
            }

            const formattedAddress =
                parts.length > 0
                    ? parts.join(", ")
                    : "Không có thông tin địa chỉ";

            return formattedAddress;
        } catch (error) {
            console.error("Error formatting address:", error);
            // Fallback to original format with IDs
            const parts = [];
            if (address.address) parts.push(address.address);
            if (address.ward) parts.push(`Phường/Xã ${address.ward}`);
            if (address.district) parts.push(`Quận/Huyện ${address.district}`);
            if (address.province) parts.push(`Tỉnh/TP ${address.province}`);

            return parts.length > 0
                ? parts.join(", ")
                : "Không có thông tin địa chỉ";
        }
    };

    // Component to display formatted address
    const AddressDisplay: React.FC<{ address: MyShippingAddress }> = ({
        address,
    }) => {
        const [formattedAddress, setFormattedAddress] = useState<string>(
            "Đang tải địa chỉ..."
        );

        React.useEffect(() => {
            const loadAddress = async () => {
                const formatted = await formatAddress(address);
                setFormattedAddress(formatted);
            };
            loadAddress();
        }, [address]);

        return (
            <span className="text-sm leading-relaxed">{formattedAddress}</span>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Không có thông tin";
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Không có thông tin";
        }
    };

    // Handlers for address actions
    const handleEditAddress = (address: MyShippingAddress) => {
        setEditingAddress(address);
        setIsEditDialogOpen(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
        setDeletingAddressId(addressId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteAddress = async () => {
        if (!deletingAddressId) return;

        try {
            const response = await userService.deleteShippingAddress(
                deletingAddressId
            );

            if (response.success) {
                // Refresh addresses after deletion
                await fetchShippingAddresses();
                setIsDeleteDialogOpen(false);
                setDeletingAddressId(null);
            } else {
                setErrorMessage(response.message || "Không thể xóa địa chỉ");
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi xóa địa chỉ";
            console.error("Error deleting address:", error);
            setErrorMessage(errorMessage);
        }
    };

    const cancelDeleteAddress = () => {
        setIsDeleteDialogOpen(false);
        setDeletingAddressId(null);
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            const response = await userService.setDefaultShippingAddress(
                addressId
            );

            if (response.success) {
                // Refresh addresses after setting default
                await fetchShippingAddresses();
            } else {
                setErrorMessage(
                    response.message || "Không thể đặt địa chỉ mặc định"
                );
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi đặt địa chỉ mặc định";
            console.error("Error setting default address:", error);
            setErrorMessage(errorMessage);
        }
    };

    const handleSaveAddress = async (
        addressData: Partial<MyShippingAddress>
    ) => {
        try {
            if (editingAddress?.id) {
                // Update existing address
                const response = await userService.updateShippingAddress(
                    editingAddress.id,
                    addressData
                );

                if (!response.success) {
                    throw new Error(
                        response.message || "Không thể cập nhật địa chỉ"
                    );
                }
            }

            // Refresh addresses after saving
            await fetchShippingAddresses();
        } catch (error) {
            console.error("Error saving address:", error);
            throw error;
        }
    };

    const handleCreateAddress = async (
        addressData: import("@/services/userService").CreateShippingAddressData
    ) => {
        try {
            const response = await userService.createShippingAddress(
                addressData
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Không thể tạo địa chỉ mới"
                );
            }

            // Refresh addresses after creating
            await fetchShippingAddresses();
        } catch (error) {
            console.error("Error creating address:", error);
            throw error;
        }
    };

    const handleOpenCreateDialog = () => {
        setIsCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        setIsCreateDialogOpen(false);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditingAddress(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Quản lý địa chỉ giao hàng</span>
                        {addresses.length > 0 && (
                            <Badge variant="secondary" className="text-sm">
                                {addresses.length} địa chỉ
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Danh sách tất cả địa chỉ giao hàng của bạn. Bạn có thể
                        chỉnh sửa hoặc xóa địa chỉ.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 mt-4">
                            Đang tải địa chỉ giao hàng...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📍</div>
                                <p className="text-gray-500 text-lg mb-2">
                                    Bạn chưa có địa chỉ giao hàng nào
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Thêm địa chỉ giao hàng để đặt hàng dễ dàng
                                    hơn
                                </p>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {address.firstName}{" "}
                                                    {address.lastName}
                                                </h3>
                                                {address.isDefault && (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-100 text-green-800"
                                                    >
                                                        Mặc định
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-blue-500 text-sm">
                                                        📧
                                                    </span>
                                                    <span className="text-sm">
                                                        {address.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-green-500 text-sm">
                                                        📱
                                                    </span>
                                                    <span className="text-sm">
                                                        {address.phone}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-red-500 text-sm mt-0.5">
                                                        📍
                                                    </span>
                                                    <AddressDisplay
                                                        address={address}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                                    <div>
                                                        <span className="font-medium">
                                                            Tạo:
                                                        </span>
                                                        <br />
                                                        {formatDate(
                                                            address.createdAt
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Cập nhật:
                                                        </span>
                                                        <br />
                                                        {formatDate(
                                                            address.updatedAt
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center ml-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Mở menu
                                                        </span>
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEditAddress(
                                                                address
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            className="mr-2 h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    {!address.isDefault && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleSetDefaultAddress(
                                                                    address.id
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="mr-2 h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                            Đặt mặc định
                                                        </DropdownMenuItem>
                                                    )}
                                                    {!address.isDefault && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteAddress(
                                                                    address.id
                                                                )
                                                            }
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-500 focus:text-red-600"
                                                        >
                                                            <svg
                                                                className="mr-2 h-4 w-4 text-red-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="flex justify-center pt-4 border-t border-gray-100">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleOpenCreateDialog}
                            >
                                + Thêm địa chỉ mới
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>

            {/* Edit Address Dialog */}
            <EditAddressDialog
                isOpen={isEditDialogOpen}
                onClose={handleCloseEditDialog}
                address={editingAddress}
                onSave={handleSaveAddress}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa địa chỉ
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa địa chỉ này không? Hành
                            động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDeleteAddress}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteAddress}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Address Dialog */}
            <CreateAddressDialog
                isOpen={isCreateDialogOpen}
                onClose={handleCloseCreateDialog}
                onSave={handleCreateAddress}
            />
        </Dialog>
    );
};

export default ShippingAddressDialog;
