import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    GiftIcon,
    CalendarIcon,
    PercentBadgeIcon
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Promotion {
    id: number;
    name: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface PromotionForm {
    name: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    description: string;
}

const PromotionManagementPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState<PromotionForm>({
        name: '',
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        description: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        promotionId: number | null;
        promotionName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        promotionId: null,
        promotionName: '',
        isDeleting: false
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock data
            const mockPromotions: Promotion[] = [
                {
                    id: 1,
                    name: 'Giảm giá 10% cho đơn hàng đầu tiên',
                    code: 'FIRST10',
                    type: 'PERCENTAGE',
                    value: 10,
                    minOrderAmount: 1000000,
                    maxDiscountAmount: 500000,
                    usageLimit: 100,
                    usedCount: 25,
                    startDate: '2024-01-01T00:00:00Z',
                    endDate: '2024-12-31T23:59:59Z',
                    isActive: true,
                    description: 'Khuyến mãi dành cho khách hàng mới',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: 2,
                    name: 'Miễn phí vận chuyển',
                    code: 'FREESHIP',
                    type: 'FREE_SHIPPING',
                    value: 0,
                    minOrderAmount: 2000000,
                    usageLimit: 500,
                    usedCount: 156,
                    startDate: '2024-01-01T00:00:00Z',
                    endDate: '2024-06-30T23:59:59Z',
                    isActive: true,
                    description: 'Miễn phí vận chuyển cho đơn hàng từ 2 triệu',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-10T09:15:00Z'
                },
                {
                    id: 3,
                    name: 'Giảm 500K cho iPhone',
                    code: 'IPHONE500',
                    type: 'FIXED_AMOUNT',
                    value: 500000,
                    minOrderAmount: 20000000,
                    usageLimit: 50,
                    usedCount: 12,
                    startDate: '2024-02-01T00:00:00Z',
                    endDate: '2024-02-29T23:59:59Z',
                    isActive: false,
                    description: 'Khuyến mãi đặc biệt cho iPhone',
                    createdAt: '2024-01-25T00:00:00Z',
                    updatedAt: '2024-02-01T14:20:00Z'
                }
            ];

            setPromotions(mockPromotions);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateCode = (name: string) => {
        return name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 10);
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            code: generateCode(name)
        }));
    };

    const openCreateForm = () => {
        setEditingPromotion(null);
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        setFormData({
            name: '',
            code: '',
            type: 'PERCENTAGE',
            value: 0,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            usageLimit: 0,
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            isActive: true,
            description: ''
        });
        setShowForm(true);
    };

    const openEditForm = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            name: promotion.name,
            code: promotion.code,
            type: promotion.type,
            value: promotion.value,
            minOrderAmount: promotion.minOrderAmount || 0,
            maxDiscountAmount: promotion.maxDiscountAmount || 0,
            usageLimit: promotion.usageLimit || 0,
            startDate: promotion.startDate.split('T')[0],
            endDate: promotion.endDate.split('T')[0],
            isActive: promotion.isActive,
            description: promotion.description || ''
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingPromotion(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Replace with actual API call
            console.log(editingPromotion ? 'Updating promotion:' : 'Creating promotion:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingPromotion) {
                // Update existing promotion
                setPromotions(prev => prev.map(promo =>
                    promo.id === editingPromotion.id
                        ? {
                            ...promo,
                            ...formData,
                            startDate: formData.startDate + 'T00:00:00Z',
                            endDate: formData.endDate + 'T23:59:59Z',
                            updatedAt: new Date().toISOString()
                        }
                        : promo
                ));
            } else {
                // Create new promotion
                const newPromotion: Promotion = {
                    id: Date.now(),
                    ...formData,
                    startDate: formData.startDate + 'T00:00:00Z',
                    endDate: formData.endDate + 'T23:59:59Z',
                    usedCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setPromotions(prev => [newPromotion, ...prev]);
            }

            closeForm();
        } catch (error) {
            console.error('Error saving promotion:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (promotionId: number, promotionName: string) => {
        setDeleteDialog({
            isOpen: true,
            promotionId,
            promotionName,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            promotionId: null,
            promotionName: '',
            isDeleting: false
        });
    };

    const handleDeletePromotion = async () => {
        if (!deleteDialog.promotionId) return;

        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

        try {
            // Replace with actual API call
            console.log('Deleting promotion:', deleteDialog.promotionId);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setPromotions(prev => prev.filter(promo => promo.id !== deleteDialog.promotionId));
            closeDeleteDialog();
        } catch (error) {
            console.error('Error deleting promotion:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const togglePromotionStatus = async (promotionId: number, currentStatus: boolean) => {
        try {
            // Replace with actual API call
            console.log('Toggling promotion status:', promotionId, !currentStatus);
            await new Promise(resolve => setTimeout(resolve, 500));

            setPromotions(prev => prev.map(promo =>
                promo.id === promotionId
                    ? { ...promo, isActive: !currentStatus, updatedAt: new Date().toISOString() }
                    : promo
            ));
        } catch (error) {
            console.error('Error toggling promotion status:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getTypeText = (type: Promotion['type']) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'Phần trăm';
            case 'FIXED_AMOUNT':
                return 'Số tiền cố định';
            case 'FREE_SHIPPING':
                return 'Miễn phí vận chuyển';
            default:
                return type;
        }
    };

    const getTypeColor = (type: Promotion['type']) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'bg-blue-100 text-blue-800';
            case 'FIXED_AMOUNT':
                return 'bg-green-100 text-green-800';
            case 'FREE_SHIPPING':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getValueDisplay = (promotion: Promotion) => {
        switch (promotion.type) {
            case 'PERCENTAGE':
                return `${promotion.value}%`;
            case 'FIXED_AMOUNT':
                return formatCurrency(promotion.value);
            case 'FREE_SHIPPING':
                return 'Miễn phí';
            default:
                return promotion.value.toString();
        }
    };

    const isPromotionExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
    };

    const filteredPromotions = promotions.filter(promotion =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                <button
                    onClick={openCreateForm}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Thêm khuyến mãi
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khuyến mãi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khuyến mãi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá trị
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sử dụng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPromotions.map((promotion) => (
                                <tr key={promotion.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <GiftIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {promotion.name}
                                                </div>
                                                {promotion.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {promotion.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">
                                            {promotion.code}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(promotion.type)}`}>
                                            {getTypeText(promotion.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">{getValueDisplay(promotion)}</div>
                                            {promotion.minOrderAmount > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    Tối thiểu: {formatCurrency(promotion.minOrderAmount)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            <div>{promotion.usedCount}</div>
                                            {promotion.usageLimit > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    / {promotion.usageLimit}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            <div>
                                                <div>{formatDate(promotion.startDate)}</div>
                                                <div>đến {formatDate(promotion.endDate)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={promotion.isActive}
                                                    onChange={() => togglePromotionStatus(promotion.id, promotion.isActive)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                            {isPromotionExpired(promotion.endDate) && (
                                                <span className="text-xs text-red-600">Đã hết hạn</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditForm(promotion)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog(promotion.id, promotion.name)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeForm} />
                        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tên khuyến mãi *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Giảm giá 10%"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mã code *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.code}
                                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                                placeholder="DISCOUNT10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loại khuyến mãi *
                                            </label>
                                            <select
                                                required
                                                value={formData.type}
                                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PromotionForm['type'] }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="PERCENTAGE">Phần trăm (%)</option>
                                                <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giá trị {formData.type === 'PERCENTAGE' ? '(%)' : formData.type === 'FIXED_AMOUNT' ? '(VND)' : ''}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                                                value={formData.value}
                                                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={formData.type === 'FREE_SHIPPING'}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Đơn hàng tối thiểu (VND)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.minOrderAmount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giảm tối đa (VND)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.maxDiscountAmount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={formData.type === 'FIXED_AMOUNT' || formData.type === 'FREE_SHIPPING'}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giới hạn sử dụng
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.usageLimit}
                                                onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="0 = không giới hạn"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngày bắt đầu *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngày kết thúc *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.endDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Mô tả về khuyến mãi..."
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm text-gray-700">
                                            Kích hoạt khuyến mãi
                                        </label>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeForm}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? 'Đang lưu...' : (editingPromotion ? 'Cập nhật' : 'Tạo mới')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDeletePromotion}
                title="Xóa khuyến mãi"
                message={`Bạn có chắc chắn muốn xóa khuyến mãi "${deleteDialog.promotionName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                isLoading={deleteDialog.isDeleting}
            />
        </div>
    );
};

export default PromotionManagementPage;