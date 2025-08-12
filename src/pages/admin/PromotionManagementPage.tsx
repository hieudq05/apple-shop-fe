import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon,
    FunnelIcon,
    GiftIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import promotionService, {
    type CreatePromotionData,
    type Promotion,
    type PromotionParams,
    type PromotionSearchParams,
} from "../../services/promotionService";
import { useDebounce } from "../../hooks/useDebounce";
import { Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { Helmet } from "react-helmet-async";

interface PromotionForm {
    name: string;
    code: string;
    promotionType: "PERCENTAGE" | "FIXED_AMOUNT" | "SHIPPING_DISCOUNT";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(6);
    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
        null
    );
    const [formData, setFormData] = useState<PromotionForm>({
        name: "",
        code: "",
        promotionType: "PERCENTAGE",
        value: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        startDate: "",
        endDate: "",
        isActive: true,
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
        promotionName: "",
        isDeleting: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchFilters, setSearchFilters] = useState<PromotionSearchParams>(
        {}
    );
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Reset to first page when search changes
        setCurrentPage(0);
    }, [debouncedSearchTerm]);

    const fetchPromotions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if we have advanced search filters
            const hasFilters = Object.keys(searchFilters).some(
                (key) =>
                    searchFilters[key as keyof PromotionSearchParams] !==
                        undefined &&
                    searchFilters[key as keyof PromotionSearchParams] !== ""
            );

            if (hasFilters || !debouncedSearchTerm) {
                // Use advanced search API
                const searchParams: PromotionSearchParams = {
                    ...searchFilters,
                    page: currentPage,
                    size: pageSize,
                };

                if (debouncedSearchTerm) {
                    searchParams.keyword = debouncedSearchTerm;
                }

                const response = await promotionService.searchPromotions(
                    searchParams
                );
                if (response.success) {
                    setPromotions(response.data || []);
                    setTotalPages(response.meta?.totalPage || 0);
                    setTotalElements(response.meta?.totalElements || 0);
                }
            } else {
                // Use simple search API (fallback)
                const params: PromotionParams = {
                    page: currentPage,
                    size: pageSize,
                };

                if (debouncedSearchTerm) params.search = debouncedSearchTerm;

                const response = await promotionService.getPromotions(params);
                if (response.success) {
                    setPromotions(response.data || []);
                    setTotalPages(response.meta?.totalPage || 0);
                    setTotalElements(response.meta?.totalElements || 0);
                }
            }
        } catch (error) {
            console.error("Error fetching promotions:", error);
            setError("Không thể tải danh sách khuyến mãi. Vui lòng thử lại.");
            setPromotions([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearchTerm, searchFilters]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleAdvancedSearch = (filters: PromotionSearchParams) => {
        setSearchFilters(filters);
        setCurrentPage(0);

        // Check if there are active filters
        const hasFilters = Object.keys(filters).some(
            (key) =>
                filters[key as keyof PromotionSearchParams] !== undefined &&
                filters[key as keyof PromotionSearchParams] !== ""
        );
        setHasActiveFilters(hasFilters);
    };

    const clearAdvancedSearch = () => {
        setSearchFilters({});
        setHasActiveFilters(false);
        setCurrentPage(0);
    };

    const generateCode = (name: string) => {
        return name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 10);
    };

    const handleNameChange = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            name,
            code: generateCode(name),
        }));
    };

    const openCreateForm = () => {
        setEditingPromotion(null);
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        setFormData({
            name: "",
            code: "",
            promotionType: "PERCENTAGE",
            value: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            usageLimit: 0,
            startDate: today.toISOString().split("T")[0],
            endDate: nextMonth.toISOString().split("T")[0],
            isActive: true,
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
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            isActive: promotion.isActive,
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

        const loadingToast = editingPromotion
            ? toast.loading("Đang cập nhật khuyến mãi...", {
                  duration: Infinity,
              })
            : toast.loading("Đang tạo khuyến mãi mới...", {
                  duration: Infinity,
              });

        try {
            const submitData: CreatePromotionData = {
                name: formData.name,
                code: formData.code,
                promotionType: formData.promotionType,
                value: formData.value,
                minOrderValue: formData.minOrderValue || undefined,
                maxDiscountAmount: formData.maxDiscountAmount || undefined,
                usageLimit: formData.usageLimit,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isActive: formData.isActive,
            };

            if (editingPromotion) {
                const response = await promotionService.updatePromotion(
                    editingPromotion.id,
                    submitData
                );
                if (response.success) {
                    // Update local state with the form data
                    const updatedPromotion = {
                        ...editingPromotion,
                        ...submitData,
                    };
                    setPromotions((prev) =>
                        prev.map((promotion) =>
                            promotion.id === editingPromotion.id
                                ? { ...updatedPromotion }
                                : promotion
                        )
                    );
                    toast.dismiss(loadingToast);
                    toast.success("Cập nhật khuyến mãi thành công");
                }
            } else {
                const response = await promotionService.createPromotion(
                    submitData
                );
                if (response.success) {
                    // Add new promotion to local state
                    if (response.data) {
                        setPromotions((prev) => [
                            response.data as Promotion,
                            ...prev,
                        ]);
                    }
                    // Update total elements count
                    setTotalElements((prev) => prev + 1);
                    toast.dismiss(loadingToast);
                    toast.success("Tạo khuyến mãi mới thành công");
                }
            }

            closeForm();
        } catch (error) {
            console.error("Error saving promotion:", error);
            toast.dismiss(loadingToast);
            toast.error("Không thể lưu khuyến mãi. Vui lòng thử lại.");
            setError("Không thể lưu khuyến mãi. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (promotionId: number, promotionName: string) => {
        setDeleteDialog({
            isOpen: true,
            promotionId,
            promotionName,
            isDeleting: false,
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            promotionId: null,
            promotionName: "",
            isDeleting: false,
        });
    };

    const handleDeletePromotion = async () => {
        if (!deleteDialog.promotionId) return;

        setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
        const loadingToast = toast.loading("Đang xóa khuyến mãi...", {
            duration: Infinity,
        });

        try {
            const response = await promotionService.deletePromotion(
                deleteDialog.promotionId
            );

            if (response.success) {
                // Remove deleted promotion from local state
                setPromotions((prev) =>
                    prev.filter(
                        (promotion) => promotion.id !== deleteDialog.promotionId
                    )
                );
                // Update total elements count
                setTotalElements((prev) => prev - 1);
                closeDeleteDialog();
                toast.dismiss(loadingToast);
                toast.success("Xóa khuyến mãi thành công");
            }
        } catch (error) {
            console.error("Error deleting promotion:", error);
            toast.dismiss(loadingToast);
            toast.error("Không thể xóa khuyến mãi. Vui lòng thử lại.");
            setError("Không thể xóa khuyến mãi. Vui lòng thử lại.");
            setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    const togglePromotionStatus = async (
        promotionId: number,
        currentStatus: boolean
    ) => {
        const loadingToast = toast.loading("Đang cập nhật trạng thái...", {
            duration: Infinity,
        });

        try {
            const response = await promotionService.togglePromotionStatus(
                promotionId,
                !currentStatus
            );

            if (response.success) {
                // Update local state instead of refetching
                setPromotions((prev) =>
                    prev.map((promotion) =>
                        promotion.id === promotionId
                            ? { ...promotion, isActive: !currentStatus }
                            : promotion
                    )
                );
                toast.dismiss(loadingToast);
                toast.success("Cập nhật trạng thái thành công");
            }
        } catch (error) {
            console.error("Error toggling promotion status:", error);
            toast.dismiss(loadingToast);
            toast.error(
                "Không thể thay đổi trạng thái khuyến mãi. Vui lòng thử lại."
            );
            setError(
                "Không thể thay đổi trạng thái khuyến mãi. Vui lòng thử lại."
            );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const [clickedCopy, setClickedCopy] = useState<number | null>(null);

    const getTypeText = (type: Promotion["promotionType"]) => {
        switch (type) {
            case "PERCENTAGE":
                return "Phần trăm";
            case "FIXED_AMOUNT":
                return "Số tiền cố định";
            case "SHIPPING_DISCOUNT":
                return "Miễn phí vận chuyển";
            default:
                return type;
        }
    };

    const getTypeColor = (type: Promotion["promotionType"]) => {
        switch (type) {
            case "PERCENTAGE":
                return "bg-blue-500/10 text-blue-500";
            case "FIXED_AMOUNT":
                return "bg-green-500/10 text-green-500";
            case "SHIPPING_DISCOUNT":
                return "bg-purple-500/10 text-purple-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const getValueDisplay = (promotion: Promotion) => {
        switch (promotion.promotionType) {
            case "PERCENTAGE":
                return `${promotion.value}%`;
            case "FIXED_AMOUNT":
                return formatCurrency(promotion.value);
            case "SHIPPING_DISCOUNT":
                return "Miễn phí";
            default:
                return promotion.value.toString();
        }
    };

    const isPromotionExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
    };

    const filteredPromotions = promotions.filter(
        (promotion) =>
            promotion?.name
                ?.toLowerCase()
                .includes(searchTerm?.toLowerCase()) ||
            promotion?.code?.toLowerCase().includes(searchTerm?.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-foreground/5 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-foreground/5 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Helmet>
                <title>Quản lý khuyến mãi - Apple</title>
                <meta
                    name="description"
                    content="Quản lý các chương trình khuyến mãi và mã giảm giá cho cửa hàng."
                />
            </Helmet>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Quản lý khuyến mãi
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý các chương trình khuyến mãi và mã giảm giá
                    </p>
                </div>
                <Button onClick={openCreateForm} className="flex items-center">
                    <PlusIcon className="w-4 h-4" />
                    <span>Thêm khuyến mãi</span>
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-foreground/3 border border-destructive rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm khuyến mãi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <Button
                    onClick={() => setShowAdvancedSearch(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                >
                    <FunnelIcon className="w-4 h-4" />
                    <span>Bộ lọc</span>
                    {hasActiveFilters && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Đang lọc
                        </span>
                    )}
                </Button>
                {hasActiveFilters && (
                    <Button
                        onClick={clearAdvancedSearch}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>

            {/* Promotions Table */}
            <div className="bg-foreground/3 rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-background divide-y divide-foreground/5">
                        <thead className="bg-foreground/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Khuyến mãi
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Mã code
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Giá trị
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Sử dụng
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Người tạo
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-foreground">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {filteredPromotions.map((promotion) => (
                                <tr
                                    key={promotion.id}
                                    className="hover:bg-foreground/3 h-16"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <GiftIcon className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {promotion.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    ID: {promotion.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-sm"
                                        >
                                            {promotion.code}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        promotion.code
                                                    );
                                                    setClickedCopy(
                                                        promotion.id
                                                    );
                                                    setTimeout(
                                                        () =>
                                                            setClickedCopy(
                                                                null
                                                            ),
                                                        2000
                                                    );
                                                }}
                                                className="ml-1 p-1 rounded-sm hover:bg-gray-200 size-fit"
                                            >
                                                {clickedCopy ===
                                                promotion.id ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getTypeColor(
                                                promotion.promotionType
                                            )}`}
                                        >
                                            {getTypeText(
                                                promotion.promotionType
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                        <div>
                                            <div className="font-medium">
                                                {getValueDisplay(promotion)}
                                            </div>
                                            {promotion.minOrderValue &&
                                                promotion.minOrderValue > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Tối thiểu:{" "}
                                                        {formatCurrency(
                                                            promotion.minOrderValue
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                        <div>
                                            <div className="font-medium">
                                                {promotion.usageCount}
                                            </div>
                                            {promotion.usageLimit > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    / {promotion.usageLimit}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                            {/*<CalendarIcon className="w-4 h-4" />*/}
                                            <div>
                                                <div>
                                                    Từ{" "}
                                                    <span className="font-medium text-foreground">
                                                        {formatDate(
                                                            promotion.startDate
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    đến{" "}
                                                    <span className="font-medium text-foreground">
                                                        {formatDate(
                                                            promotion.endDate
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-foreground">
                                                {promotion.createdBy.firstName}{" "}
                                                {promotion.createdBy.lastName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={promotion.isActive}
                                                    onChange={() =>
                                                        togglePromotionStatus(
                                                            promotion.id,
                                                            promotion.isActive
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                            {isPromotionExpired(
                                                promotion.endDate
                                            ) && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-destructive/10 text-destructive"
                                                >
                                                    Đã hết hạn
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <EllipsisVerticalIcon className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEditForm(
                                                                promotion
                                                            )
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                promotion.id,
                                                                promotion.name
                                                            )
                                                        }
                                                        className="text-destructive focus:text-destructive flex items-center gap-2"
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-destructive" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {promotions.length > 0 && (
                    <div className="bg-background px-6 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Hiển thị{" "}
                            <span className="font-medium">
                                {currentPage * pageSize + 1}
                            </span>{" "}
                            đến{" "}
                            <span className="font-medium">
                                {Math.min(
                                    (currentPage + 1) * pageSize,
                                    totalElements
                                )}
                            </span>{" "}
                            trong{" "}
                            <span className="font-medium">{totalElements}</span>{" "}
                            kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(Math.max(0, currentPage - 1))
                                }
                                disabled={currentPage === 0}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map(
                                    (_, i) => {
                                        const pageNum = i;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(pageNum)
                                                }
                                                className="w-8 h-8"
                                            >
                                                {pageNum + 1}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(
                                            totalPages - 1,
                                            currentPage + 1
                                        )
                                    )
                                }
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
            <Dialog
                open={showForm}
                onOpenChange={(open) => !open && closeForm()}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPromotion
                                ? "Chỉnh sửa khuyến mãi"
                                : "Thêm khuyến mãi mới"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Tên khuyến mãi *
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    className="w-full"
                                    placeholder="Giảm giá 10%"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Mã code *
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            code: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    className="w-full"
                                    placeholder="DISCOUNT10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Loại khuyến mãi *
                                </label>
                                <Select
                                    required={true}
                                    value={formData.promotionType}
                                    onValueChange={(value) => {
                                        // @ts-ignore
                                        setFormData((prev) => ({
                                            ...prev,
                                            promotionType: value,
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">
                                            Phần trăm
                                        </SelectItem>
                                        <SelectItem value="FIXED_AMOUNT">
                                            Số tiền cố định
                                        </SelectItem>
                                        <SelectItem value="SHIPPING_DISCOUNT">
                                            Miễn phí vận chuyển
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block text-sm text-muted-foreground mb-1">
                                    Giá trị{" "}
                                    {formData.promotionType === "PERCENTAGE"
                                        ? "(%)"
                                        : formData.promotionType ===
                                          "FIXED_AMOUNT"
                                        ? "(VND)"
                                        : ""}
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={
                                        formData.promotionType === "PERCENTAGE"
                                            ? 100
                                            : undefined
                                    }
                                    value={formData.value}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            value:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Đơn hàng tối thiểu (VND)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.minOrderValue}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            minOrderValue:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Giảm tối đa (VND)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            maxDiscountAmount:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full"
                                    disabled={
                                        formData.promotionType ===
                                            "FIXED_AMOUNT" ||
                                        formData.promotionType ===
                                            "SHIPPING_DISCOUNT"
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Giới hạn sử dụng
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.usageLimit}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            usageLimit:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full"
                                    placeholder="0 = không giới hạn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Ngày bắt đầu *
                                </label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    Ngày kết thúc *
                                </label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                                className="size-4 mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                                htmlFor="isActive"
                                className="text-sm text-muted-foreground"
                            >
                                Kích hoạt khuyến mãi
                            </label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={closeForm}
                                variant="outline"
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving
                                    ? "Đang lưu..."
                                    : editingPromotion
                                    ? "Cập nhật"
                                    : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => !open && closeDeleteDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa khuyến mãi</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa khuyến mãi "
                            {deleteDialog.promotionName}"? Hành động này không
                            thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeDeleteDialog}
                            disabled={deleteDialog.isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePromotion}
                            disabled={deleteDialog.isDeleting}
                        >
                            {deleteDialog.isDeleting ? "Đang xóa..." : "Xóa"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Advanced Search Dialog */}
            <Dialog
                open={showAdvancedSearch}
                onOpenChange={setShowAdvancedSearch}
            >
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bộ lọc nâng cao</DialogTitle>
                        <DialogDescription>
                            Sử dụng các tiêu chí dưới đây để tìm kiếm khuyến mãi
                        </DialogDescription>
                    </DialogHeader>

                    <AdvancedSearchForm
                        initialFilters={searchFilters}
                        onSearch={handleAdvancedSearch}
                        onClose={() => setShowAdvancedSearch(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Advanced Search Form Component
const AdvancedSearchForm: React.FC<{
    initialFilters: PromotionSearchParams;
    onSearch: (filters: PromotionSearchParams) => void;
    onClose: () => void;
}> = ({ initialFilters, onSearch, onClose }) => {
    const [filters, setFilters] =
        useState<PromotionSearchParams>(initialFilters);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(filters);
        onClose();
    };

    const clearFilters = () => {
        setFilters({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Từ khóa
                    </label>
                    <input
                        type="text"
                        value={filters.keyword || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                keyword: e.target.value,
                            }))
                        }
                        placeholder="Tìm theo tên hoặc mã"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID
                    </label>
                    <input
                        type="number"
                        value={filters.id || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                id: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                            }))
                        }
                        placeholder="ID khuyến mãi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã chính xác
                    </label>
                    <input
                        type="text"
                        value={filters.code || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                code: e.target.value,
                            }))
                        }
                        placeholder="Mã khuyến mãi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại khuyến mãi
                    </label>
                    <select
                        value={filters.promotionType || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                promotionType: e.target.value as
                                    | "PERCENTAGE"
                                    | "FIXED_AMOUNT"
                                    | "SHIPPING_DISCOUNT"
                                    | undefined,
                            }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="PERCENTAGE">Phần trăm</option>
                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                        <option value="SHIPPING_DISCOUNT">
                            Miễn phí vận chuyển
                        </option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                    </label>
                    <select
                        value={
                            filters.isActive !== undefined
                                ? filters.isActive.toString()
                                : ""
                        }
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                isActive:
                                    e.target.value === ""
                                        ? undefined
                                        : e.target.value === "true",
                            }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Đang hoạt động</option>
                        <option value="false">Không hoạt động</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Áp dụng cụ thể
                    </label>
                    <select
                        value={
                            filters.applyOn !== undefined
                                ? filters.applyOn.toString()
                                : ""
                        }
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                applyOn:
                                    e.target.value === ""
                                        ? undefined
                                        : e.target.value === "true",
                            }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Có áp dụng cụ thể</option>
                        <option value="false">Không áp dụng cụ thể</option>
                    </select>
                </div>
            </div>

            {/* Date Ranges */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày bắt đầu từ
                        </label>
                        <input
                            type="datetime-local"
                            value={filters.startDateFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    startDateFrom: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày bắt đầu đến
                        </label>
                        <input
                            type="datetime-local"
                            value={filters.startDateTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    startDateTo: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc từ
                        </label>
                        <input
                            type="datetime-local"
                            value={filters.endDateFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    endDateFrom: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc đến
                        </label>
                        <input
                            type="datetime-local"
                            value={filters.endDateTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    endDateTo: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Value Ranges */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Giá trị</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị từ
                        </label>
                        <input
                            type="number"
                            value={filters.valueFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    valueFrom: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giá trị tối thiểu"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị đến
                        </label>
                        <input
                            type="number"
                            value={filters.valueTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    valueTo: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giá trị tối đa"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn hàng tối thiểu từ
                        </label>
                        <input
                            type="number"
                            value={filters.minOrderValueFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    minOrderValueFrom: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giá trị đơn hàng tối thiểu"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn hàng tối thiểu đến
                        </label>
                        <input
                            type="number"
                            value={filters.minOrderValueTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    minOrderValueTo: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giá trị đơn hàng tối đa"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Sử dụng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới hạn từ
                        </label>
                        <input
                            type="number"
                            value={filters.usageLimitFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    usageLimitFrom: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giới hạn sử dụng tối thiểu"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới hạn đến
                        </label>
                        <input
                            type="number"
                            value={filters.usageLimitTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    usageLimitTo: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Giới hạn sử dụng tối đa"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đã sử dụng từ
                        </label>
                        <input
                            type="number"
                            value={filters.usageCountFrom || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    usageCountFrom: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Số lần sử dụng tối thiểu"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đã sử dụng đến
                        </label>
                        <input
                            type="number"
                            value={filters.usageCountTo || ""}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    usageCountTo: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="Số lần sử dụng tối đa"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="space-x-2">
                <Button type="button" variant="outline" onClick={clearFilters}>
                    Xóa bộ lọc
                </Button>
                <Button type="button" variant="ghost" onClick={onClose}>
                    Hủy
                </Button>
                <Button type="submit">Áp dụng bộ lọc</Button>
            </DialogFooter>
        </form>
    );
};

export default PromotionManagementPage;
