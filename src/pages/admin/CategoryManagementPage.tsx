import React, { useState, useEffect } from 'react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    MagnifyingGlassIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    productCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CategoryForm {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
}

const CategoryManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryForm>({
        name: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        categoryId: number | null;
        categoryName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        categoryId: null,
        categoryName: '',
        isDeleting: false
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockCategories: Category[] = [
                {
                    id: 1,
                    name: 'iPhone',
                    slug: 'iphone',
                    description: 'Điện thoại thông minh iPhone',
                    productCount: 25,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: 2,
                    name: 'Mac',
                    slug: 'mac',
                    description: 'Máy tính Mac',
                    productCount: 15,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-10T09:15:00Z'
                },
                {
                    id: 3,
                    name: 'iPad',
                    slug: 'ipad',
                    description: 'Máy tính bảng iPad',
                    productCount: 12,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-12T14:20:00Z'
                },
                {
                    id: 4,
                    name: 'Apple Watch',
                    slug: 'apple-watch',
                    description: 'Đồng hồ thông minh Apple Watch',
                    productCount: 8,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-08T16:45:00Z'
                },
                {
                    id: 5,
                    name: 'AirPods',
                    slug: 'airpods',
                    description: 'Tai nghe không dây AirPods',
                    productCount: 6,
                    isActive: false,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-05T11:30:00Z'
                }
            ];
            
            setCategories(mockCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    const openCreateForm = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            isActive: true
        });
        setShowForm(true);
    };

    const openEditForm = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            isActive: category.isActive
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            isActive: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Replace with actual API call
            console.log(editingCategory ? 'Updating category:' : 'Creating category:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (editingCategory) {
                // Update existing category
                setCategories(prev => prev.map(cat => 
                    cat.id === editingCategory.id 
                        ? { 
                            ...cat, 
                            ...formData,
                            updatedAt: new Date().toISOString()
                        }
                        : cat
                ));
            } else {
                // Create new category
                const newCategory: Category = {
                    id: Date.now(),
                    ...formData,
                    productCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setCategories(prev => [newCategory, ...prev]);
            }
            
            closeForm();
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (categoryId: number, categoryName: string) => {
        setDeleteDialog({
            isOpen: true,
            categoryId,
            categoryName,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            categoryId: null,
            categoryName: '',
            isDeleting: false
        });
    };

    const handleDeleteCategory = async () => {
        if (!deleteDialog.categoryId) return;

        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

        try {
            // Replace with actual API call
            console.log('Deleting category:', deleteDialog.categoryId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setCategories(prev => prev.filter(cat => cat.id !== deleteDialog.categoryId));
            closeDeleteDialog();
        } catch (error) {
            console.error('Error deleting category:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const toggleCategoryStatus = async (categoryId: number, currentStatus: boolean) => {
        try {
            // Replace with actual API call
            console.log('Toggling category status:', categoryId, !currentStatus);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setCategories(prev => prev.map(cat => 
                cat.id === categoryId 
                    ? { ...cat, isActive: !currentStatus, updatedAt: new Date().toISOString() }
                    : cat
            ));
        } catch (error) {
            console.error('Error toggling category status:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
                <button
                    onClick={openCreateForm}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Thêm danh mục
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cập nhật
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </div>
                                                {category.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.productCount} sản phẩm
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={category.isActive}
                                                onChange={() => toggleCategoryStatus(category.id, category.isActive)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(category.updatedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditForm(category)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog(category.id, category.name)}
                                                className={`p-1 ${category.productCount > 0
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-red-600 hover:text-red-900'
                                                }`}
                                                title={category.productCount > 0 ? 'Không thể xóa danh mục có sản phẩm' : 'Xóa'}
                                                disabled={category.productCount > 0}
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
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên danh mục *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="iPhone"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="iphone"
                                        />
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
                                            placeholder="Mô tả về danh mục..."
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
                                            Kích hoạt danh mục
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
                                            {isSaving ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
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
                onConfirm={handleDeleteCategory}
                title="Xóa danh mục"
                message={`Bạn có chắc chắn muốn xóa danh mục "${deleteDialog.categoryName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                isLoading={deleteDialog.isDeleting}
            />
        </div>
    );
};

export default CategoryManagementPage;
