import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PlusIcon, 
    XMarkIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { fetchAdminCategories, createCategory, type Category } from '../../services/categoryService';
import { fetchAdminFeatures, createFeature, type Feature } from '../../services/featureService';
import { fetchAdminColors, createColor, type Color } from '../../services/colorService';
import { fetchAdminInstances, createInstance, type Instance } from '../../services/instanceService';

interface ProductPhoto {
    imageUrl: string;
    alt: string;
}

interface InstanceProperty {
    name: string;
}

interface Stock {
    color: {
        name: string;
        hexCode: string;
    };
    quantity: number;
    price: number;
    productPhotos: ProductPhoto[];
    instanceProperties: InstanceProperty[];
}

interface ProductForm {
    name: string;
    description: string;
    category: Category;
    features: Feature[];
    stocks: Stock[];
}

interface ErrorData {
    field: string;
    message: string;
}

const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<ErrorData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState<{name: string, file: File | null}>({
        name: '',
        file: null
    });
    const [categoryLoading, setCategoryLoading] = useState(false);

    // Feature state
    const [predefinedFeatures, setPredefinedFeatures] = useState<Feature[]>([]);
    const [showCreateFeatureModal, setShowCreateFeatureModal] = useState(false);
    const [newFeature, setNewFeature] = useState<{name: string, description: string, file: File | null}>({
        name: '',
        description: '',
        file: null
    });
    const [featureLoading, setFeatureLoading] = useState(false);

    // Color state
    const [predefinedColors, setPredefinedColors] = useState<Color[]>([]);
    const [showCreateColorModal, setShowCreateColorModal] = useState(false);
    const [newColor, setNewColor] = useState<{name: string, hexCode: string}>({
        name: '',
        hexCode: ''
    });
    const [colorLoading, setColorLoading] = useState(false);

    // Instance state
    const [predefinedInstances, setPredefinedInstances] = useState<Instance[]>([]);
    const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
    const [newInstance, setNewInstance] = useState<{name: string, description: string}>({
        name: '',
        description: ''
    });
    const [instanceLoading, setInstanceLoading] = useState(false);

    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        description: '',
        category: {
            id: null,
            name: '',
            image: ''
        },
        features: [],
        stocks: []
    });
    const [featureFiles, setFeatureFiles] = useState<File[]>([]);
    const [stockPhotoFiles, setStockPhotoFiles] = useState<File[][]>([]);


    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, { name: '', description: '', image: '' }]
        }));
        setFeatureFiles(prev => [...prev, new File([], '')]);
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
        setFeatureFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateFeature = (index: number, field: keyof Feature, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleFeatureFileChange = (index: number, file: File) => {
        const newFeatureFiles = [...featureFiles];
        newFeatureFiles[index] = file;
        setFeatureFiles(newFeatureFiles);
        updateFeature(index, 'image', `placeholder_feature_${index}`);
    };

    const addStock = () => {
        setFormData(prev => ({
            ...prev,
            stocks: [...prev.stocks, { color: { name: '', hexCode: '' }, quantity: 0, price: 0, productPhotos: [], instanceProperties: [] }]
        }));
        setStockPhotoFiles(prev => [...prev, []]);
    };

    const removeStock = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stocks: prev.stocks.filter((_, i) => i !== index)
        }));
        setStockPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateStock = (stockIndex: number, field: keyof Stock, value: string | number | { name: string; hexCode: string; } | ProductPhoto[] | InstanceProperty[]) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex] = { ...newStocks[stockIndex], [field]: value };
        setFormData(prev => ({ ...prev, stocks: newStocks }));
    };

    const handleStockPhotoChange = (stockIndex: number, photoIndex: number, file: File) => {
        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex][photoIndex] = file;
        setStockPhotoFiles(newStockPhotoFiles);

        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos[photoIndex].imageUrl = `placeholder_stock_${stockIndex}_${photoIndex}`;
        setFormData(prev => ({ ...prev, stocks: newStocks }));
    };

    const addStockPhoto = (stockIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos.push({ imageUrl: '', alt: '' });
        setFormData(prev => ({ ...prev, stocks: newStocks }));

        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex].push(new File([], ''));
        setStockPhotoFiles(newStockPhotoFiles);
    };

    const removeStockPhoto = (stockIndex: number, photoIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos = newStocks[stockIndex].productPhotos.filter((_, i) => i !== photoIndex);
        setFormData(prev => ({ ...prev, stocks: newStocks }));

        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex] = newStockPhotoFiles[stockIndex].filter((_, i) => i !== photoIndex);
        setStockPhotoFiles(newStockPhotoFiles);
    };

    const addInstanceProperty = (stockIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties.push({ name: '' });
        setFormData(prev => ({ ...prev, stocks: newStocks }));
    };

    const removeInstanceProperty = (stockIndex: number, propIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties = newStocks[stockIndex].instanceProperties.filter((_, i) => i !== propIndex);
        setFormData(prev => ({ ...prev, stocks: newStocks }));
    };

    const updateInstanceProperty = (stockIndex: number, propIndex: number, name: string) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties[propIndex].name = name;
        setFormData(prev => ({ ...prev, stocks: newStocks }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic before submission
        const validationErrors: ErrorData[] = [];

        // Validate basic product information
        if (!formData.name.trim()) {
            validationErrors.push({ field: 'name', message: 'Tên sản phẩm không được để trống' });
        }

        if (!formData.description.trim()) {
            validationErrors.push({ field: 'description', message: 'Mô tả sản phẩm không được để trống' });
        }

        // Validate features
        formData.features.forEach((feature, index) => {
            if (!feature.name.trim()) {
                validationErrors.push({ field: `features[${index}].name`, message: `Tên tính năng #${index + 1} không được để trống` });
            }

            if (!feature.description.trim()) {
                validationErrors.push({ field: `features[${index}].description`, message: `Mô tả tính năng #${index + 1} không được để trống` });
            }

            // Check if feature image file exists
            if (feature.image.startsWith('placeholder_') && (!featureFiles[index] || featureFiles[index].size === 0)) {
                validationErrors.push({ field: `features[${index}].image`, message: `Ảnh tính năng #${index + 1} chưa được chọn` });
            }
        });

        // Validate stocks
        if (formData.stocks.length === 0) {
            validationErrors.push({ field: 'stocks', message: 'Sản phẩm cần có ít nhất một phiên bản màu sắc' });
        }

        formData.stocks.forEach((stock, stockIndex) => {
            if (!stock.color.name.trim()) {
                validationErrors.push({ field: `stocks[${stockIndex}].color.name`, message: `Tên màu #${stockIndex + 1} không được để trống` });
            }

            if (!stock.color.hexCode.trim()) {
                validationErrors.push({ field: `stocks[${stockIndex}].color.hexCode`, message: `Mã hex màu #${stockIndex + 1} không được để trống` });
            }

            if (stock.quantity <= 0) {
                validationErrors.push({ field: `stocks[${stockIndex}].quantity`, message: `Số lượng cho màu #${stockIndex + 1} phải lớn hơn 0` });
            }

            if (stock.price <= 0) {
                validationErrors.push({ field: `stocks[${stockIndex}].price`, message: `Giá cho màu #${stockIndex + 1} phải lớn hơn 0` });
            }

            // Validate product photos
            if (stock.productPhotos.length === 0) {
                validationErrors.push({ field: `stocks[${stockIndex}].productPhotos`, message: `Màu #${stockIndex + 1} cần có ít nhất một ảnh sản phẩm` });
            }

            stock.productPhotos.forEach((photo, photoIndex) => {
                if (photo.imageUrl.startsWith('placeholder_') &&
                    (!stockPhotoFiles[stockIndex] ||
                     !stockPhotoFiles[stockIndex][photoIndex] ||
                     stockPhotoFiles[stockIndex][photoIndex].size === 0)) {
                    validationErrors.push({
                        field: `stocks[${stockIndex}].productPhotos[${photoIndex}]`,
                        message: `Ảnh #${photoIndex + 1} của màu #${stockIndex + 1} chưa được chọn`
                    });
                }

                if (!photo.alt.trim()) {
                    validationErrors.push({
                        field: `stocks[${stockIndex}].productPhotos[${photoIndex}].alt`,
                        message: `Alt text cho ảnh #${photoIndex + 1} của màu #${stockIndex + 1} không được để trống`
                    });
                }
            });
        });

        // If validation errors exist, display them and stop submission
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            // Scroll to the top of the error section
            document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        setIsLoading(true);

        const data = new FormData();
        data.append('product', JSON.stringify({ ...formData, createdBy: 'hieuu8a@gmail.com' }));

        formData.features.forEach((feature, index) => {
            if (feature.image.startsWith('placeholder_')) {
                data.append(feature.image, featureFiles[index]);
            }
        });

        formData.stocks.forEach((stock, stockIndex) => {
            stock.productPhotos.forEach((photo, photoIndex) => {
                if (photo.imageUrl.startsWith('placeholder_')) {
                    data.append(photo.imageUrl, stockPhotoFiles[stockIndex][photoIndex]);
                }
            });
        });

        try {
            const response = await fetch('http://localhost:8080/api/v1/admin/products', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzM4NCJ9.eyJmaXJzdE5hbWUiOiJEdW9uZyBRdW9jIiwibGFzdE5hbWUiOiJIaWV1Iiwicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfQURNSU4ifV0sImltYWdlVXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0xQeTZyYWgyRWRhX3J2a3lZSDdLc1VfY1J1YjlSdkFiYnM4ZDdJdTlFNFkyVnc2ST1zNTc2LWMtbm8iLCJzdWIiOiJoaWV1dThhQGdtYWlsLmNvbSIsImlhdCI6MTc1MDYxMTQzMCwiZXhwIjoxNzUwNjk3ODMwfQ.uwilgUCH45a29Qnm3Kn5b-DytpO7jxqUrnyPwCCLcKjVbVS4k6wxf7WyFSI5B1Fg'
                },
                body: data,
            });

            if (response.ok) {
                alert('Sản phẩm đã được tạo thành công!');
                navigate('/admin/products');
            } else {
                const errorData = await response.json();
                setErrors(errorData.error.errors);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            setErrors(error.errors);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await fetchAdminCategories();
                setCategories(categoriesData);

                // Nếu có categories, đặt category đầu tiên làm mặc định
                if (categoriesData && categoriesData.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        category: categoriesData[0]
                    }));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setErrors([{ field: 'categories', message: 'Không thể tải danh mục sản phẩm' }]);
            }
        };

        loadCategories();
    }, []);

    // Fetch features, colors, and instances on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load features
                const featuresData = await fetchAdminFeatures();
                setPredefinedFeatures(featuresData);

                // Load colors
                const colorsData = await fetchAdminColors();
                setPredefinedColors(colorsData);

                // Load instances
                const instancesData = await fetchAdminInstances();
                setPredefinedInstances(instancesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrors(prev => [
                    ...prev, 
                    { field: 'dataLoading', message: 'Không thể tải dữ liệu tính năng, màu sắc hoặc phiên bản' }
                ]);
            }
        };

        loadData();
    }, []);

    // Xử lý khi người dùng chọn category từ dropdown
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategoryId = parseInt(e.target.value);

        if (selectedCategoryId === -1) {
            // Người dùng chọn "Thêm danh mục mới"
            setShowCreateCategoryModal(true);
            return;
        }

        const selectedCategory = categories.find(cat => cat.id === selectedCategoryId) || null;
        if (selectedCategory) {
            setFormData(prev => ({
                ...prev,
                category: selectedCategory
            }));
        }
    };

    // Xử lý khi người dùng thay đổi tên category mới
    const handleNewCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    // Xử lý khi người dùng chọn file ảnh cho category mới
    const handleNewCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewCategory(prev => ({
                ...prev,
                file: e.target.files![0]
            }));
        }
    };

    // Xử lý khi người dùng tạo category mới
    const handleCreateCategory = async () => {
        // Kiểm tra dữ liệu đầu vào
        if (!newCategory.name.trim() || !newCategory.file) {
            setErrors([{
                field: 'newCategory',
                message: 'Vui lòng nhập tên danh mục và chọn ảnh'
            }]);
            return;
        }

        setCategoryLoading(true);
        try {
            const createdCategory = await createCategory(
                { name: newCategory.name, id: null },
                newCategory.file
            );

            // Thêm category mới vào danh sách và chọn nó
            setCategories(prev => [...prev, createdCategory]);
            setFormData(prev => ({
                ...prev,
                category: createdCategory
            }));

            // Đóng modal và reset form
            setShowCreateCategoryModal(false);
            setNewCategory({ name: '', file: null });

            // Hiển thị thông báo thành công
            alert('Đã tạo danh mục mới thành công!');
        } catch (error) {
            console.error('Error creating category:', error);
            setErrors([{ field: 'newCategory', message: 'Không thể tạo danh mục mới' }]);
        } finally {
            setCategoryLoading(false);
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
                <div className="grid gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
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
                                        className={"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
                                        placeholder="iPhone 15 Pro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục *
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.category?.id !== undefined ? formData.category.id : ''}
                                            onChange={handleCategoryChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={categories?.length === 0}
                                        >
                                            {categories?.length === 0 ? (
                                                <option value="">Đang tải danh mục...</option>
                                            ) : (
                                                <>
                                                    {categories?.map((category) => (
                                                        <option key={category.id} value={category.id !== null ? category.id : ''}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                    <option value="-1">Thêm danh mục mới</option>
                                                </>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateCategoryModal(true)}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {formData.category.id !== null && (
                                        <div className="mt-2 flex items-center">
                                            {formData.category.image && (
                                                <img
                                                    src={formData.category.image}
                                                    alt={formData.category.name}
                                                    className="w-10 h-10 object-cover rounded mr-2"
                                                />
                                            )}
                                            <span className="text-sm text-gray-600">
                                                Danh mục đã chọn: <span className="font-semibold">{formData.category.name}</span>
                                            </span>
                                        </div>
                                    )}
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
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">Tính năng #{index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Tên tính năng"
                                                value={feature.name}
                                                onChange={(e) => updateFeature(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Mô tả"
                                                value={feature.description}
                                                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ảnh tính năng
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) => e.target.files && handleFeatureFileChange(index, e.target.files[0])}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {formData.features.length === 0 && (
                                    <p className="text-gray-500 text-sm">Chưa có tính năng nào.</p>
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
                                {formData.stocks.map((stock, stockIndex) => (
                                    <div key={stockIndex} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">Màu sắc #{stockIndex + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeStock(stockIndex)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input type="text" placeholder="Tên màu" value={stock.color.name} onChange={(e) => updateStock(stockIndex, 'color', { ...stock.color, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            <input type="text" placeholder="Mã hex" value={stock.color.hexCode} onChange={(e) => updateStock(stockIndex, 'color', { ...stock.color, hexCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            <input type="number" placeholder="Số lượng" value={stock.quantity} onChange={(e) => updateStock(stockIndex, 'quantity', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            <input type="number" placeholder="Giá" value={stock.price} onChange={(e) => updateStock(stockIndex, 'price', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                        </div>
                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</h4>
                                            {stock.productPhotos.map((photo, photoIndex) => (
                                                <div key={photoIndex} className="flex items-center gap-2 mb-2">
                                                    <input type="file" onChange={(e) => e.target.files && handleStockPhotoChange(stockIndex, photoIndex, e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                                    <input type="text" placeholder="Alt text" value={photo.alt} onChange={(e) => { const newPhotos = [...stock.productPhotos]; newPhotos[photoIndex].alt = e.target.value; updateStock(stockIndex, 'productPhotos', newPhotos); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                                    <button type="button" onClick={() => removeStockPhoto(stockIndex, photoIndex)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><XMarkIcon className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addStockPhoto(stockIndex)} className="text-sm text-blue-600 hover:underline">Thêm ảnh</button>
                                        </div>
                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Thuộc tính</h4>
                                            {stock.instanceProperties.map((prop, propIndex) => (
                                                <div key={propIndex} className="flex items-center gap-2 mb-2">
                                                    <input type="text" placeholder="Tên thuộc tính" value={prop.name} onChange={(e) => updateInstanceProperty(stockIndex, propIndex, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                                    <button type="button" onClick={() => removeInstanceProperty(stockIndex, propIndex)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><XMarkIcon className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addInstanceProperty(stockIndex)} className="text-sm text-blue-600 hover:underline">Thêm thuộc tính</button>
                                        </div>
                                    </div>
                                ))}
                                {formData.stocks.length === 0 && (
                                    <p className="text-gray-500 text-sm">Chưa có màu sắc nào.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="">
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
                    <div className={"w-full bg-red-50 border border-red-300 text-red-700 p-6 mb-5 rounded relative" + (errors?.length > 0 ? " block" : " hidden")}>
                        <div className={"text-lg font-medium"}>Vui lòng sửa các lỗi sau:</div>
                        <ul className={"list-outside list-decimal"}>
                            {
                                errors?.map((error, index) => (
                                    <li key={index} className={"mt-2 ml-7"}>
                                        <div className={"text-sm"}>{error.message}</div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </form>

            {/* Modal for creating new category */}
            {showCreateCategoryModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo danh mục mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={handleNewCategoryNameChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Điện thoại"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh danh mục *
                                </label>
                                <input
                                    type="file"
                                    onChange={handleNewCategoryFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        {/* Error message for new category creation */}
                        {errors.some(error => error.field === 'newCategory') && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {errors.find(error => error.field === 'newCategory')?.message}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateCategoryModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={categoryLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {categoryLoading ? 'Đang tạo...' : 'Tạo danh mục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for creating new feature */}
            {showCreateFeatureModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tính năng mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên tính năng *
                                </label>
                                <input
                                    type="text"
                                    value={newFeature.name}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Tính năng nổi bật"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả *
                                </label>
                                <textarea
                                    rows={3}
                                    value={newFeature.description}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Mô tả chi tiết về tính năng..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh tính năng *
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => e.target.files && setNewFeature(prev => ({ ...prev, file: e.target.files[0] }))}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        {/* Error message for new feature creation */}
                        {errors.some(error => error.field === 'newFeature') && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {errors.find(error => error.field === 'newFeature')?.message}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateFeatureModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={async () => {
                                    setFeatureLoading(true);
                                    try {
                                        const createdFeature = await createFeature(newFeature.name, newFeature.description, newFeature.file!);
                                        setPredefinedFeatures(prev => [...prev, createdFeature]);
                                        setFormData(prev => ({
                                            ...prev,
                                            features: [...prev.features, createdFeature]
                                        }));
                                        setShowCreateFeatureModal(false);
                                        setNewFeature({ name: '', description: '', file: null });
                                        alert('Tính năng đã được tạo thành công!');
                                    } catch (error) {
                                        console.error('Error creating feature:', error);
                                        setErrors([{ field: 'newFeature', message: 'Không thể tạo tính năng mới' }]);
                                    } finally {
                                        setFeatureLoading(false);
                                    }
                                }}
                                disabled={featureLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {featureLoading ? 'Đang tạo...' : 'Tạo tính năng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for creating new color */}
            {showCreateColorModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo màu sắc mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên màu *
                                </label>
                                <input
                                    type="text"
                                    value={newColor.name}
                                    onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Đỏ, Xanh, Vàng..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã hex *
                                </label>
                                <input
                                    type="text"
                                    value={newColor.hexCode}
                                    onChange={(e) => setNewColor(prev => ({ ...prev, hexCode: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="#FF5733"
                                />
                            </div>
                        </div>

                        {/* Error message for new color creation */}
                        {errors.some(error => error.field === 'newColor') && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {errors.find(error => error.field === 'newColor')?.message}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateColorModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={async () => {
                                    setColorLoading(true);
                                    try {
                                        const createdColor = await createColor(newColor.name, newColor.hexCode);
                                        setPredefinedColors(prev => [...prev, createdColor]);
                                        setFormData(prev => ({
                                            ...prev,
                                            stocks: prev.stocks.map(stock => ({
                                                ...stock,
                                                color: stock.color.name === createdColor.name ? createdColor : stock.color
                                            }))
                                        }));
                                        setShowCreateColorModal(false);
                                        setNewColor({ name: '', hexCode: '' });
                                        alert('Màu sắc đã được tạo thành công!');
                                    } catch (error) {
                                        console.error('Error creating color:', error);
                                        setErrors([{ field: 'newColor', message: 'Không thể tạo màu sắc mới' }]);
                                    } finally {
                                        setColorLoading(false);
                                    }
                                }}
                                disabled={colorLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {colorLoading ? 'Đang tạo...' : 'Tạo màu sắc'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for creating new instance */}
            {showCreateInstanceModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo phiên bản mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên phiên bản *
                                </label>
                                <input
                                    type="text"
                                    value={newInstance.name}
                                    onChange={(e) => setNewInstance(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phiên bản tiêu chuẩn, Phiên bản cao cấp..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả *
                                </label>
                                <textarea
                                    rows={3}
                                    value={newInstance.description}
                                    onChange={(e) => setNewInstance(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Mô tả chi tiết về phiên bản..."
                                />
                            </div>
                        </div>

                        {/* Error message for new instance creation */}
                        {errors.some(error => error.field === 'newInstance') && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {errors.find(error => error.field === 'newInstance')?.message}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateInstanceModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={async () => {
                                    setInstanceLoading(true);
                                    try {
                                        const createdInstance = await createInstance(newInstance.name, newInstance.description);
                                        setPredefinedInstances(prev => [...prev, createdInstance]);
                                        setFormData(prev => ({
                                            ...prev,
                                            stocks: prev.stocks.map(stock => ({
                                                ...stock,
                                                instanceProperties: [...stock.instanceProperties, { name: createdInstance.name }]
                                            }))
                                        }));
                                        setShowCreateInstanceModal(false);
                                        setNewInstance({ name: '', description: '' });
                                        alert('Phiên bản đã được tạo thành công!');
                                    } catch (error) {
                                        console.error('Error creating instance:', error);
                                        setErrors([{ field: 'newInstance', message: 'Không thể tạo phiên bản mới' }]);
                                    } finally {
                                        setInstanceLoading(false);
                                    }
                                }}
                                disabled={instanceLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {instanceLoading ? 'Đang tạo...' : 'Tạo phiên bản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProductPage;

