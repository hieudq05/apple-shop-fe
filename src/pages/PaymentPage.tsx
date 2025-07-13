import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartApiService, type CartItem } from "../services/cartApiService";
import userService, { type MyShippingAddress } from "../services/userService";
import paymentService, {
    type CreatePaymentRequest,
} from "../services/paymentService";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import EditAddressDialog from "../components/EditAddressDialog";
import CreateAddressDialog from "../components/CreateAddressDialog";
import PromotionSelector from "../components/PromotionSelector";
import NotificationDialog from "../components/NotificationDialog";
import { Info } from "lucide-react";
import { type Promotion } from "../services/promotionService";

// API interfaces for provinces.open-api.vn
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

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    // Step 2 state
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("vnpay");

    // Shipping address management state
    const [shippingAddresses, setShippingAddresses] = useState<
        MyShippingAddress[]
    >([]);
    const [selectedShippingAddress, setSelectedShippingAddress] =
        useState<MyShippingAddress | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [addressError, setAddressError] = useState<string>("");

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

    // Promotion state
    const [selectedPromotion, setSelectedPromotion] =
        useState<Promotion | null>(null);

    // Payment processing state
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Notification dialog state
    const [notificationDialog, setNotificationDialog] = useState<{
        isOpen: boolean;
        type: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    // Helper function to show notification
    const showNotification = React.useCallback(
        (
            type: "success" | "error" | "warning" | "info",
            title: string,
            message: string
        ) => {
            setNotificationDialog({
                isOpen: true,
                type,
                title,
                message,
            });
        },
        []
    );

    // Helper function to close notification
    const closeNotification = React.useCallback(() => {
        setNotificationDialog((prev) => ({ ...prev, isOpen: false }));
    }, []);

    // Calculate promotion discount
    const calculatePromotionDiscount = (
        promotion: Promotion | null,
        cartTotal: number
    ): number => {
        if (!promotion) return 0;

        if (promotion.promotionType === "PERCENTAGE") {
            const discount = (cartTotal * promotion.value) / 100;
            return promotion.maxDiscountAmount
                ? Math.min(discount, promotion.maxDiscountAmount)
                : discount;
        } else if (promotion.promotionType === "FIXED_AMOUNT") {
            return Math.min(promotion.value, cartTotal);
        }
        return 0; // SHIPPING_DISCOUNT không áp dụng cho cart total
    };

    // Calculate shipping discount
    const calculateShippingDiscount = (
        promotion: Promotion | null,
        shippingFee: number
    ): number => {
        if (!promotion || promotion.promotionType !== "SHIPPING_DISCOUNT")
            return 0;

        if (promotion.value === 100) {
            // 100% discount
            return promotion.maxDiscountAmount
                ? Math.min(shippingFee, promotion.maxDiscountAmount)
                : shippingFee;
        }

        const discount = (shippingFee * promotion.value) / 100;
        return promotion.maxDiscountAmount
            ? Math.min(discount, promotion.maxDiscountAmount)
            : discount;
    };

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
            <span className="leading-relaxed text-base">
                {formattedAddress}
            </span>
        );
    };

    // Load cart data from API
    useEffect(() => {
        loadCartData();
        loadShippingAddresses();
        loadUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update contact info when shipping address is selected
    useEffect(() => {
        if (selectedShippingAddress) {
            setFullName(
                `${selectedShippingAddress.firstName} ${selectedShippingAddress.lastName}`
            );
            setEmail(selectedShippingAddress.email || "");
            setPhone(selectedShippingAddress.phone || "");
        }
    }, [selectedShippingAddress]);

    const loadUserInfo = async () => {
        // You can implement this later to load user's default info if needed
    };

    const loadCartData = async () => {
        try {
            setLoading(true);
            setError(null);
            const items = await cartApiService.getCart();
            setCartItems(items);
        } catch (err) {
            console.error("Error loading cart:", err);
            setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Load shipping addresses
    const loadShippingAddresses = React.useCallback(async () => {
        try {
            setIsLoadingAddresses(true);
            setAddressError("");
            const response = await userService.getMyShippingAddress();

            if (response.success) {
                setShippingAddresses(response.data);

                // Auto-select default address if available
                const defaultAddress = response.data.find(
                    (addr: MyShippingAddress) => addr.isDefault
                );
                if (defaultAddress) {
                    setSelectedShippingAddress(defaultAddress);
                }
            } else {
                const errorMsg =
                    response.message ||
                    "Không thể tải danh sách địa chỉ giao hàng";
                setAddressError(errorMsg);
                showNotification("error", "Lỗi tải địa chỉ", errorMsg);
            }
        } catch (err) {
            console.error("Error loading shipping addresses:", err);
            const errorMsg = "Không thể tải danh sách địa chỉ giao hàng";
            setAddressError(errorMsg);
            showNotification("error", "Lỗi hệ thống", errorMsg);
        } finally {
            setIsLoadingAddresses(false);
        }
    }, [showNotification]);

    const handlePaymentMethodChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPaymentMethod(e.target.value);
    };

    const openAddressDialog = () => {
        setIsAddressDialogOpen(true);
    };

    const handleNextStep = () => {
        // Validate step 1 data
        if (!selectedShippingAddress) {
            showNotification(
                "warning",
                "Thiếu thông tin giao hàng",
                "Vui lòng chọn địa chỉ giao hàng trước khi tiếp tục đến bước thanh toán."
            );
            return;
        }

        setCurrentStep(2);
    };

    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedShippingAddress) {
            showNotification(
                "warning",
                "Thiếu thông tin giao hàng",
                "Vui lòng chọn địa chỉ giao hàng trước khi tiếp tục."
            );
            return;
        }

        // Validate step 2 data
        if (!fullName || !email || !phone) {
            showNotification(
                "warning",
                "Thông tin liên hệ chưa đầy đủ",
                "Vui lòng kiểm tra lại địa chỉ giao hàng đã chọn để đảm bảo có đầy đủ thông tin liên hệ (tên, email, số điện thoại)."
            );
            return;
        }

        // Calculate cart totals
        const subtotal = cartItems.reduce(
            (total, item) => total + item.total,
            0
        );
        const cartCount = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );
        const shippingFee = 40000; // 40,000 VND shipping fee

        // Calculate promotion discount
        const promotionDiscount = calculatePromotionDiscount(
            selectedPromotion,
            subtotal
        );
        const shippingDiscount = calculateShippingDiscount(
            selectedPromotion,
            shippingFee
        );

        const vat = (subtotal - promotionDiscount) * 0.1; // 10% VAT after discount
        const totalAmount =
            subtotal + shippingFee + vat - promotionDiscount - shippingDiscount;

        // Create order data
        const orderData = {
            shippingAddress: {
                fullName,
                phone,
                address: selectedShippingAddress.address,
                ward: selectedShippingAddress.ward,
                district: selectedShippingAddress.district,
                province: selectedShippingAddress.province,
            },
            contactInfo: {
                fullName,
                email,
                phone,
            },
            paymentMethod,
            products: cartItems,
            cartCount,
            subtotal,
            shippingFee,
            vat,
            promotionDiscount,
            shippingDiscount,
            promotion: selectedPromotion
                ? {
                      id: selectedPromotion.id,
                      code: selectedPromotion.code,
                      name: selectedPromotion.name,
                      type: selectedPromotion.promotionType,
                      discountAmount: promotionDiscount + shippingDiscount,
                  }
                : null,
            totalAmount,
        };

        console.log("Order data:", orderData);

        try {
            setIsProcessingPayment(true);

            // Prepare payment request data
            const paymentData: CreatePaymentRequest = {
                firstName: selectedShippingAddress.firstName,
                lastName: selectedShippingAddress.lastName,
                email: selectedShippingAddress.email || email,
                phone: selectedShippingAddress.phone || phone,
                address: selectedShippingAddress.address,
                ward: parseInt(selectedShippingAddress.ward),
                district: parseInt(selectedShippingAddress.district),
                province: parseInt(selectedShippingAddress.province),
                productPromotionCode:
                    selectedPromotion?.promotionType === "FIXED_AMOUNT" ||
                    selectedPromotion?.promotionType === "PERCENTAGE"
                        ? selectedPromotion.code
                        : null,
                shippingPromotionCode:
                    selectedPromotion?.promotionType === "SHIPPING_DISCOUNT"
                        ? selectedPromotion.code
                        : null,
            };

            // Create payment URL based on payment method
            let paymentResponse;
            if (paymentMethod === "vnpay") {
                paymentResponse = await paymentService.createVNPayPayment(
                    paymentData
                );
            } else if (paymentMethod === "paypal") {
                paymentResponse = await paymentService.createPayPalPayment(
                    paymentData
                );
            } else {
                showNotification(
                    "error",
                    "Phương thức thanh toán không hỗ trợ",
                    "Vui lòng chọn phương thức thanh toán VNPay hoặc PayPal."
                );
                return;
            }

            if (paymentResponse.success && paymentResponse.data.paymentUrl) {
                // Show success notification before redirect
                showNotification(
                    "success",
                    "Tạo thanh toán thành công",
                    "Bạn sẽ được chuyển hướng đến trang thanh toán trong giây lát..."
                );

                // Redirect after a short delay to let user see the notification
                setTimeout(() => {
                    window.location.href = paymentResponse.data.paymentUrl;
                }, 2000);
            } else {
                showNotification(
                    "error",
                    "Lỗi tạo thanh toán",
                    paymentResponse.msg ||
                        "Không thể tạo URL thanh toán. Vui lòng thử lại sau."
                );
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            const errorEntity = error as Error;
            let errorMessage = errorEntity.response.data.error.message;

            // Check if it's a network error
            if (error instanceof Error) {
                if (error.message.includes("Network")) {
                    errorMessage =
                        "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
                } else if (error.message.includes("timeout")) {
                    errorMessage =
                        "Yêu cầu quá thời gian chờ. Vui lòng thử lại sau.";
                }
            }

            showNotification("error", "Lỗi hệ thống", errorMessage);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Address management handlers
    const handleSelectAddress = (address: MyShippingAddress) => {
        setSelectedShippingAddress(address);
        setIsAddressDialogOpen(false);
    };

    const handleEditAddress = (address: MyShippingAddress) => {
        setEditingAddress(address);
        setIsEditDialogOpen(true);
    };

    const handleDeleteAddress = (addressId: number) => {
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
                await loadShippingAddresses();

                // If deleted address was selected, clear selection
                if (selectedShippingAddress?.id === deletingAddressId) {
                    setSelectedShippingAddress(null);
                }
            } else {
                const errorMsg =
                    response.message || "Không thể xóa địa chỉ giao hàng";
                setAddressError(errorMsg);
                showNotification("error", "Lỗi xóa địa chỉ", errorMsg);
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            const errorMsg = "Không thể xóa địa chỉ giao hàng";
            setAddressError(errorMsg);
            showNotification("error", "Lỗi hệ thống", errorMsg);
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingAddressId(null);
        }
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            const response = await userService.setDefaultShippingAddress(
                addressId
            );

            if (response.success) {
                await loadShippingAddresses();
            } else {
                const errorMsg =
                    response.message || "Không thể đặt địa chỉ mặc định";
                setAddressError(errorMsg);
                showNotification("error", "Lỗi cập nhật địa chỉ", errorMsg);
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            const errorMsg = "Không thể đặt địa chỉ mặc định";
            setAddressError(errorMsg);
            showNotification("error", "Lỗi hệ thống", errorMsg);
        }
    };

    // Check if cart is empty or loading
    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Đang tải giỏ hàng...
                    </h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-4">{error}</h2>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
                        onClick={loadCartData}
                    >
                        Thử lại
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate("/cart")}
                    >
                        Về giỏ hàng
                    </button>
                </div>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Giỏ hàng của bạn trống
                    </h2>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate("/products")}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="bg-gray-100 text-base py-5 font-semibold">
                <div className={"container mx-auto"}>Thanh toán</div>
            </h1>
            <div className="container mx-auto py-12 px-4 space-y-12">
                <div className={"flex flex-col space-y-12"}>
                    <div className={"py-12 text-center space-y-10 border-b"}>
                        <h2 className={"text-5xl font-semibold"}>
                            Bạn muốn nhận được hàng bằng cách nào?
                        </h2>
                        <div
                            className={
                                "flex justify-center items-center space-x-1 text-lg"
                            }
                        >
                            <p>Giao hàng đến:</p>
                            {selectedShippingAddress ? (
                                <div className="flex justify-between items-center">
                                    <button
                                        className="text-blue-600 cursor-pointer p-0 focus:outline-none underline underline-offset-2"
                                        onClick={openAddressDialog}
                                    >
                                        <AddressDisplay
                                            address={selectedShippingAddress}
                                        />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-fit p-0 text-blue-600 cursor-pointer focus:outline-none underline"
                                    onClick={openAddressDialog}
                                >
                                    Chọn địa chỉ giao hàng
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Step 1: Delivery Address */}
                    {currentStep === 1 && (
                        <div>
                            <div className={"pb-12"}>
                                <h2 className="text-2xl font-semibold mb-4">
                                    Còn hàng
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-12">
                                        {cartItems.map(
                                            (item: CartItem, index: number) => (
                                                <div
                                                    key={`${item.id}-${index}`}
                                                    className="flex gap-4"
                                                >
                                                    <img
                                                        src={
                                                            item.productImage ||
                                                            "https://via.placeholder.com/50"
                                                        }
                                                        alt={item.productName}
                                                        className="w-[10rem] object-cover aspect-[8/10] rounded-xl"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {item.productName}{" "}
                                                            {item.instances
                                                                .map(
                                                                    (
                                                                        instance
                                                                    ) =>
                                                                        instance.name
                                                                )
                                                                .join(" ")}{" "}
                                                            {item.color.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Số lượng:{" "}
                                                            {item.quantity}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Giá:{" "}
                                                            {item.price.toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "VND",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className={"grid grid-cols-2 gap-6"}>
                                        <h3 className={"text-xl col-span-2"}>
                                            Phương thức giao hàng của bạn:
                                        </h3>
                                        <button
                                            className={
                                                "bg-gray-50 rounded-xl border border-blue-500 text-start flex md:flex-row flex-col md:items-center items-start justify-between p-4 w-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            }
                                        >
                                            <div>
                                                <div
                                                    className={
                                                        "text-gray-500 text-sm"
                                                    }
                                                >
                                                    Giao hàng hôm nay
                                                </div>
                                                <div className={"text-lg"}>
                                                    Dự kiến nhận hàng vào{" "}
                                                    {new Date().toLocaleDateString(
                                                        "vi-VN",
                                                        {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            weekday: "short",
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    className={
                                                        "text-gray-500 text-sm uppercase text-end"
                                                    }
                                                >
                                                    {selectedPromotion?.promotionType ===
                                                    "SHIPPING_DISCOUNT"
                                                        ? `${(
                                                              40000 -
                                                              calculateShippingDiscount(
                                                                  selectedPromotion,
                                                                  40000
                                                              )
                                                          ).toLocaleString(
                                                              "vi-VN"
                                                          )}đ`
                                                        : "40,000đ"}
                                                </div>
                                            </div>
                                        </button>
                                        <div className={"text-sm space-y-2"}>
                                            <div className={"font-semibold"}>
                                                Một số điều cần ghi nhớ:
                                            </div>
                                            <ul
                                                className={
                                                    "list-disc list-inside"
                                                }
                                            >
                                                <li>
                                                    Đơn vị vận chuyển có thể yêu
                                                    cầu bạn ký tên khi giao
                                                    hàng.
                                                </li>
                                                <li>
                                                    Thời gian giao hàng tiêu
                                                    chuẩn là từ 8 giờ sáng đến 8
                                                    giờ tối, từ Thứ Hai đến Thứ
                                                    Bảy.
                                                </li>
                                            </ul>
                                        </div>
                                        <button
                                            className="bg-blue-600 text-white py-3 rounded-xl font-normal w-full hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={handleNextStep}
                                        >
                                            Tiếp tục đến thông tin thanh toán
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact and Payment Information */}
                    {currentStep === 2 && (
                        <div className="md:col-span-2">
                            <div>
                                <h2 className="text-xl font-bold mb-4">
                                    Thông tin liên hệ
                                </h2>
                                {selectedShippingAddress && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <span className="flex items-center gap-2">
                                                <Info className="size-4" />{" "}
                                                Thông tin liên hệ được tự động
                                                điền từ địa chỉ giao hàng đã
                                                chọn
                                            </span>
                                        </p>
                                    </div>
                                )}
                                {!selectedShippingAddress && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-700">
                                            <span className="font-medium">
                                                ⚠️ Chưa chọn địa chỉ giao hàng.
                                                Vui lòng quay lại bước 1 để chọn
                                                địa chỉ.
                                            </span>
                                        </p>
                                    </div>
                                )}
                                {selectedShippingAddress &&
                                    (!fullName || !email || !phone) && (
                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-700">
                                                <span className="font-medium">
                                                    ⚠️ Địa chỉ giao hàng đã chọn
                                                    thiếu thông tin liên hệ. Vui
                                                    lòng cập nhật địa chỉ giao
                                                    hàng để có thông tin đầy đủ.
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                <form
                                    onSubmit={handleSubmitOrder}
                                    className="space-y-6"
                                >
                                    <div
                                        className={
                                            "grid grid-cols-1 md:grid-cols-2 gap-6"
                                        }
                                    >
                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">
                                                Họ và tên
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                                                placeholder="Tự động điền từ địa chỉ giao hàng"
                                                value={fullName}
                                                readOnly
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                                                placeholder="Tự động điền từ địa chỉ giao hàng"
                                                value={email}
                                                readOnly
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                                                placeholder="Tự động điền từ địa chỉ giao hàng"
                                                value={phone}
                                                readOnly
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Promotion Selection */}
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 mt-8">
                                            Mã giảm giá
                                        </h2>
                                        <PromotionSelector
                                            selectedPromotion={
                                                selectedPromotion
                                            }
                                            onPromotionSelect={
                                                setSelectedPromotion
                                            }
                                            cartTotal={cartItems.reduce(
                                                (total, item) =>
                                                    total + item.total,
                                                0
                                            )}
                                            disabled={!selectedShippingAddress}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 mt-8">
                                            Phương thức thanh toán
                                        </h2>
                                        <div className="grid gap-4 2xl:grid-cols-4 md:grid-cols-3 grid-cols-1">
                                            {/* <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${
                                                    paymentMethod === "cod"
                                                        ? "border-blue-600 text-black bg-blue-50"
                                                        : "border-gray-300 text-gray-500 bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="cod"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={
                                                        paymentMethod === "cod"
                                                    }
                                                    onChange={
                                                        handlePaymentMethodChange
                                                    }
                                                    className="size-3.5 cursor-pointer focus:outline-none"
                                                    style={{
                                                        accentColor: "#007bff",
                                                    }}
                                                />
                                                <label
                                                    htmlFor="cod"
                                                    className={"cursor-pointer"}
                                                >
                                                    Thanh toán khi nhận hàng
                                                    (COD)
                                                </label>
                                            </div> */}

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${
                                                    paymentMethod === "momo"
                                                        ? "border-blue-600 text-black bg-blue-50"
                                                        : "border-gray-300 text-gray-500 bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="momo"
                                                    name="paymentMethod"
                                                    value="momo"
                                                    disabled
                                                    readOnly
                                                    checked={
                                                        paymentMethod === "momo"
                                                    }
                                                    onChange={
                                                        handlePaymentMethodChange
                                                    }
                                                    className="size-3.5 focus:outline-none cursor-not-allowed bg-amber-400"
                                                    style={{
                                                        accentColor: "#007bff",
                                                    }}
                                                />
                                                <div
                                                    className={
                                                        "flex justify-between w-full items-center"
                                                    }
                                                >
                                                    <label
                                                        htmlFor="momo"
                                                        className={
                                                            " cursor-not-allowed space-y-0.5"
                                                        }
                                                    >
                                                        Thanh toán bằng MOMO{" "}
                                                        <br />
                                                        <span className="text-xs text-gray-500">
                                                            (Hình thức thanh
                                                            toán này sẽ được
                                                            triển khai trong
                                                            thời gian tới)
                                                        </span>
                                                    </label>
                                                    <img
                                                        src={
                                                            "public/momo_square_pinkbg.svg"
                                                        }
                                                        alt={"Momo Logo"}
                                                        className={
                                                            "size-7 rounded-md"
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${
                                                    paymentMethod === "vnpay"
                                                        ? "border-blue-600 text-black bg-blue-50"
                                                        : "border-gray-300 text-gray-500 bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="vnpay"
                                                    name="paymentMethod"
                                                    value="vnpay"
                                                    checked={
                                                        paymentMethod ===
                                                        "vnpay"
                                                    }
                                                    onChange={
                                                        handlePaymentMethodChange
                                                    }
                                                    className="size-3.5 focus:outline-none cursor-pointer"
                                                    style={{
                                                        accentColor: "#007bff",
                                                    }}
                                                />
                                                <div
                                                    className={
                                                        "flex justify-between w-full items-center"
                                                    }
                                                >
                                                    <label
                                                        htmlFor="vnpay"
                                                        className={
                                                            "cursor-pointer"
                                                        }
                                                    >
                                                        Thanh toán bằng VNPAY
                                                    </label>
                                                    <img
                                                        src={
                                                            "https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"
                                                        }
                                                        alt={"VNPAY Logo"}
                                                        className={"h-5"}
                                                    />
                                                </div>
                                            </div>

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${
                                                    paymentMethod === "paypal"
                                                        ? "border-blue-600 text-black bg-blue-50"
                                                        : "border-gray-300 text-gray-500 bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="paypal"
                                                    name="paymentMethod"
                                                    value="paypal"
                                                    checked={
                                                        paymentMethod ===
                                                        "paypal"
                                                    }
                                                    onChange={
                                                        handlePaymentMethodChange
                                                    }
                                                    className="size-3.5 focus:outline-none cursor-pointer"
                                                    style={{
                                                        accentColor: "#007bff",
                                                    }}
                                                />
                                                <div
                                                    className={
                                                        "flex justify-between w-full items-center"
                                                    }
                                                >
                                                    <label
                                                        htmlFor="paypal"
                                                        className={
                                                            "cursor-pointer"
                                                        }
                                                    >
                                                        Thanh toán bằng PayPal
                                                    </label>
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/500px-PayPal_logo.svg.png"
                                                        alt="PayPal Logo"
                                                        className={"h-4"}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Tóm tắt đơn hàng
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Tạm tính:</span>
                                                <span>
                                                    {cartItems
                                                        .reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total,
                                                            0
                                                        )
                                                        .toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                    đ
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Phí vận chuyển:</span>
                                                <span>40,000đ</span>
                                            </div>
                                            {selectedPromotion &&
                                                selectedPromotion.promotionType !==
                                                    "SHIPPING_DISCOUNT" && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>
                                                            Giảm giá (
                                                            {
                                                                selectedPromotion.code
                                                            }
                                                            ):
                                                        </span>
                                                        <span>
                                                            -
                                                            {calculatePromotionDiscount(
                                                                selectedPromotion,
                                                                cartItems.reduce(
                                                                    (
                                                                        total,
                                                                        item
                                                                    ) =>
                                                                        total +
                                                                        item.total,
                                                                    0
                                                                )
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </span>
                                                    </div>
                                                )}
                                            {selectedPromotion &&
                                                selectedPromotion.promotionType ===
                                                    "SHIPPING_DISCOUNT" && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>
                                                            Giảm phí ship (
                                                            {
                                                                selectedPromotion.code
                                                            }
                                                            ):
                                                        </span>
                                                        <span>
                                                            -
                                                            {calculateShippingDiscount(
                                                                selectedPromotion,
                                                                40000
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </span>
                                                    </div>
                                                )}
                                            <div className="flex justify-between">
                                                <span>VAT (10%):</span>
                                                <span>
                                                    {(
                                                        (cartItems.reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total,
                                                            0
                                                        ) -
                                                            calculatePromotionDiscount(
                                                                selectedPromotion,
                                                                cartItems.reduce(
                                                                    (
                                                                        total,
                                                                        item
                                                                    ) =>
                                                                        total +
                                                                        item.total,
                                                                    0
                                                                )
                                                            )) *
                                                        0.1
                                                    ).toLocaleString("vi-VN")}
                                                    đ
                                                </span>
                                            </div>
                                            <hr className="my-3" />
                                            <div className="flex justify-between font-semibold text-lg">
                                                <span>Tổng cộng:</span>
                                                <span className="text-blue-600">
                                                    {(
                                                        cartItems.reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total,
                                                            0
                                                        ) +
                                                        40000 +
                                                        (cartItems.reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total,
                                                            0
                                                        ) -
                                                            calculatePromotionDiscount(
                                                                selectedPromotion,
                                                                cartItems.reduce(
                                                                    (
                                                                        total,
                                                                        item
                                                                    ) =>
                                                                        total +
                                                                        item.total,
                                                                    0
                                                                )
                                                            )) *
                                                            0.1 -
                                                        calculatePromotionDiscount(
                                                            selectedPromotion,
                                                            cartItems.reduce(
                                                                (total, item) =>
                                                                    total +
                                                                    item.total,
                                                                0
                                                            )
                                                        ) -
                                                        calculateShippingDiscount(
                                                            selectedPromotion,
                                                            40000
                                                        )
                                                    ).toLocaleString("vi-VN")}
                                                    đ
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <button
                                            type="button"
                                            className="text-gray-700 p-0 flex gap-1 items-center hover:underline focus:outline-none"
                                            onClick={handlePreviousStep}
                                        >
                                            <ChevronLeftIcon
                                                className={"size-4 mt-0.5"}
                                            />
                                            Quay lại
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isProcessingPayment}
                                            className={`px-6 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2 ${
                                                isProcessingPayment
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                                            }`}
                                        >
                                            {isProcessingPayment && (
                                                <svg
                                                    className="animate-spin h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                            )}
                                            {isProcessingPayment
                                                ? "Đang xử lý..."
                                                : "Tiến hành thanh toán"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Address Management Dialog */}
                <Dialog
                    open={isAddressDialogOpen}
                    onOpenChange={setIsAddressDialogOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-center">
                                Chọn địa chỉ giao hàng
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Address List */}
                            {isLoadingAddresses ? (
                                <div className="text-center py-8">
                                    <p>Đang tải danh sách địa chỉ...</p>
                                </div>
                            ) : addressError ? (
                                <div className="text-center py-8 text-red-600">
                                    <p>{addressError}</p>
                                    <Button
                                        onClick={loadShippingAddresses}
                                        className="mt-2"
                                        variant="outline"
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            ) : shippingAddresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">
                                        Bạn chưa có địa chỉ giao hàng nào
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setIsCreateDialogOpen(true);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500"
                                    >
                                        Thêm địa chỉ mới
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Add New Address Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => {
                                                setIsCreateDialogOpen(true);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-500"
                                        >
                                            Thêm địa chỉ mới
                                        </Button>
                                    </div>

                                    {/* Address Cards */}
                                    <div className="space-y-3">
                                        {shippingAddresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                    selectedShippingAddress?.id ===
                                                    address.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleSelectAddress(address)
                                                }
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium">
                                                                {
                                                                    address.firstName
                                                                }{" "}
                                                                {
                                                                    address.lastName
                                                                }
                                                            </span>
                                                            {address.isDefault && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs"
                                                                >
                                                                    Mặc định
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {address.phone}
                                                        </p>
                                                        <div className="text-sm text-gray-700">
                                                            <AddressDisplay
                                                                address={
                                                                    address
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <span className="sr-only">
                                                                    Mở menu
                                                                </span>
                                                                ⋮
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleEditAddress(
                                                                        address
                                                                    );
                                                                }}
                                                            >
                                                                Chỉnh sửa
                                                            </DropdownMenuItem>
                                                            {!address.isDefault && (
                                                                <DropdownMenuItem
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleSetDefaultAddress(
                                                                            address.id
                                                                        );
                                                                    }}
                                                                >
                                                                    Đặt làm mặc
                                                                    định
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteAddress(
                                                                        address.id
                                                                    );
                                                                }}
                                                                className="text-red-600"
                                                            >
                                                                Xóa
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Address Dialog */}
                <EditAddressDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingAddress(null);
                    }}
                    address={editingAddress}
                    onSave={async (
                        addressData: Partial<
                            import("@/services/userService").MyShippingAddress
                        >
                    ) => {
                        try {
                            if (editingAddress?.id) {
                                const response =
                                    await userService.updateShippingAddress(
                                        editingAddress.id,
                                        addressData
                                    );

                                if (response.success) {
                                    await loadShippingAddresses();
                                    setIsEditDialogOpen(false);
                                    setEditingAddress(null);
                                } else {
                                    throw new Error(
                                        response.message ||
                                            "Không thể cập nhật địa chỉ"
                                    );
                                }
                            }
                        } catch (error) {
                            console.error("Error updating address:", error);
                            throw error;
                        }
                    }}
                />

                {/* Create Address Dialog */}
                <CreateAddressDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    onSave={async (
                        addressData: import("@/services/userService").CreateShippingAddressData
                    ) => {
                        try {
                            const response =
                                await userService.createShippingAddress(
                                    addressData
                                );

                            if (response.success) {
                                await loadShippingAddresses();
                                setIsCreateDialogOpen(false);
                            } else {
                                throw new Error(
                                    response.message ||
                                        "Không thể tạo địa chỉ mới"
                                );
                            }
                        } catch (error) {
                            console.error("Error creating address:", error);
                            throw error;
                        }
                    }}
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
                                Bạn có chắc chắn muốn xóa địa chỉ này? Hành động
                                này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteAddress}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Notification Dialog */}
                <NotificationDialog
                    isOpen={notificationDialog.isOpen}
                    onClose={closeNotification}
                    type={notificationDialog.type}
                    title={notificationDialog.title}
                    message={notificationDialog.message}
                />
            </div>
        </div>
    );
};

export default PaymentPage;
