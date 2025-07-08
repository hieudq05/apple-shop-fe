import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    GiftIcon,
    CalendarIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import promotionService, { type Promotion, type PromotionParams, type CreatePromotionData } from '../../services/promotionService';
import { useDebounce } from '../../hooks/useDebounce';
import { Check, Copy } from 'lucide-react';

interface PromotionForm {
    name: string;
    code: string;
    promotionType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SHIPPING_DISCOUNT';
    value: number;
    minOrderValue: number;
    maxDiscountAmount: number;
    usageLimit: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const PromotionManagementPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState<PromotionForm>({
        name: '',
        code: '',
        promotionType: 'PERCENTAGE',
        value: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        isActive: true
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
    const [error, setError] = useState<string | null>(null);

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Reset to first page when search changes
        setCurrentPage(0);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchPromotions();
    }, [currentPage, debouncedSearchTerm]);

    const fetchPromotions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params: PromotionParams = {
                page: currentPage,
                size: pageSize,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;

            const response = await promotionService.getPromotions(params);
            
            if (response.success) {
                setPromotions(response.data);
                setTotalPages(response.meta.totalPage);
                setTotalElements(response.meta.totalElements);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại.');
            setPromotions([]);
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
            promotionType: 'PERCENTAGE',
            value: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            usageLimit: 0,
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            isActive: true
        });
        setShowForm(true);
    };

    const openEditForm = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            name: promotion.name,
            code: promotion.code,
            promotionType: promotion.promotionType,
            value: promotion.value,
            minOrderValue: promotion.minOrderValue || 0,
            maxDiscountAmount: promotion.maxDiscountAmount || 0,
            usageLimit: promotion.usageLimit || 0,
            startDate: promotion.startDate.split('T')[0],
            endDate: promotion.endDate.split('T')[0],
            isActive: promotion.isActive
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
            const submitData: CreatePromotionData = {
                name: formData.name,
                code: formData.code,
                promotionType: formData.promotionType,
                value: formData.value,
                minOrderValue: formData.minOrderValue || undefined,
                maxDiscountAmount: formData.maxDiscountAmount || undefined,
                usageLimit: formData.usageLimit,
                startDate: formData.startDate + 'T00:00:00',
                endDate: formData.endDate + 'T23:59:59',
                isActive: formData.isActive
            };

            if (editingPromotion) {
                const response = await promotionService.updatePromotion(editingPromotion.id, submitData);
                if (response.success) {
                    // Refresh the promotions list
                    await fetchPromotions();
                }
            } else {
                const response = await promotionService.createPromotion(submitData);
                if (response.success) {
                    // Refresh the promotions list
                    await fetchPromotions();
                }
            }

            closeForm();
        } catch (error) {
            console.error('Error saving promotion:', error);
            setError('Không thể lưu khuyến mãi. Vui lòng thử lại.');
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
            const response = await promotionService.deletePromotion(deleteDialog.promotionId);
            
            if (response.success) {
                // Refresh the promotions list
                await fetchPromotions();
                closeDeleteDialog();
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
            setError('Không thể xóa khuyến mãi. Vui lòng thử lại.');
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const togglePromotionStatus = async (promotionId: number, currentStatus: boolean) => {
        try {
            const response = await promotionService.togglePromotionStatus(promotionId, !currentStatus);
            
            if (response.success) {
                // Refresh the promotions list
                await fetchPromotions();
            }
        } catch (error) {
            console.error('Error toggling promotion status:', error);
            setError('Không thể thay đổi trạng thái khuyến mãi. Vui lòng thử lại.');
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

    const [clickedCopy, setClickedCopy] = useState<number | null>(null);

    const getTypeText = (type: Promotion['promotionType']) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'Phần trăm';
            case 'FIXED_AMOUNT':
                return 'Số tiền cố định';
            case 'SHIPPING_DISCOUNT':
                return 'Miễn phí vận chuyển';
            default:
                return type;
        }
    };

    const getTypeColor = (type: Promotion['promotionType']) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'bg-blue-100 text-blue-800';
            case 'FIXED_AMOUNT':
                return 'bg-green-100 text-green-800';
            case 'SHIPPING_DISCOUNT':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getValueDisplay = (promotion: Promotion) => {
        switch (promotion.promotionType) {
            case 'PERCENTAGE':
                return `${promotion.value}%`;
            case 'FIXED_AMOUNT':
                return formatCurrency(promotion.value);
            case 'SHIPPING_DISCOUNT':
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                    <p className="text-muted-foreground">Quản lý các chương trình khuyến mãi và mã giảm giá</p>
                </div>
                <Button onClick={openCreateForm} className="flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>Thêm khuyến mãi</span>
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
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
                                    Người tạo
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
                                <tr key={promotion.id} className="hover:bg-gray-50 h-16">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <GiftIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {promotion.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {promotion.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {promotion.code} 
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(promotion.code);
                                                    setClickedCopy(promotion.id);
                                                    setTimeout(() => setClickedCopy(null), 2000);
                                                }}
                                                className="ml-1 p-1 rounded-sm hover:bg-gray-200 size-fit"
                                            >
                                                {clickedCopy === promotion.id ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant="secondary" className={`text-xs ${getTypeColor(promotion.promotionType)}`}>
                                            {getTypeText(promotion.promotionType)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">{getValueDisplay(promotion)}</div>
                                            {promotion.minOrderValue && promotion.minOrderValue > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    Tối thiểu: {formatCurrency(promotion.minOrderValue)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">{promotion.usageCount}</div>
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
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={promotion.createdBy.image} alt={`${promotion.createdBy.firstName} ${promotion.createdBy.lastName}`} />
                                                <AvatarFallback>
                                                    <UserIcon className="h-3 w-3" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-xs text-gray-600">
                                                {promotion.createdBy.firstName} {promotion.createdBy.lastName}
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
                                                <Badge variant="destructive" className="text-xs">
                                                    Đã hết hạn
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                onClick={() => openEditForm(promotion)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteDialog(promotion.id, promotion.name)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {promotions.length > 0 && (
                    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
                            <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong{' '}
                            <span className="font-medium">{totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="w-8 h-8"
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                Sau
                                <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-lg backdrop-brightness-50 transition">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="fixed inset-0" onClick={closeForm} />
                        <div className="relative bg-white rounded-2xl border shadow-xl max-w-2xl w-full mx-auto">
                            <div className="p-12">
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
                                                value={formData.promotionType}
                                                onChange={(e) => setFormData(prev => ({ ...prev, promotionType: e.target.value as PromotionForm['promotionType'] }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="PERCENTAGE">Phần trăm (%)</option>
                                                <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                <option value="SHIPPING_DISCOUNT">Miễn phí vận chuyển</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giá trị {formData.promotionType === 'PERCENTAGE' ? '(%)' : formData.promotionType === 'FIXED_AMOUNT' ? '(VND)' : ''}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={formData.promotionType === 'PERCENTAGE' ? 100 : undefined}
                                                value={formData.value}
                                                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={formData.promotionType === 'SHIPPING_DISCOUNT'}
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
                                                value={formData.minOrderValue}
                                                onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: parseInt(e.target.value) || 0 }))}
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
                                                disabled={formData.promotionType === 'FIXED_AMOUNT' || formData.promotionType === 'SHIPPING_DISCOUNT'}
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
                                                type="datetime-local"
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
                                                type="datetime-local"
                                                required
                                                value={formData.endDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
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
                                        <Button
                                            type="button"
                                            onClick={closeForm}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1"
                                        >
                                            {isSaving ? 'Đang lưu...' : (editingPromotion ? 'Cập nhật' : 'Tạo mới')}
                                        </Button>
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
                description={`Bạn có chắc chắn muốn xóa khuyến mãi "${deleteDialog.promotionName}"? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

export default PromotionManagementPage;