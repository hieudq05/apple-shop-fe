import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    Plus,
    Save,
    Package,
    User,
    CreditCard,
    Calculator,
    ShoppingCart,
    X,
    Search,
    Tag,
    Truck,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import orderService from "@/services/orderService";
import type { CreateAdminOrderRequest } from "@/services/orderService";
import { adminProductService } from "@/services/adminProductService";
import { useAuth } from "@/hooks/useAuthContext";
import userService, { type User as UserType } from "@/services/userService";
import addressService, {
    type Province,
    type District,
    type Ward,
} from "@/services/addressService";
import promotionService, { type Promotion } from "@/services/promotionService";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

interface OrderItem {
    stockId: number;
    quantity: number;
    productName?: string;
    colorName?: string;
    price?: number;
    total?: number;
    image?: string;
}

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
}

interface Stock {
    id: number;
    productName: string;
    colorName: string;
    colorId: number;
    colorHexCode: string;
    price: number;
    quantity: number;
    photos?: {
        alt: string;
        imageUrl: string;
        id: number;
    }[];
}

const CreateOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);

    // Address data states
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Promotion data states
    const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>(
        []
    );
    const [loadingPromotions, setLoadingPromotions] = useState(false);
    const [promotionSearchType, setPromotionSearchType] = useState<
        "product" | "shipping"
    >("product");

    // Form states
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        province: "",
    });
    const [orderStatus, setOrderStatus] = useState<
        | "PENDING_PAYMENT"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
    >("PENDING_PAYMENT");
    const [paymentType, setPaymentType] = useState<
        "VNPAY" | "MOMO" | "CASH" | "BANK_TRANSFER"
    >("VNPAY");
    const [shippingFee, setShippingFee] = useState<number>(40000);
    const [productPromotionCode, setProductPromotionCode] =
        useState<string>("");
    const [shippingPromotionCode, setShippingPromotionCode] =
        useState<string>("");

    // Applied promotion states
    const [appliedProductPromotion, setAppliedProductPromotion] =
        useState<Promotion | null>(null);
    const [appliedShippingPromotion, setAppliedShippingPromotion] =
        useState<Promotion | null>(null);
    const [productDiscountAmount, setProductDiscountAmount] =
        useState<number>(0);
    const [shippingDiscountAmount, setShippingDiscountAmount] =
        useState<number>(0);

    // User selection states
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");

    // Search for products/stocks
    const searchProducts = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setAvailableStocks([]);
            return;
        }

        setSearchingProducts(true);
        try {
            const response = await adminProductService.searchProducts({
                searchKeyword: searchTerm,
                page: 0,
                size: 20,
                inStock: true, // Only show products in stock
            });

            const stocks: Stock[] = [];
            if (
                response.success &&
                response.data &&
                Array.isArray(response.data)
            ) {
                response.data.forEach((product) => {
                    product.stocks.forEach((stock) => {
                        if (stock.quantity > 0) {
                            // Only show stocks with quantity > 0
                            stocks.push({
                                id: stock.id,
                                productName: product.name,
                                colorId: stock.colorId,
                                colorName: stock.colorName,
                                colorHexCode: stock.colorHexCode,
                                price: stock.price,
                                quantity: stock.quantity,
                                photos:
                                    stock.productPhotos?.map((photo) => ({
                                        alt: photo.alt,
                                        imageUrl: photo.imageUrl,
                                        id: photo.id,
                                    })) || [],
                            });
                        }
                    });
                });
            }

            setAvailableStocks(stocks);
        } catch (error) {
            console.error("Error searching products:", error);
            toast.error("Không thể tìm kiếm sản phẩm");
        } finally {
            setSearchingProducts(false);
        }
    };

    // Search for users
    const searchUsers = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setAvailableUsers([]);
            return;
        }

        setLoadingUsers(true);
        try {
            const response = await userService.getUsers({
                search: searchTerm,
                page: 0,
                size: 10,
            });

            if (response.success && response.data) {
                setAvailableUsers(response.data);
            }
        } catch (error) {
            console.error("Error searching users:", error);
            toast.error("Không thể tìm kiếm người dùng");
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingAddress(true);
            try {
                const provincesData = await addressService.getProvinces();
                setProvinces(provincesData);
            } catch (error) {
                console.error("Error fetching provinces:", error);
                toast.error("Không thể tải danh sách tỉnh thành");
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    const handleProvinceChange = async (provinceCode: string) => {
        setCustomerInfo((prev) => ({
            ...prev,
            province: provinceCode,
            district: "",
            ward: "",
        }));
        setDistricts([]);
        setWards([]);

        if (!provinceCode) return;

        setLoadingAddress(true);
        try {
            const districtsData = await addressService.getDistrictsByProvince(
                provinceCode
            );
            setDistricts(districtsData);
        } catch (error) {
            console.error("Error fetching districts:", error);
            toast.error("Không thể tải danh sách quận huyện");
        } finally {
            setLoadingAddress(false);
        }
    };

    // Fetch wards when district changes
    const handleDistrictChange = async (districtCode: string) => {
        setCustomerInfo((prev) => ({
            ...prev,
            district: districtCode,
            ward: "",
        }));
        setWards([]);

        if (!districtCode) return;

        setLoadingAddress(true);
        try {
            const wardsData = await addressService.getWardsByDistrict(
                districtCode
            );
            setWards(wardsData);
        } catch (error) {
            console.error("Error fetching wards:", error);
            toast.error("Không thể tải danh sách phường xã");
        } finally {
            setLoadingAddress(false);
        }
    };

    // Search promotions
    const searchPromotions = async (
        searchTerm: string,
        type: "product" | "shipping"
    ) => {
        if (!searchTerm.trim()) {
            setAvailablePromotions([]);
            return;
        }

        setLoadingPromotions(true);
        try {
            const response = await promotionService.searchPromotions({
                keyword: searchTerm,
                page: 0,
                size: 10,
                // Filter by promotion type
                promotionType:
                    type === "shipping" ? "SHIPPING_DISCOUNT" : undefined,
            });

            if (response.success && response.data) {
                // Filter active promotions and by type
                const activePromotions = response.data.filter((promo) => {
                    if (!promo.isActive) return false;

                    if (type === "shipping") {
                        return promo.promotionType === "SHIPPING_DISCOUNT";
                    } else {
                        // For product promotions, exclude shipping discounts
                        return (
                            promo.promotionType === "PERCENTAGE" ||
                            promo.promotionType === "FIXED_AMOUNT"
                        );
                    }
                });
                setAvailablePromotions(activePromotions);
            }
        } catch (error) {
            console.error("Error searching promotions:", error);
            toast.error("Không thể tìm kiếm mã giảm giá");
        } finally {
            setLoadingPromotions(false);
        }
    };

    // Apply promotion and calculate discount
    const applyPromotion = (
        promotion: Promotion,
        type: "product" | "shipping"
    ) => {
        // Validate promotion type
        if (
            type === "product" &&
            promotion.promotionType === "SHIPPING_DISCOUNT"
        ) {
            toast.error(
                "Mã này chỉ áp dụng cho phí vận chuyển, không thể áp dụng cho sản phẩm"
            );
            return;
        }
        if (
            type === "shipping" &&
            promotion.promotionType !== "SHIPPING_DISCOUNT"
        ) {
            toast.error(
                "Mã này chỉ áp dụng cho sản phẩm, không thể áp dụng cho phí vận chuyển"
            );
            return;
        }

        if (type === "product") {
            const currentSubtotal = orderItems.reduce(
                (sum, item) => sum + (item.total || 0),
                0
            );

            // Check minimum order value
            if (
                promotion.minOrderValue &&
                currentSubtotal < promotion.minOrderValue
            ) {
                toast.error(
                    `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString()}đ để áp dụng mã này`
                );
                return;
            }

            let discountAmount = 0;
            if (promotion.promotionType === "PERCENTAGE") {
                discountAmount = (currentSubtotal * promotion.value) / 100;
                // Apply max discount limit if exists
                if (
                    promotion.maxDiscountAmount &&
                    discountAmount > promotion.maxDiscountAmount
                ) {
                    discountAmount = promotion.maxDiscountAmount;
                }
            } else if (promotion.promotionType === "FIXED_AMOUNT") {
                discountAmount = promotion.value;
            }

            setAppliedProductPromotion(promotion);
            setProductDiscountAmount(discountAmount);
            setProductPromotionCode(promotion.code);
            setAvailablePromotions([]);
            toast.success(
                `Áp dụng mã giảm giá thành công! Tiết kiệm ${discountAmount.toLocaleString()}đ`
            );
        } else {
            // Shipping promotion
            let discountAmount = 0;
            if (promotion.promotionType === "PERCENTAGE") {
                discountAmount = (shippingFee * promotion.value) / 100;
                if (
                    promotion.maxDiscountAmount &&
                    discountAmount > promotion.maxDiscountAmount
                ) {
                    discountAmount = promotion.maxDiscountAmount;
                }
            } else if (
                promotion.promotionType === "FIXED_AMOUNT" ||
                promotion.promotionType === "SHIPPING_DISCOUNT"
            ) {
                discountAmount = Math.min(promotion.value, shippingFee);
            }

            setAppliedShippingPromotion(promotion);
            setShippingDiscountAmount(discountAmount);
            setShippingPromotionCode(promotion.code);
            setAvailablePromotions([]);
            toast.success(
                `Áp dụng mã giảm phí vận chuyển thành công! Tiết kiệm ${discountAmount.toLocaleString()}đ`
            );
        }
    };

    // Remove applied promotion
    const removePromotion = (type: "product" | "shipping") => {
        if (type === "product") {
            setAppliedProductPromotion(null);
            setProductDiscountAmount(0);
            setProductPromotionCode("");
        } else {
            setAppliedShippingPromotion(null);
            setShippingDiscountAmount(0);
            setShippingPromotionCode("");
        }
    };

    // Validate and apply promotion code directly
    const validateAndApplyPromotion = async (
        code: string,
        type: "product" | "shipping"
    ) => {
        if (!code.trim()) return;

        try {
            const response = await promotionService.searchPromotions({
                code: code.trim(),
                page: 0,
                size: 1,
            });

            if (response.success && response.data && response.data.length > 0) {
                const promotion = response.data[0];

                if (!promotion.isActive) {
                    toast.error("Mã giảm giá không còn hiệu lực");
                    return;
                }

                applyPromotion(promotion, type);
            } else {
                toast.error("Mã giảm giá không tồn tại");
            }
        } catch (error) {
            console.error("Error validating promotion:", error);
            toast.error("Không thể kiểm tra mã giảm giá");
        }
    };

    // Add product to order
    const addOrderItem = (stock: Stock) => {
        const existingItem = orderItems.find(
            (item) => item.stockId === stock.id
        );
        if (existingItem) {
            setOrderItems((items) =>
                items.map((item) =>
                    item.stockId === stock.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setOrderItems((items) => [
                ...items,
                {
                    stockId: stock.id,
                    quantity: 1,
                    productName: stock.productName,
                    colorName: stock.colorName,
                    price: stock.price,
                    total: stock.price,
                    image: stock?.photos[0]?.imageUrl,
                },
            ]);
        }
        setShowProductSearch(false);
        setProductSearchTerm("");
        setAvailableStocks([]);
    };

    // Update order item quantity
    const updateOrderItemQuantity = (stockId: number, quantity: number) => {
        if (quantity <= 0) {
            removeOrderItem(stockId);
            return;
        }

        setOrderItems((items) =>
            items.map((item) =>
                item.stockId === stockId
                    ? { ...item, quantity, total: (item.price || 0) * quantity }
                    : item
            )
        );

        // Recalculate product discount if applied
        if (appliedProductPromotion) {
            const newSubtotal = orderItems.reduce((sum, item) => {
                if (item.stockId === stockId) {
                    return sum + (item.price || 0) * quantity;
                }
                return sum + (item.total || 0);
            }, 0);

            let discountAmount = 0;
            if (appliedProductPromotion.promotionType === "PERCENTAGE") {
                discountAmount =
                    (newSubtotal * appliedProductPromotion.value) / 100;
                if (
                    appliedProductPromotion.maxDiscountAmount &&
                    discountAmount > appliedProductPromotion.maxDiscountAmount
                ) {
                    discountAmount = appliedProductPromotion.maxDiscountAmount;
                }
            } else if (
                appliedProductPromotion.promotionType === "FIXED_AMOUNT"
            ) {
                discountAmount = appliedProductPromotion.value;
            }

            setProductDiscountAmount(discountAmount);
        }
    };

    // Remove order item
    const removeOrderItem = (stockId: number) => {
        setOrderItems((items) =>
            items.filter((item) => item.stockId !== stockId)
        );

        // Recalculate product discount if applied
        if (appliedProductPromotion) {
            const newSubtotal = orderItems.reduce((sum, item) => {
                if (item.stockId === stockId) {
                    return sum; // Skip the removed item
                }
                return sum + (item.total || 0);
            }, 0);

            let discountAmount = 0;
            if (appliedProductPromotion.promotionType === "PERCENTAGE") {
                discountAmount =
                    (newSubtotal * appliedProductPromotion.value) / 100;
                if (
                    appliedProductPromotion.maxDiscountAmount &&
                    discountAmount > appliedProductPromotion.maxDiscountAmount
                ) {
                    discountAmount = appliedProductPromotion.maxDiscountAmount;
                }
            } else if (
                appliedProductPromotion.promotionType === "FIXED_AMOUNT"
            ) {
                discountAmount = appliedProductPromotion.value;
            }

            setProductDiscountAmount(discountAmount);
        }
    };

    // Calculate totals
    const subtotal = orderItems.reduce(
        (sum, item) => sum + (item.total || 0),
        0
    );
    const discountedSubtotal = subtotal - productDiscountAmount;
    const discountedShippingFee = shippingFee - shippingDiscountAmount;
    const totalAmount = discountedSubtotal + discountedShippingFee;
    const totalDiscountAmount = productDiscountAmount + shippingDiscountAmount;

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Vui lòng đăng nhập");
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng");
            return;
        }

        if (
            !customerInfo.firstName ||
            !customerInfo.lastName ||
            !customerInfo.email ||
            !customerInfo.phone
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
            return;
        }

        setSaving(true);
        try {
            const orderData: CreateAdminOrderRequest = {
                createdByUserId: selectedUser?.id || user.id,
                status: orderStatus,
                paymentType: paymentType,
                customInfo: customerInfo,
                orderDetails: orderItems.map((item) => ({
                    stockId: item.stockId,
                    quantity: item.quantity,
                })),
                shippingFee: shippingFee,
                productPromotionCode: productPromotionCode || undefined,
                shippingPromotionCode: shippingPromotionCode || undefined,
            };

            const response = await orderService.createAdminOrder(orderData);

            if (response.success) {
                const recipientName = selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : `${user?.firstName || ""} ${user?.lastName || ""}`;
                toast.success(`Tạo đơn hàng thành công cho ${recipientName}`);
                navigate("/admin/orders");
            } else {
                toast.error("Không thể tạo đơn hàng");
            }
        } catch (error: unknown) {
            console.error("Error creating order:", error);
            const errorMessage =
                error instanceof Error
                    ? error.response.data.error.message
                    : "Có lỗi xảy ra khi tạo đơn hàng";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Auto-search products when search term changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (productSearchTerm) {
                searchProducts(productSearchTerm);
            } else {
                setAvailableStocks([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearchTerm]);

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <Helmet>
                <title>Tạo đơn hàng mới - Apple</title>
            </Helmet>
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admin/orders")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tạo đơn hàng mới</h1>
                        <p className="text-muted-foreground">
                            Tạo đơn hàng cho khách hàng từ admin/staff
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User Selection */}
                            <div className="p-4 bg-foreground/3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">
                                        Chọn người dùng nhận đơn hàng (tùy chọn)
                                    </Label>
                                    <div className="flex gap-2">
                                        {selectedUser && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedUser(null)
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setShowUserSearch(true)
                                            }
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-5">
                                    Nếu không chọn, đơn hàng sẽ được tạo bởi
                                    admin/staff hiện tại
                                </p>
                                {selectedUser ? (
                                    <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <img src={selectedUser.image} alt="" className="size-12 object-cover rounded-full" />
                                            <div>
                                                <div className="font-medium">
                                                    {selectedUser.firstName}{" "}
                                                    {selectedUser.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedUser.email}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setSelectedUser(null)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-foreground/3 rounded border">
                                        <div className="text-center text-gray-500 mb-2">
                                            Chưa chọn người dùng
                                        </div>
                                        <div className="text-xs text-gray-400 text-center">
                                            Đơn hàng sẽ được tạo bởi:{" "}
                                            {user?.firstName || ""}{" "}
                                            {user?.lastName || ""} (
                                            {user?.email || ""})
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">Họ *</Label>
                                    <Input
                                        id="firstName"
                                        value={customerInfo.firstName}
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                firstName: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Tên *</Label>
                                    <Input
                                        id="lastName"
                                        value={customerInfo.lastName}
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                lastName: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={(e) =>
                                        setCustomerInfo({
                                            ...customerInfo,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Số điện thoại *</Label>
                                <Input
                                    id="phone"
                                    value={customerInfo.phone}
                                    onChange={(e) =>
                                        setCustomerInfo({
                                            ...customerInfo,
                                            phone: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="address">Địa chỉ *</Label>
                                <Input
                                    id="address"
                                    value={customerInfo.address}
                                    onChange={(e) =>
                                        setCustomerInfo({
                                            ...customerInfo,
                                            address: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="ward">Phường/Xã *</Label>
                                    <Select
                                        value={customerInfo.ward}
                                        onValueChange={(value) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                ward: value,
                                            })
                                        }
                                        required
                                        disabled={loadingAddress}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingAddress
                                                        ? "Đang tải..."
                                                        : "Chọn phường/xã"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <div>
                                    <Label htmlFor="district">
                                        Quận/Huyện *
                                    </Label>
                                    <Select
                                        value={customerInfo.district}
                                        onValueChange={handleDistrictChange}
                                        required
                                        disabled={loadingAddress}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingAddress
                                                        ? "Đang tải..."
                                                        : "Chọn quận/huyện"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <div>
                                    <Label htmlFor="province">
                                        Tỉnh/Thành phố *
                                    </Label>
                                    <Select
                                        value={customerInfo.province}
                                        onValueChange={handleProvinceChange}
                                        required
                                        disabled={loadingAddress}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingAddress
                                                        ? "Đang tải..."
                                                        : "Chọn tỉnh/thành phố"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Cài đặt đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="orderStatus">
                                    Trạng thái đơn hàng
                                </Label>
                                <Select
                                    value={orderStatus}
                                    onValueChange={(
                                        value: typeof orderStatus
                                    ) => setOrderStatus(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING_PAYMENT">
                                            Chờ thanh toán
                                        </SelectItem>
                                        <SelectItem value="PAID">
                                            Đã thanh toán
                                        </SelectItem>
                                        <SelectItem value="PROCESSING">
                                            Đang xử lý
                                        </SelectItem>
                                        <SelectItem value="AWAITING_SHIPMENT">
                                            Chờ giao hàng
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="paymentType">
                                    Phương thức thanh toán
                                </Label>
                                <Select
                                    value={paymentType}
                                    onValueChange={(
                                        value: typeof paymentType
                                    ) => setPaymentType(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VNPAY">
                                            VNPAY
                                        </SelectItem>
                                        <SelectItem value="PAYPAL">
                                            PayPal
                                        </SelectItem>
                                        <SelectItem value="MOMO" disabled>
                                            MOMO
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="shippingFee">
                                    Phí vận chuyển (VND)
                                </Label>
                                <Input
                                    id="shippingFee"
                                    type="number"
                                    disabled={true}
                                    value={shippingFee}
                                    onChange={(e) =>
                                        setShippingFee(Number(e.target.value))
                                    }
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="productPromotionCode"
                                    className="flex items-center gap-2"
                                >
                                    <Tag className="h-4 w-4 text-green-600" />
                                    Mã giảm giá sản phẩm
                                </Label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Áp dụng cho giá trị đơn hàng (không bao gồm
                                    phí ship)
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        id="productPromotionCode"
                                        value={productPromotionCode}
                                        onChange={(e) =>
                                            setProductPromotionCode(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mã giảm giá sản phẩm"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                validateAndApplyPromotion(
                                                    productPromotionCode,
                                                    "product"
                                                );
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            validateAndApplyPromotion(
                                                productPromotionCode,
                                                "product"
                                            )
                                        }
                                        disabled={!productPromotionCode.trim()}
                                    >
                                        Áp dụng
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPromotionSearchType("product");
                                            searchPromotions(
                                                productPromotionCode,
                                                "product"
                                            );
                                        }}
                                        disabled={loadingPromotions}
                                    >
                                        {loadingPromotions ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label
                                    htmlFor="shippingPromotionCode"
                                    className="flex items-center gap-2"
                                >
                                    <Truck className="h-4 w-4 text-blue-600" />
                                    Mã giảm phí vận chuyển
                                </Label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Áp dụng cho phí vận chuyển (miễn phí ship)
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        id="shippingPromotionCode"
                                        value={shippingPromotionCode}
                                        onChange={(e) =>
                                            setShippingPromotionCode(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mã miễn phí vận chuyển"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                validateAndApplyPromotion(
                                                    shippingPromotionCode,
                                                    "shipping"
                                                );
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            validateAndApplyPromotion(
                                                shippingPromotionCode,
                                                "shipping"
                                            )
                                        }
                                        disabled={!shippingPromotionCode.trim()}
                                    >
                                        Áp dụng
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPromotionSearchType("shipping");
                                            searchPromotions(
                                                shippingPromotionCode,
                                                "shipping"
                                            );
                                        }}
                                        disabled={loadingPromotions}
                                    >
                                        {loadingPromotions ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Promotion search results */}
                            {availablePromotions.length > 0 && (
                                <div className="mt-4 p-4 border rounded-xl bg-foreground/3">
                                    <h4 className="font-semibold mb-2">
                                        {promotionSearchType === "product"
                                            ? "Mã giảm giá sản phẩm có sẵn:"
                                            : "Mã giảm phí vận chuyển có sẵn:"}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {availablePromotions.map((promo) => (
                                            <div
                                                key={promo.id}
                                                className={`flex items-center justify-between p-3 bg-foreground/3 rounded-lg border cursor-pointer transition-colors ${
                                                    promo.promotionType ===
                                                    "SHIPPING_DISCOUNT"
                                                        ? "hover:bg-foreground/10"
                                                        : "hover:bg-foreground/10"
                                                }`}
                                                onClick={() => {
                                                    applyPromotion(
                                                        promo,
                                                        promotionSearchType
                                                    );
                                                }}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">
                                                            {promo.code}
                                                        </div>
                                                        <Badge
                                                            variant={"outline"}
                                                            className={`font-medium ${
                                                                promo.promotionType ===
                                                                "SHIPPING_DISCOUNT"
                                                                    ? "text-blue-500 bg-blue-500/10"
                                                                    : "text-green-500"
                                                            }`}
                                                        >
                                                            {promo.promotionType ===
                                                            "SHIPPING_DISCOUNT"
                                                                ? "Giảm giá phí vận chuyển"
                                                                : "Giảm giá sản phẩm"}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {promo.name}
                                                    </div>
                                                    {promo.minOrderValue && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Đơn tối thiểu:{" "}
                                                            {promo.minOrderValue.toLocaleString()}
                                                            đ
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className={`text-sm text-end font-medium ${
                                                        promo.promotionType ===
                                                        "SHIPPING_DISCOUNT"
                                                            ? "text-blue-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {promo.promotionType ===
                                                    "PERCENTAGE"
                                                        ? `-${promo.value}%`
                                                        : `-${promo.value.toLocaleString()}đ`}
                                                    {promo.maxDiscountAmount && (
                                                        <div className="text-xs text-gray-500">
                                                            Tối đa:{" "}
                                                            {promo.maxDiscountAmount.toLocaleString()}
                                                            đ
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Applied promotions display */}
                            {appliedProductPromotion && (
                                <div className="mt-4 p-4 border rounded-xl bg-foreground/3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-foreground">
                                                Mã giảm giá sản phẩm đã áp dụng
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {appliedProductPromotion.code} -{" "}
                                                {appliedProductPromotion.name}
                                            </p>
                                            <p className="text-sm font-medium text-green-500">
                                                Tiết kiệm:{" "}
                                                {productDiscountAmount.toLocaleString()}
                                                đ
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removePromotion("product")
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {appliedShippingPromotion && (
                                <div className="mt-4 p-4 border rounded-xl bg-foreground/3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-foreground">
                                                Mã giảm phí vận chuyển đã áp
                                                dụng
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {appliedShippingPromotion.code}{" "}
                                                -{" "}
                                                {appliedShippingPromotion.name}
                                            </p>
                                            <p className="text-sm font-medium text-blue-500">
                                                Tiết kiệm:{" "}
                                                {shippingDiscountAmount.toLocaleString()}
                                                đ
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removePromotion("shipping")
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Sản phẩm đặt hàng
                        </CardTitle>
                        <CardDescription>
                            Thêm các sản phẩm vào đơn hàng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Add Product Button */}
                            <Dialog
                                open={showProductSearch}
                                onOpenChange={setShowProductSearch}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm sản phẩm
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Tìm kiếm sản phẩm
                                        </DialogTitle>
                                        <DialogDescription>
                                            Tìm kiếm và thêm sản phẩm vào đơn
                                            hàng
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={productSearchTerm}
                                            onChange={(e) =>
                                                setProductSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div className="max-h-96 overflow-y-auto space-y-2">
                                            {searchingProducts ? (
                                                <div className="text-center py-4">
                                                    <div className="text-muted-foreground">
                                                        Đang tìm kiếm...
                                                    </div>
                                                </div>
                                            ) : availableStocks.length > 0 ? (
                                                availableStocks.map((stock) => (
                                                    <div
                                                        key={stock.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                                        onClick={() =>
                                                            addOrderItem(stock)
                                                        }
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                                <img
                                                                    src={
                                                                        stock
                                                                            .photos?.[0]
                                                                            ?.imageUrl ||
                                                                        "/placeholder.png"
                                                                    }
                                                                    alt={
                                                                        stock
                                                                            .photos?.[0]
                                                                            ?.alt ||
                                                                        "Product Image"
                                                                    }
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        stock.productName
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Màu:{" "}
                                                                    {
                                                                        stock.colorName
                                                                    }{" "}
                                                                    • Tồn kho:{" "}
                                                                    {
                                                                        stock.quantity
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                {stock.price.toLocaleString()}{" "}
                                                                VND
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {stock.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : productSearchTerm ? (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    Không tìm thấy sản phẩm nào
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    Nhập tên sản phẩm để tìm
                                                    kiếm
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* User Search Dialog */}
                            <Dialog
                                open={showUserSearch}
                                onOpenChange={setShowUserSearch}
                            >
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Tìm kiếm người dùng
                                        </DialogTitle>
                                        <DialogDescription>
                                            Tìm kiếm người dùng để chọn làm
                                            người nhận đơn hàng
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Tìm theo tên, email hoặc số điện thoại"
                                                value={userSearchTerm}
                                                onChange={(e) =>
                                                    setUserSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        searchUsers(
                                                            userSearchTerm
                                                        );
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    searchUsers(userSearchTerm)
                                                }
                                                disabled={
                                                    loadingUsers ||
                                                    !userSearchTerm.trim()
                                                }
                                            >
                                                {loadingUsers ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-blue-600"></div>
                                                ) : (
                                                    <Search className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>

                                        {!userSearchTerm && (
                                            <div className="text-center py-4 text-gray-500">
                                                Nhập từ khóa để tìm kiếm người
                                                dùng
                                            </div>
                                        )}

                                        {availableUsers.length > 0 && (
                                            <div className="max-h-60 overflow-y-auto space-y-2">
                                                {availableUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-foreground/5"
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user
                                                            );
                                                            setShowUserSearch(
                                                                false
                                                            );
                                                            setUserSearchTerm(
                                                                ""
                                                            );
                                                            setAvailableUsers(
                                                                []
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        user.firstName
                                                                    }{" "}
                                                                    {
                                                                        user.lastName
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {user.email}
                                                                </div>
                                                                {user.phone && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {
                                                                            user.phone
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Chọn
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {userSearchTerm &&
                                            availableUsers.length === 0 &&
                                            !loadingUsers && (
                                                <div className="text-center py-4 text-gray-500">
                                                    Không tìm thấy người dùng
                                                    nào
                                                </div>
                                            )}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Order Items List */}
                            {orderItems.length > 0 ? (
                                <div className="space-y-2">
                                    {orderItems.map((item) => (
                                        <div
                                            key={item.stockId}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {item.productName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Màu: {item.colorName} •
                                                        ID: {item.stockId}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateOrderItemQuantity(
                                                                item.stockId,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateOrderItemQuantity(
                                                                item.stockId,
                                                                item.quantity +
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <div className="text-right min-w-20">
                                                    <div className="font-medium">
                                                        {(
                                                            item.total || 0
                                                        ).toLocaleString()}{" "}
                                                        VND
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {(
                                                            item.price || 0
                                                        ).toLocaleString()}{" "}
                                                        VND/sp
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeOrderItem(
                                                            item.stockId
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Chưa có sản phẩm nào trong đơn hàng
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                {orderItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Tổng kết đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{subtotal.toLocaleString()} VND</span>
                                </div>
                                {productDiscountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá sản phẩm:</span>
                                        <span>
                                            -
                                            {productDiscountAmount.toLocaleString()}{" "}
                                            VND
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển:</span>
                                    <span>
                                        {shippingFee.toLocaleString()} VND
                                    </span>
                                </div>
                                {shippingDiscountAmount > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Giảm phí vận chuyển:</span>
                                        <span>
                                            -
                                            {shippingDiscountAmount.toLocaleString()}{" "}
                                            VND
                                        </span>
                                    </div>
                                )}
                                {totalDiscountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tổng tiết kiệm:</span>
                                        <span>
                                            -
                                            {totalDiscountAmount.toLocaleString()}{" "}
                                            VND
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span>
                                        {totalAmount.toLocaleString()} VND
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/orders")}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || orderItems.length === 0}
                        className="min-w-32"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Tạo đơn hàng
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrderPage;
