import React, {useEffect, useState} from 'react';
import {
    BellIcon,
    CameraIcon,
    CheckIcon,
    CurrencyDollarIcon,
    PencilIcon,
    ShieldCheckIcon,
    TruckIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {useToast} from "@/hooks/use-toast";
import userService, {type MyInfo, type UpdateMyInfoData} from "@/services/userService";
import {format} from "date-fns";
import {vi} from "date-fns/locale";
import {AlertCircleIcon, Calendar as CalendarIcon} from "lucide-react";

interface Settings {
    notifications: {
        emailNotifications: boolean;
        orderNotifications: boolean;
        lowStockAlerts: boolean;
        customerRegistration: boolean;
    };
    payment: {
        enableCOD: boolean;
        enableBankTransfer: boolean;
        enableVNPay: boolean;
        enableMomo: boolean;
        taxRate: number;
    };
    shipping: {
        freeShippingThreshold: number;
        standardShippingFee: number;
        expressShippingFee: number;
        processingTime: number;
    };
    security: {
        requireEmailVerification: boolean;
        enableTwoFactor: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
    };
}

interface ErrorField {
    field: string;
    message: string;
}

const AdminSettingsPage: React.FC = () => {
    const { toast } = useToast();
    const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        birth: ''
    });
    const [selectedBirthDate, setSelectedBirthDate] = useState<Date | undefined>(undefined);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const [errors, setErrors] = useState<ErrorField[]>();

    const [settings, setSettings] = useState<Settings>({
        notifications: {
            emailNotifications: true,
            orderNotifications: true,
            lowStockAlerts: true,
            customerRegistration: false,
        },
        payment: {
            enableCOD: true,
            enableBankTransfer: true,
            enableVNPay: false,
            enableMomo: false,
            taxRate: 10,
        },
        shipping: {
            freeShippingThreshold: 500000,
            standardShippingFee: 30000,
            expressShippingFee: 50000,
            processingTime: 2,
        },
        security: {
            requireEmailVerification: true,
            enableTwoFactor: false,
            sessionTimeout: 30,
            maxLoginAttempts: 3,
        },
    });

    // Fetch admin profile info
    const fetchMyInfo = async () => {
        try {
            const response = await userService.getMe();
            if (response.success) {
                setMyInfo(response.data);
                setProfileForm({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phone: response.data.phone || '',
                    birth: response.data.birth || ''
                });
                // Set birth date for calendar
                if (response.data.birth) {
                    setSelectedBirthDate(new Date(response.data.birth));
                }
            }
        } catch (error) {
            console.error("Error fetching admin info:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin profile",
                variant: "destructive",
            });
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Clear previous errors
        setErrors([]);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file ảnh",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Lỗi",
                description: "Kích thước ảnh không được vượt quá 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsLoadingAvatar(true);
        try {
            const response = await userService.uploadAvatar(file);
            if (response.success && myInfo) {
                setMyInfo({
                    ...myInfo,
                    image: response.data.imageUrl
                });
                toast({
                    title: "Thành công",
                    description: "Cập nhật ảnh đại diện thành công",
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: response.message || "Không thể cập nhật ảnh đại diện",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error uploading avatar:", error);

            // Handle backend validation errors
            if (error?.response?.data?.error?.errors && Array.isArray(error.response.data.error.errors)) {
                const backendErrors = error.response.data.error.errors.map((err: any) => ({
                    field: err.field || 'avatar',
                    message: err.message || 'Lỗi không xác định'
                }));
                setErrors(backendErrors);
            }

            // Show error message
            const errorMessage = error?.response?.data?.error?.message ||
                               error?.response?.data?.message ||
                               "Có lỗi xảy ra khi cập nhật ảnh đại diện";

            toast({
                title: "Lỗi",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoadingAvatar(false);
        }
    };

    // Update admin profile
    const handleUpdateProfile = async () => {
        if (!myInfo) return;

        // Clear previous errors
        setErrors([]);
        setIsLoadingProfile(true);

        try {
            const updateData: UpdateMyInfoData = {
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone,
                birth: selectedBirthDate ? selectedBirthDate.toISOString().split('T')[0] : ''
            };

            const response = await userService.updateMyInfo(updateData);
            if (response.success) {
                setMyInfo({
                    ...myInfo,
                    ...updateData
                });
                setProfileForm({
                    ...profileForm,
                    birth: updateData.birth || ''
                });
                setIsEditingProfile(false);
                toast({
                    title: "Thành công",
                    description: "Cập nhật thông tin profile thành công",
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: response.message || "Không thể cập nhật thông tin",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);

            // Handle backend validation errors
            if (error?.response?.data?.error?.errors && Array.isArray(error.response.data.error.errors)) {
                const backendErrors = error.response.data.error.errors.map((err: any) => ({
                    field: err.field || 'unknown',
                    message: err.message || 'Lỗi không xác định'
                }));
                setErrors(backendErrors);
            }

            // Show error message
            const errorMessage = error?.response?.data?.error?.message ||
                               error?.response?.data?.message ||
                               "Có lỗi xảy ra khi cập nhật thông tin";

            toast({
                title: "Lỗi",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        // Clear errors when canceling edit
        setErrors([]);

        if (myInfo) {
            setProfileForm({
                firstName: myInfo.firstName || '',
                lastName: myInfo.lastName || '',
                phone: myInfo.phone || '',
                birth: myInfo.birth || ''
            });
            if (myInfo.birth) {
                setSelectedBirthDate(new Date(myInfo.birth));
            } else {
                setSelectedBirthDate(undefined);
            }
        }
        setIsEditingProfile(false);
    };

    const updateNotificationSetting = (key: keyof Settings['notifications'], value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }));
    };

    const updatePaymentSetting = (key: keyof Settings['payment'], value: boolean | number) => {
        setSettings(prev => ({
            ...prev,
            payment: {
                ...prev.payment,
                [key]: value
            }
        }));
    };

    const updateShippingSetting = (key: keyof Settings['shipping'], value: number) => {
        setSettings(prev => ({
            ...prev,
            shipping: {
                ...prev.shipping,
                [key]: value
            }
        }));
    };

    const updateSecuritySetting = (key: keyof Settings['security'], value: boolean | number) => {
        setSettings(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [key]: value
            }
        }));
    };

    useEffect(() => {
        fetchMyInfo();
    }, []);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h2>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Profile Admin
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <BellIcon className="h-4 w-4" />
                        Thông báo
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Thanh toán
                    </TabsTrigger>
                    <TabsTrigger value="shipping" className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4" />
                        Vận chuyển
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4" />
                        Bảo mật
                    </TabsTrigger>
                </TabsList>

                {/* Profile Admin Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Thông tin Profile Admin
                                <Button
                                    variant={isEditingProfile ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditingProfile) {
                                            handleCancelEdit();
                                        } else {
                                            setIsEditingProfile(true);
                                        }
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    {isEditingProfile ? "Hủy" : "Chỉnh sửa"}
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Quản lý thông tin cá nhân của admin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Error Message */}
                            {errors && errors.length > 0 && (
                                <div className="flex justify-between space-x-2 bg-foreground/5 p-4 border rounded-2xl">
                                    <AlertCircleIcon className="h-4 w-4 text-destructive mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-destructive">
                                            Có lỗi xảy ra khi cập nhật thông tin
                                        </p>
                                        <ul className="mt-2 space-y-2 text-sm list-decimal text-foreground list-inside">
                                            {errors.map((err) => (
                                                <li key={err.field}>
                                                    {err.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {myInfo && (
                                <>
                                    {/* Avatar Section */}
                                    <div className={"flex transition duration-500 overflow-hidden items-center space-x-4 transform " + (!isEditingProfile ? "scale-100 h-fit" : "scale-0 h-0")}>
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={myInfo.image || undefined} />
                                            <AvatarFallback className="text-lg">
                                                {myInfo.firstName?.[0]}{myInfo.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                {myInfo.firstName} {myInfo.lastName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {myInfo.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                ID: {myInfo.id}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Profile Form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Họ</Label>
                                            <Input
                                                id="firstName"
                                                value={profileForm.firstName}
                                                onChange={(e) => {
                                                    setProfileForm(prev => ({
                                                        ...prev,
                                                        firstName: e.target.value
                                                    }))
                                                    setErrors([]);
                                                }}
                                                disabled={!isEditingProfile}
                                                placeholder="Nhập họ"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Tên</Label>
                                            <Input
                                                id="lastName"
                                                value={profileForm.lastName}
                                                onChange={(e) => {
                                                    setProfileForm(prev => ({
                                                        ...prev,
                                                        lastName: e.target.value
                                                    }))
                                                    setErrors([]);
                                                }}
                                                disabled={!isEditingProfile}
                                                placeholder="Nhập tên"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={myInfo.email}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Số điện thoại</Label>
                                            <Input
                                                id="phone"
                                                value={profileForm.phone}
                                                onChange={(e) => {
                                                    setProfileForm(prev => ({
                                                        ...prev,
                                                        phone: e.target.value
                                                    }))
                                                    setErrors([]);
                                                }}
                                                disabled={!isEditingProfile}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="birth">Ngày sinh</Label>
                                            <Popover>
                                                <PopoverTrigger>
                                                    <Button
                                                        variant={isEditingProfile ? "default" : "outline"}
                                                        disabled={!isEditingProfile}
                                                        className="w-full justify-start text-left"
                                                    >
                                                        {selectedBirthDate ? format(selectedBirthDate, 'dd/MM/yyyy', { locale: vi }) : "Chọn ngày sinh"}
                                                        <CalendarIcon className="ml-auto h-5 w-5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-4">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedBirthDate}
                                                        onSelect={(date) => setSelectedBirthDate(date)}
                                                        initialFocus
                                                        locale={vi}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Avatar Upload */}
                                    {isEditingProfile && (
                                        <div className="space-y-2">
                                            <Label htmlFor="avatar">Ảnh đại diện</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage src={myInfo.image || undefined} />
                                                    <AvatarFallback className="text-lg">
                                                        {myInfo.firstName?.[0]}{myInfo.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    variant={"outline"}
                                                    className={"relative"}
                                                >
                                                    <CameraIcon className="h-4 w-4" />
                                                    <span className="ml-2">Tải lên</span>
                                                    <Input
                                                        type={"file"}
                                                        id="avatar"
                                                        accept="image/*"
                                                        onChange={handleAvatarUpload}
                                                        disabled={isLoadingAvatar}
                                                        className="flex-1 opacity-0 absolute top-0 left-0"
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {isEditingProfile && (
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                onClick={handleUpdateProfile}
                                                disabled={isLoadingProfile}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                                {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                disabled={isLoadingProfile}
                                            >
                                                Hủy
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thông báo</CardTitle>
                            <CardDescription>
                                Quản lý các loại thông báo hệ thống
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận thông báo quan trọng qua email
                                    </p>
                                </div>
                                <Switch
                                    id="emailNotifications"
                                    checked={settings.notifications.emailNotifications}
                                    onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="orderNotifications">Thông báo đơn hàng</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo khi có đơn hàng mới
                                    </p>
                                </div>
                                <Switch
                                    id="orderNotifications"
                                    checked={settings.notifications.orderNotifications}
                                    onCheckedChange={(checked) => updateNotificationSetting('orderNotifications', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lowStockAlerts">Cảnh báo hết hàng</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo khi sản phẩm sắp hết hàng
                                    </p>
                                </div>
                                <Switch
                                    id="lowStockAlerts"
                                    checked={settings.notifications.lowStockAlerts}
                                    onCheckedChange={(checked) => updateNotificationSetting('lowStockAlerts', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="customerRegistration">Đăng ký khách hàng mới</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo khi có khách hàng đăng ký mới
                                    </p>
                                </div>
                                <Switch
                                    id="customerRegistration"
                                    checked={settings.notifications.customerRegistration}
                                    onCheckedChange={(checked) => updateNotificationSetting('customerRegistration', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thanh toán</CardTitle>
                            <CardDescription>
                                Cấu hình các phương thức thanh toán
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableCOD">Thanh toán khi nhận hàng (COD)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cho phép khách hàng thanh toán khi nhận hàng
                                    </p>
                                </div>
                                <Switch
                                    id="enableCOD"
                                    checked={settings.payment.enableCOD}
                                    onCheckedChange={(checked) => updatePaymentSetting('enableCOD', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableBankTransfer">Chuyển khoản ngân hàng</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thanh toán qua chuyển khoản ngân hàng
                                    </p>
                                </div>
                                <Switch
                                    id="enableBankTransfer"
                                    checked={settings.payment.enableBankTransfer}
                                    onCheckedChange={(checked) => updatePaymentSetting('enableBankTransfer', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableVNPay">VNPay</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thanh toán qua VNPay
                                    </p>
                                </div>
                                <Switch
                                    id="enableVNPay"
                                    checked={settings.payment.enableVNPay}
                                    onCheckedChange={(checked) => updatePaymentSetting('enableVNPay', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableMomo">MoMo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thanh toán qua ví điện tử MoMo
                                    </p>
                                </div>
                                <Switch
                                    id="enableMomo"
                                    checked={settings.payment.enableMomo}
                                    onCheckedChange={(checked) => updatePaymentSetting('enableMomo', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Thuế VAT (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    value={settings.payment.taxRate}
                                    onChange={(e) => updatePaymentSetting('taxRate', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt vận chuyển</CardTitle>
                            <CardDescription>
                                Cấu hình phí và chính sách vận chuyển
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="freeShippingThreshold">Miễn phí vận chuyển từ (VNĐ)</Label>
                                <Input
                                    id="freeShippingThreshold"
                                    type="number"
                                    value={settings.shipping.freeShippingThreshold}
                                    onChange={(e) => updateShippingSetting('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="standardShippingFee">Phí vận chuyển tiêu chuẩn (VNĐ)</Label>
                                <Input
                                    id="standardShippingFee"
                                    type="number"
                                    value={settings.shipping.standardShippingFee}
                                    onChange={(e) => updateShippingSetting('standardShippingFee', parseFloat(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expressShippingFee">Phí vận chuyển nhanh (VNĐ)</Label>
                                <Input
                                    id="expressShippingFee"
                                    type="number"
                                    value={settings.shipping.expressShippingFee}
                                    onChange={(e) => updateShippingSetting('expressShippingFee', parseFloat(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="processingTime">Thời gian xử lý đơn hàng (ngày)</Label>
                                <Input
                                    id="processingTime"
                                    type="number"
                                    value={settings.shipping.processingTime}
                                    onChange={(e) => updateShippingSetting('processingTime', parseInt(e.target.value) || 0)}
                                    min="1"
                                    max="30"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt bảo mật</CardTitle>
                            <CardDescription>
                                Cấu hình các tính năng bảo mật hệ thống
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="requireEmailVerification">Xác thực email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Yêu cầu xác thực email khi đăng ký
                                    </p>
                                </div>
                                <Switch
                                    id="requireEmailVerification"
                                    checked={settings.security.requireEmailVerification}
                                    onCheckedChange={(checked) => updateSecuritySetting('requireEmailVerification', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableTwoFactor">Xác thực 2 bước</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Bật xác thực 2 bước cho admin
                                    </p>
                                </div>
                                <Switch
                                    id="enableTwoFactor"
                                    checked={settings.security.enableTwoFactor}
                                    onCheckedChange={(checked) => updateSecuritySetting('enableTwoFactor', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value) || 0)}
                                    min="5"
                                    max="1440"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
                                <Input
                                    id="maxLoginAttempts"
                                    type="number"
                                    value={settings.security.maxLoginAttempts}
                                    onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value) || 0)}
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettingsPage;
