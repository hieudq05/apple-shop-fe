import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PlusIcon, 
    XMarkIcon, 
    PhotoIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import type { CreateProductRequest } from '../../types/api';

interface ProductForm extends Omit<CreateProductRequest, 'categoryId'> {
    categoryId: string;
}

const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        title: '',
        description: '',
        categoryId: '',
        features: [],
        stocks: [],
        instanceProperties: []
    });

    const categories = [
        { id: '1', name: 'iPhone' },
        { id: '2', name: 'Mac' },
        { id: '3', name: 'iPad' },
        { id: '4', name: 'Apple Watch' },
        { id: '5', name: 'AirPods' },
        { id: '6', name: 'Phụ kiện' }
    ];

    const colors = [
        { id: 1, name: 'Natural Titanium', hex: '#8E8E93' },
        { id: 2, name: 'Blue Titanium', hex: '#5E7CE2' },
        { id: 3, name: 'White Titanium', hex: '#F5F5F7' },
        { id: 4, name: 'Black Titanium', hex: '#1D1D1F' },
        { id: 5, name: 'Space Gray', hex: '#5C5C5C' },
        { id: 6, name: 'Silver', hex: '#E3E3E3' },
        { id: 7, name: 'Gold', hex: '#FCEBD3' },
        { id: 8, name: 'Rose Gold', hex: '#E8B5CE' }
    ];

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, { name: '', value: '' }]
        }));
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const updateFeature = (index: number, field: 'name' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) => 
                i === index ? { ...feature, [field]: value } : feature
            )
        }));
    };

    const addStock = () => {
        setFormData(prev => ({
            ...prev,
            stocks: [...prev.stocks, { colorId: 0, quantity: 0, price: 0, photos: [] }]
        }));
    };

    const removeStock = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stocks: prev.stocks.filter((_, i) => i !== index)
        }));
    };

    const updateStock = (index: number, field: keyof typeof formData.stocks[0], value: any) => {
        setFormData(prev => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) => 
                i === index ? { ...stock, [field]: value } : stock
            )
        }));
    };

    const addProperty = () => {
        setFormData(prev => ({
            ...prev,
            instanceProperties: [...prev.instanceProperties, { name: '', value: '' }]
        }));
    };

    const removeProperty = (index: number) => {
        setFormData(prev => ({
            ...prev,
            instanceProperties: prev.instanceProperties.filter((_, i) => i !== index)
        }));
    };

    const updateProperty = (index: number, field: 'name' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            instanceProperties: prev.instanceProperties.map((prop, i) => 
                i === index ? { ...prop, [field]: value } : prop
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Convert categoryId to number
            const productData: CreateProductRequest = {
                ...formData,
                categoryId: parseInt(formData.categoryId)
            };

            // Replace with actual API call
            console.log('Creating product:', productData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Sản phẩm đã được tạo thành công!');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Có lỗi xảy ra khi tạo sản phẩm!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="iPhone 15 Pro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiêu đề *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="iPhone 15 Pro. Titan mạnh mẽ. Camera tiên tiến."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Mô tả chi tiết về sản phẩm..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Tính năng</h2>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Thêm tính năng
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Tên tính năng"
                                            value={feature.name}
                                            onChange={(e) => updateFeature(index, 'name', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Giá trị"
                                            value={feature.value}
                                            onChange={(e) => updateFeature(index, 'value', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {formData.features.length === 0 && (
                                    <p className="text-gray-500 text-sm">Chưa có tính năng nào. Nhấn "Thêm tính năng" để bắt đầu.</p>
                                )}
                            </div>
                        </div>

                        {/* Stocks */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Kho hàng</h2>
                                <button
                                    type="button"
                                    onClick={addStock}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Thêm màu sắc
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.stocks.map((stock, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">Màu sắc #{index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeStock(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Màu sắc
                                                </label>
                                                <select
                                                    value={stock.colorId}
                                                    onChange={(e) => updateStock(index, 'colorId', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={0}>Chọn màu</option>
                                                    {colors.map(color => (
                                                        <option key={color.id} value={color.id}>
                                                            {color.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Số lượng
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stock.quantity}
                                                    onChange={(e) => updateStock(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Giá (VND)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stock.price}
                                                    onChange={(e) => updateStock(index, 'price', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hình ảnh (URLs)
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="Nhập URLs hình ảnh, mỗi URL một dòng"
                                                value={stock.photos.join('\n')}
                                                onChange={(e) => updateStock(index, 'photos', e.target.value.split('\n').filter(url => url.trim()))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {formData.stocks.length === 0 && (
                                    <p className="text-gray-500 text-sm">Chưa có màu sắc nào. Nhấn "Thêm màu sắc" để bắt đầu.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instance Properties */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Thuộc tính</h2>
                                <button
                                    type="button"
                                    onClick={addProperty}
                                    className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-3 h-3 mr-1" />
                                    Thêm
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.instanceProperties.map((property, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Tên thuộc tính"
                                                value={property.name}
                                                onChange={(e) => updateProperty(index, 'name', e.target.value)}
                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeProperty(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Giá trị"
                                            value={property.value}
                                            onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                ))}
                                {formData.instanceProperties.length === 0 && (
                                    <p className="text-gray-500 text-xs">Chưa có thuộc tính nào.</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isLoading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateProductPage;
