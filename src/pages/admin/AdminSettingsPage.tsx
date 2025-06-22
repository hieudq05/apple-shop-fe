import React, { useState } from 'react';
import { 
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    TruckIcon,
    EnvelopeIcon,
    CheckIcon
} from "@heroicons/react/24/outline";

interface Settings {
    general: {
        siteName: string;
        siteDescription: string;
        contactEmail: string;
        contactPhone: string;
        address: string;
    };
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

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        general: {
            siteName: "Apple Shop Vietnam",
            siteDescription: "Cửa hàng Apple chính hãng tại Việt Nam",
            contactEmail: "support@appleshop.vn",
            contactPhone: "1900-1234",
            address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
        },
        notifications: {
            emailNotifications: true,
            orderNotifications: true,
            lowStockAlerts: true,
            customerRegistration: false
        },
        payment: {
            enableCOD: true,
            enableBankTransfer: true,
            enableVNPay: true,
            enableMomo: false,
            taxRate: 10
        },
        shipping: {
            freeShippingThreshold: 5000000,
            standardShippingFee: 30000,
            expressShippingFee: 50000,
            processingTime: 24
        },
        security: {
            requireEmailVerification: true,
            enableTwoFactor: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5
        }
    });

    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const tabs = [
        { id: 'general', name: 'Tổng quan', icon: Cog6ToothIcon },
        { id: 'notifications', name: 'Thông báo', icon: BellIcon },
        { id: 'payment', name: 'Thanh toán', icon: CurrencyDollarIcon },
        { id: 'shipping', name: 'Vận chuyển', icon: TruckIcon },
        { id: 'security', name: 'Bảo mật', icon: ShieldCheckIcon },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Cài đặt đã được lưu thành công!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Có lỗi xảy ra khi lưu cài đặt!');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSettings = (section: keyof Settings, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <p className="mt-2 text-gray-600">Quản lý các cài đặt và cấu hình của cửa hàng</p>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                    saveMessage.includes('thành công') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    {saveMessage}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <tab.icon className={`mr-3 h-5 w-5 ${
                                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                                }`} />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Thông tin chung</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên cửa hàng
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.general.siteName}
                                            onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email liên hệ
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.general.contactEmail}
                                            onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            value={settings.general.contactPhone}
                                            onChange={(e) => updateSettings('general', 'contactPhone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.general.address}
                                            onChange={(e) => updateSettings('general', 'address', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả cửa hàng
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={settings.general.siteDescription}
                                        onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Cài đặt thông báo</h3>
                                
                                <div className="space-y-4">
                                    {Object.entries(settings.notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {key === 'emailNotifications' && 'Thông báo email'}
                                                    {key === 'orderNotifications' && 'Thông báo đơn hàng mới'}
                                                    {key === 'lowStockAlerts' && 'Cảnh báo hết hàng'}
                                                    {key === 'customerRegistration' && 'Thông báo khách hàng mới'}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {key === 'emailNotifications' && 'Nhận thông báo qua email'}
                                                    {key === 'orderNotifications' && 'Thông báo khi có đơn hàng mới'}
                                                    {key === 'lowStockAlerts' && 'Cảnh báo khi sản phẩm sắp hết'}
                                                    {key === 'customerRegistration' && 'Thông báo khi có khách hàng đăng ký'}
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Settings */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Cài đặt thanh toán</h3>
                                
                                <div className="space-y-4">
                                    <h4 className="text-md font-medium text-gray-800">Phương thức thanh toán</h4>
                                    {Object.entries(settings.payment).filter(([key]) => key.startsWith('enable')).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-900">
                                                    {key === 'enableCOD' && 'Thanh toán khi nhận hàng (COD)'}
                                                    {key === 'enableBankTransfer' && 'Chuyển khoản ngân hàng'}
                                                    {key === 'enableVNPay' && 'VNPay'}
                                                    {key === 'enableMomo' && 'MoMo'}
                                                </h5>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => updateSettings('payment', key, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thuế VAT (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settings.payment.taxRate}
                                            onChange={(e) => updateSettings('payment', 'taxRate', parseFloat(e.target.value))}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Settings */}
                        {activeTab === 'shipping' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Cài đặt vận chuyển</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Miễn phí vận chuyển từ
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.shipping.freeShippingThreshold}
                                            onChange={(e) => updateSettings('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hiện tại: {formatCurrency(settings.shipping.freeShippingThreshold)}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phí vận chuyển tiêu chuẩn
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.shipping.standardShippingFee}
                                            onChange={(e) => updateSettings('shipping', 'standardShippingFee', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hiện tại: {formatCurrency(settings.shipping.standardShippingFee)}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phí vận chuyển nhanh
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.shipping.expressShippingFee}
                                            onChange={(e) => updateSettings('shipping', 'expressShippingFee', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hiện tại: {formatCurrency(settings.shipping.expressShippingFee)}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thời gian xử lý (giờ)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.shipping.processingTime}
                                            onChange={(e) => updateSettings('shipping', 'processingTime', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Cài đặt bảo mật</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Xác thực email bắt buộc</h4>
                                            <p className="text-sm text-gray-500">Yêu cầu xác thực email khi đăng ký</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.security.requireEmailVerification}
                                                onChange={(e) => updateSettings('security', 'requireEmailVerification', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Xác thực 2 yếu tố</h4>
                                            <p className="text-sm text-gray-500">Bật xác thực 2 yếu tố cho admin</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.security.enableTwoFactor}
                                                onChange={(e) => updateSettings('security', 'enableTwoFactor', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thời gian hết hạn phiên (phút)
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="1440"
                                                value={settings.security.sessionTimeout}
                                                onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số lần đăng nhập sai tối đa
                                            </label>
                                            <input
                                                type="number"
                                                min="3"
                                                max="10"
                                                value={settings.security.maxLoginAttempts}
                                                onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
