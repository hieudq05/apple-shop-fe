import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import AdminService from '../../services/adminService';
import type {
  ProductCreateRequest,
  ProductStock,
  ProductFeature,
  ProductPhoto,
  ProductInstanceProperty
} from '../../types/admin';

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    description: '',
    createdBy: 'admin@test.com', // This should come from auth context
    category: {
      id: null,
      name: '',
      image: ''
    },
    features: [],
    stocks: []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      category: {
        ...prev.category,
        [field]: value
      }
    }));
  };

  const addFeature = () => {
    const newFeature: ProductFeature = {
      id: null,
      name: '',
      description: '',
      image: ''
    };
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addStock = () => {
    const newStock: ProductStock = {
      color: {
        id: null,
        name: '',
        hexCode: '#000000'
      },
      quantity: 0,
      price: 0,
      productPhotos: [],
      instanceProperties: []
    };
    setFormData(prev => ({
      ...prev,
      stocks: [...prev.stocks, newStock]
    }));
  };

  const updateStock = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === index ? { ...stock, [field]: value } : stock
      )
    }));
  };

  const updateStockColor = (stockIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? { 
          ...stock, 
          color: { ...stock.color, [field]: value }
        } : stock
      )
    }));
  };

  const addStockPhoto = (stockIndex: number) => {
    const newPhoto: ProductPhoto = {
      imageUrl: '',
      alt: ''
    };
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          productPhotos: [...stock.productPhotos, newPhoto]
        } : stock
      )
    }));
  };

  const updateStockPhoto = (stockIndex: number, photoIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          productPhotos: stock.productPhotos.map((photo, j) =>
            j === photoIndex ? { ...photo, [field]: value } : photo
          )
        } : stock
      )
    }));
  };

  const removeStockPhoto = (stockIndex: number, photoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          productPhotos: stock.productPhotos.filter((_, j) => j !== photoIndex)
        } : stock
      )
    }));
  };

  const addInstanceProperty = (stockIndex: number) => {
    const newProperty: ProductInstanceProperty = {
      id: null,
      name: ''
    };
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          instanceProperties: [...stock.instanceProperties, newProperty]
        } : stock
      )
    }));
  };

  const updateInstanceProperty = (stockIndex: number, propIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          instanceProperties: stock.instanceProperties.map((prop, j) =>
            j === propIndex ? { ...prop, name: value } : prop
          )
        } : stock
      )
    }));
  };

  const removeInstanceProperty = (stockIndex: number, propIndex: number) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === stockIndex ? {
          ...stock,
          instanceProperties: stock.instanceProperties.filter((_, j) => j !== propIndex)
        } : stock
      )
    }));
  };

  const removeStock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Submitting product data:', formData);

      const response = await AdminService.createProductJSON(formData);
      
      if (response.success) {
        console.log('✅ Product created successfully:', response.data);
        navigate('/admin/products');
      } else {
        setError(response.message || 'Không thể tạo sản phẩm');
      }
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
            <p className="text-gray-600 mt-1">Tạo sản phẩm mới cho cửa hàng</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục *
              </label>
              <input
                type="text"
                required
                value={formData.category.name}
                onChange={(e) => handleCategoryChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên danh mục"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả sản phẩm *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL hình ảnh danh mục
            </label>
            <input
              type="url"
              value={formData.category.image}
              onChange={(e) => handleCategoryChange('image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tính năng sản phẩm</h2>
            <button
              type="button"
              onClick={addFeature}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm tính năng
            </button>
          </div>
          
          {formData.features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Tính năng {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tính năng
                  </label>
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên tính năng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={feature.image}
                    onChange={(e) => updateFeature(index, 'image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả tính năng
                </label>
                <textarea
                  rows={3}
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mô tả tính năng"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stocks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kho hàng và biến thể</h2>
            <button
              type="button"
              onClick={addStock}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm biến thể
            </button>
          </div>

          {formData.stocks.map((stock, stockIndex) => (
            <div key={stockIndex} className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Biến thể {stockIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeStock(stockIndex)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Color and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên màu
                  </label>
                  <input
                    type="text"
                    value={stock.color.name}
                    onChange={(e) => updateStockColor(stockIndex, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên màu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã màu
                  </label>
                  <input
                    type="color"
                    value={stock.color.hexCode}
                    onChange={(e) => updateStockColor(stockIndex, 'hexCode', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock.quantity}
                    onChange={(e) => updateStock(stockIndex, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock.price}
                    onChange={(e) => updateStock(stockIndex, 'price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Product Photos */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hình ảnh sản phẩm
                  </label>
                  <button
                    type="button"
                    onClick={() => addStockPhoto(stockIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PhotoIcon className="h-4 w-4" />
                    Thêm ảnh
                  </button>
                </div>
                {stock.productPhotos.map((photo, photoIndex) => (
                  <div key={photoIndex} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={photo.imageUrl}
                      onChange={(e) => updateStockPhoto(stockIndex, photoIndex, 'imageUrl', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="URL hình ảnh"
                    />
                    <input
                      type="text"
                      value={photo.alt}
                      onChange={(e) => updateStockPhoto(stockIndex, photoIndex, 'alt', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả ảnh"
                    />
                    <button
                      type="button"
                      onClick={() => removeStockPhoto(stockIndex, photoIndex)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Instance Properties */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Thuộc tính riêng
                  </label>
                  <button
                    type="button"
                    onClick={() => addInstanceProperty(stockIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Thêm thuộc tính
                  </button>
                </div>
                {stock.instanceProperties.map((property, propIndex) => (
                  <div key={propIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={property.name}
                      onChange={(e) => updateInstanceProperty(stockIndex, propIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tên thuộc tính"
                    />
                    <button
                      type="button"
                      onClick={() => removeInstanceProperty(stockIndex, propIndex)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;
