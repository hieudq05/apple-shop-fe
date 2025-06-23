import React, {useState, useEffect} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon, ArrowLeftIcon, ArrowRightIcon, EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import {Menu} from "@headlessui/react";
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import adminProductService, {type AdminProduct, type AdminProductsParams} from '../../services/adminProductService';

// Extended product interface to match the actual API response
interface ExtendedProduct extends Omit<AdminProduct, 'stocks'> {
    createdBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    updatedBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    stocks: Array<{
        id: number;
        color: {
            id: number;
            name: string;
            hexCode: string;
        };
        quantity: number;
        price: number;
        productPhotos?: Array<{
            id: number;
            imageUrl: string;
            alt?: string;
        }>;
        instanceProperties?: Array<{
            id: number;
            name: string;
            value: string;
        }>;
    }>;
}
import type {MetadataResponse} from "../../types/api.ts";

const AdminProductsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [metadata, setMetadata] = useState<MetadataResponse>({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPage: 0
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        productId: number | null;
        productName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        productId: null,
        productName: '',
        isDeleting: false
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const { data: productsData, isLoading, isError: isErrorProducts } = useQuery({
        queryKey: ['adminProducts', metadata.currentPage, debouncedSearchTerm, selectedCategory],
        queryFn: async () => {
            const params: AdminProductsParams = {
                page: metadata.currentPage,
                size: metadata.pageSize,
                search: debouncedSearchTerm || undefined,
                categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
            };
            const response = await adminProductService.getAdminProducts(params);
            if (response.success && response.data) {
                return {
                    products: response.data as unknown as ExtendedProduct[],
                    meta: response.meta || {
                        currentPage: 0,
                        pageSize: response.data.length,
                        totalElements: response.data.length,
                        totalPage: 1,
                    },
                };
            }
            throw new Error(response.message || 'Failed to fetch products');
        },
        placeholderData: (previousData) => previousData,
    });

    const products = productsData?.products || [];
    const currentMetadata = productsData?.meta || {
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPage: 0,
    };

    const openDeleteDialog = (productId: number, productName: string) => {
        setDeleteDialog({
            isOpen: true,
            productId,
            productName,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            productId: null,
            productName: '',
            isDeleting: false
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (productId: number) => adminProductService.deleteProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            closeDeleteDialog();
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            setDeleteDialog(prev => ({...prev, isDeleting: false}));
        }
    });

    const handleDeleteProduct = () => {
        if (deleteDialog.productId) {
            deleteMutation.mutate(deleteDialog.productId);
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

    const getMinPrice = (stocks: ExtendedProduct['stocks']) => {
        if (!stocks || stocks.length === 0) return 0;
        return Math.min(...stocks.map(s => s.price));
    };

    const getTotalStock = (stocks: ExtendedProduct['stocks']) => {
        if (!stocks || stocks.length === 0) return 0;
        return stocks.reduce((total, stock) => total + stock.quantity, 0);
    };

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

    if (isErrorProducts) {
        return (
            <div className="p-6 text-center text-red-500">
                Đã có lỗi xảy ra khi tải danh sách sản phẩm.
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                    <Link
                        to="/admin/products/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2"/>
                        Thêm sản phẩm
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="1">iPhone</option>
                            <option value="2">Mac</option>
                            <option value="3">iPad</option>
                            <option value="4">Apple Watch</option>
                            <option value="5">AirPods</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-black">
                                Sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-black">
                                Danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-black">
                                Giá
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-black">
                                Tồn kho
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-black">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-medium text-black">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            {product.description?.substring(0, 50)}
                                            {product.description && product.description.length > 50 ? '...' : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.category?.name || 'Không có danh mục'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {formatCurrency(getMinPrice(product.stocks))}
                                    </div>
                                    {product.stocks && product.stocks.length > 1 && (
                                        <div className="text-xs text-gray-500">
                                            {product.stocks.length} phiên bản
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                getTotalStock(product.stocks) > 20
                                                    ? 'bg-green-100 text-green-800'
                                                    : getTotalStock(product.stocks) > 5
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}>
                                            {getTotalStock(product.stocks)} sản phẩm
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatDate(product.createdAt)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        bởi {product.createdBy?.firstName} {product.createdBy?.lastName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <div>
                                            <Menu.Button
                                                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true"/>
                                            </Menu.Button>
                                        </div>
                                        <Menu.Items
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({active}) => (
                                                        <Link
                                                            to={`/admin/products/${product.category.id}/${product.id}`}
                                                            className={`${
                                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                            } group flex items-center px-4 py-2 text-sm`}
                                                        >
                                                            <EyeIcon
                                                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                aria-hidden="true"/>
                                                            Xem chi tiết
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({active}) => (
                                                        <Link
                                                            to={`/admin/products/${product.id}/edit`}
                                                            className={`${
                                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                            } group flex items-center px-4 py-2 text-sm`}
                                                        >
                                                            <PencilIcon
                                                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                aria-hidden="true"/>
                                                            Chỉnh sửa
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({active}) => (
                                                        <button
                                                            onClick={() => openDeleteDialog(product.id, product.name)}
                                                            className={`${
                                                                active ? 'bg-gray-100 text-red-900' : 'text-red-700'
                                                            } group flex items-center px-4 py-2 text-sm w-full`}
                                                        >
                                                            <TrashIcon
                                                                className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500"
                                                                aria-hidden="true"/>
                                                            Xóa
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Menu>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setMetadata(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
                            disabled={currentMetadata.currentPage === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setMetadata(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, currentMetadata.totalPage - 1) }))}
                            disabled={currentMetadata.currentPage === currentMetadata.totalPage - 1}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{currentMetadata.totalElements === 0 ? 0 : currentMetadata.currentPage * currentMetadata.pageSize + 1}</span> - <span className="font-medium">{Math.min((currentMetadata.currentPage + 1) * currentMetadata.pageSize, currentMetadata.totalElements)}</span> trong{' '}
                                <span className="font-medium">{currentMetadata.totalElements}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md -space-x-px">
                                <button
                                    onClick={() => setMetadata(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
                                    disabled={currentMetadata.currentPage === 0}
                                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ArrowLeftIcon className={"size-[0.8rem]"}/>
                                </button>
                                <div className={"flex gap-1 px-3"}>
                                    {[...Array(currentMetadata.totalPage)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMetadata(prev => ({ ...prev, currentPage: i }))}
                                            className={`relative inline-flex items-center p-0 text-sm font-medium ${
                                                currentMetadata.currentPage === i
                                                    ? 'text-black'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setMetadata(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, currentMetadata.totalPage - 1) }))}
                                    disabled={currentMetadata.currentPage === currentMetadata.totalPage - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ArrowRightIcon className={"size-[0.8rem]"}/>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteProduct}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteDialog.productName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                isLoading={deleteDialog.isDeleting}
            />
        </div>
    );
};

export default AdminProductsPage;
