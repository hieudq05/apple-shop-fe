import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartApiService, type CartItem } from "../services/cartApiService";
import userService, { type MyShippingAddress } from "../services/userService";
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

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    // Step 1 state
    const [selectedAddress, setSelectedAddress] = useState<string>("");

    // Step 2 state
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");

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

    // Load cart data from API
    useEffect(() => {
        loadCartData();
        loadShippingAddresses();
    }, []);

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
    const loadShippingAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            setAddressError("");
            const response = await userService.getMyShippingAddress();
            setShippingAddresses(response.data);

            // Auto-select default address if available
            const defaultAddress = response.data.find(
                (addr: MyShippingAddress) => addr.isDefault
            );
            if (defaultAddress) {
                setSelectedShippingAddress(defaultAddress);
                const formattedAddress = `${defaultAddress.address}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`;
                setSelectedAddress(formattedAddress);
            }
        } catch (err) {
            console.error("Error loading shipping addresses:", err);
            setAddressError("Không thể tải danh sách địa chỉ giao hàng");
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhone = e.target.value.replace(/\D/g, "");
        setPhone(formattedPhone);
    };

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
        if (!selectedAddress) {
            alert("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        setCurrentStep(2);
    };

    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    const handleSubmitOrder = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate step 2 data
        if (!fullName || !email || !phone) {
            alert("Vui lòng điền đầy đủ thông tin liên hệ");
            return;
        }

        if (!selectedShippingAddress) {
            alert("Vui lòng chọn địa chỉ giao hàng");
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
        const shippingFee = 0; // Free shipping
        const vat = subtotal * 0.1; // 10% VAT
        const totalAmount = subtotal + shippingFee + vat;

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
            totalAmount,
        };

        // Send order data to API
        console.log("Order data:", orderData);

        // Redirect to confirmation page or show success message
        alert("Đặt hàng thành công!");
        navigate("/");
    };

    // Address management handlers
    const handleSelectAddress = (address: MyShippingAddress) => {
        setSelectedShippingAddress(address);
        const formattedAddress = `${address.address}, ${address.ward}, ${address.district}, ${address.province}`;
        setSelectedAddress(formattedAddress);
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
            await userService.deleteShippingAddress(deletingAddressId);
            await loadShippingAddresses();

            // If deleted address was selected, clear selection
            if (selectedShippingAddress?.id === deletingAddressId) {
                setSelectedShippingAddress(null);
                setSelectedAddress("");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            setAddressError("Không thể xóa địa chỉ giao hàng");
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingAddressId(null);
        }
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            await userService.setDefaultShippingAddress(addressId);
            await loadShippingAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
            setAddressError("Không thể đặt địa chỉ mặc định");
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
            <h1 className="bg-gray-100 text-lg py-5 font-semibold">
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
                                "flex justify-center items-center space-x-1"
                            }
                        >
                            <p>Giao hàng đến:</p>
                            {selectedAddress ? (
                                <div className="flex justify-between items-center">
                                    <button
                                        className="text-blue-600 p-0 focus:outline-none underline underline-offset-2"
                                        onClick={openAddressDialog}
                                    >
                                        {selectedAddress}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-fit p-0 text-blue-600 focus:outline-none underline"
                                    onClick={openAddressDialog}
                                >
                                    Tỉnh/Thành phố
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
                                    <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-12">
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
                                                "bg-gray-50 rounded-xl border border-blue-500 text-start flex items-center justify-between p-4 w-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                                                    Miễn phí
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
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập họ và tên"
                                                value={fullName}
                                                onChange={handleFullNameChange}
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập email"
                                                value={email}
                                                onChange={handleEmailChange}
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập số điện thoại"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 mt-8">
                                            Phương thức thanh toán
                                        </h2>
                                        <div className="grid gap-4 2xl:grid-cols-4 md:grid-cols-2 grid-cols-1">
                                            <div
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
                                            </div>

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
                                                    checked={
                                                        paymentMethod === "momo"
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
                                                        htmlFor="momo"
                                                        className={
                                                            "cursor-pointer"
                                                        }
                                                    >
                                                        Thanh toán bằng MOMO
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
                                            className="bg-blue-600 text-white px-6 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition hover:bg-blue-500"
                                        >
                                            Tiến hành thanh toán
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
                                        onClick={() =>
                                            setIsCreateDialogOpen(true)
                                        }
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
                                            onClick={() =>
                                                setIsCreateDialogOpen(true)
                                            }
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
                                                        <p className="text-sm text-gray-700">
                                                            {address.address},{" "}
                                                            {address.ward},{" "}
                                                            {address.district},{" "}
                                                            {address.province}
                                                        </p>
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
                    onSave={async () => {
                        await loadShippingAddresses();
                        setIsEditDialogOpen(false);
                        setEditingAddress(null);
                    }}
                />

                {/* Create Address Dialog */}
                <CreateAddressDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    onSave={async () => {
                        await loadShippingAddresses();
                        setIsCreateDialogOpen(false);
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
            </div>
        </div>
    );
};

export default PaymentPage;
