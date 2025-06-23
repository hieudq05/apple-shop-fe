import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
    PlusIcon,
    XMarkIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import type {ApiResponse, UpdateProductRequest} from "../../types/api";
import {fetchAdminCategories, type Category} from "../../services/categoryService";
import {fetchAdminColors, type Color} from "../../services/colorService";
import {fetchAdminFeatures, type Feature} from "../../services/featureService";
import {fetchAdminInstances, type Instance} from "../../services/instanceService";
import {type AdminProduct, adminProductService, AdminProductService} from "../../services/adminProductService";
import type {Product} from "../../services/productService.ts";

interface ProductForm extends Omit<UpdateProductRequest, "categoryId"> {
    categoryId: string;
}

const EditProductPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const {categoryId} = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<ProductForm>({
        id: 0,
        name: "",
        title: "",
        description: "",
        categoryId: "",
        features: [],
        stocks: [],
        instanceProperties: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [instances, setInstances] = useState<Instance[]>([]);
    const [errors, setErrors] = useState<any[]>([]);

    const productService = new AdminProductService();

    useEffect(() => {
        // Fetch product data first
        const loadData = async () => {
            fetchProductData();

            await fetchSupportingData();
        };

        loadData();
    }, [id]);

    const fetchSupportingData = async () => {
        try {
            // Load categories
            const categoriesData = await fetchAdminCategories();
            setCategories(categoriesData);

            // Load colors
            const colorsData = await fetchAdminColors();
            setColors(colorsData);

            // Load features
            const featuresData = await fetchAdminFeatures();
            setFeatures(featuresData);

            // Load instances
            const instancesData = await fetchAdminInstances();
            setInstances(instancesData);
        } catch (error) {
            console.error("Error fetching supporting data:", error);
        }
    };

    const fetchProductData = async () => {
        try {
            setIsLoading(true);

            const productApiResponse: ApiResponse<AdminProduct> = await productService.getAdminProductById(categoryId, id);

            // Check if the response has the expected data structure
            if (!productApiResponse || !productApiResponse.data) {
                console.error("Invalid product data structure received:", productData);
                throw new Error('Invalid product data structure received from API');
            }

            const productData = productApiResponse.data;

            // Transform API data to match the form structure
            const transformedData = {
                id: productData.id,
                name: productData.name || '',
                description: productData.description || '',
                categoryId: productData.category?.id?.toString() || '',
                features: Array.isArray(productData.features) ? productData.features?.map(feat => ({
                    name: feat.name || '',
                    value: feat.id || ''
                })) : [],
                stocks: Array.isArray(productData.stocks) ? productData.stocks?.map(stock => ({
                    colorId: stock.color?.id || 0,
                    quantity: stock.quantity || 0,
                    price: stock.price || 0,
                    photos: Array.isArray(stock.photos) ? [...stock.photos] : [],
                    instances: Array.isArray(stock.instanceProperties) ? [...stock.instanceProperties] : []
                })) : [],
            };

            setFormData(transformedData);

            return true; // Return success status
        } catch (error) {
            console.error("Error fetching product:", error);
            setErrors([{field: 'fetch', message: `Không thể tải thông tin sản phẩm: ${error.message}`}]);
            return false; // Return failure status
        } finally {
            setIsLoading(false);
        }
    };

    const addFeature = () => {
        setFormData((prev) => ({
            ...prev,
            features: [...prev.features, {name: "", value: ""}],
        }));
    };

    const removeFeature = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const updateFeature = (
        index: number,
        field: "name" | "value",
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features?.map((feature, i) =>
                i === index ? {...feature, [field]: value} : feature
            ),
        }));
    };

    const addStock = () => {
        setFormData((prev) => ({
            ...prev,
            stocks: [
                ...prev.stocks,
                {colorId: 0, quantity: 0, price: 0, photos: []},
            ],
        }));
    };

    const removeStock = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.filter((_, i) => i !== index),
        }));
    };

    const updateStock = (
        index: number,
        field: keyof (typeof formData.stocks)[0],
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks?.map((stock, i) =>
                i === index ? {...stock, [field]: value} : stock
            ),
        }));
    };

    const addProperty = () => {
        setFormData((prev) => ({
            ...prev,
            instanceProperties: [
                ...prev.instanceProperties,
                {name: "", value: ""},
            ],
        }));
    };

    const removeProperty = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            instanceProperties: prev.instanceProperties.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const updateProperty = (
        index: number,
        field: "name" | "value",
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            instanceProperties: prev.instanceProperties?.map((prop, i) =>
                i === index ? {...prop, [field]: value} : prop
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Prepare data for the API request
            const updateData: UpdateProductRequest = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                categoryId: parseInt(formData.categoryId),
                features: formData.features,
                stocks: formData.stocks,
                instanceProperties: formData.instanceProperties,
            };

            // Call the service method to update the product
            const response = await productService.updateProduct(formData.id, updateData);

            if (response && response.status === 'success') {
                alert('Sản phẩm đã được cập nhật thành công!');
                navigate(`/admin/products/${id}`);
            } else {
                alert(response?.error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm!');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Có lỗi xảy ra khi cập nhật sản phẩm!');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/admin/products/${categoryId}/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Chỉnh sửa sản phẩm
                        </h1>
                        <p className="text-gray-600">ID: {id}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin cơ bản
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                categoryId: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories?.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
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
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Tính năng
                                </h2>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1"/>
                                    Thêm tính năng
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.features?.map((feature, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Tên tính năng"
                                            value={feature.name}
                                            onChange={(e) =>
                                                updateFeature(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Giá trị"
                                            value={feature.value}
                                            onChange={(e) =>
                                                updateFeature(
                                                    index,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <XMarkIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stocks */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Kho hàng
                                </h2>
                                <button
                                    type="button"
                                    onClick={addStock}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1"/>
                                    Thêm màu sắc
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.stocks?.map((stock, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">
                                                Màu sắc #{index + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeStock(index)
                                                }
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XMarkIcon className="w-4 h-4"/>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Màu sắc
                                                </label>
                                                <select
                                                    value={stock.colorId}
                                                    onChange={(e) =>
                                                        updateStock(
                                                            index,
                                                            "colorId",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={0}>
                                                        Chọn màu
                                                    </option>
                                                    {colors?.map((color) => (
                                                        <option
                                                            key={color.id}
                                                            value={color.id}
                                                        >
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
                                                    onChange={(e) =>
                                                        updateStock(
                                                            index,
                                                            "quantity",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
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
                                                    onChange={(e) =>
                                                        updateStock(
                                                            index,
                                                            "price",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
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
                                                value={stock.photos.join("\n")}
                                                onChange={(e) =>
                                                    updateStock(
                                                        index,
                                                        "photos",
                                                        e.target.value
                                                            .split("\n")
                                                            .filter((url) =>
                                                                url.trim()
                                                            )
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instance Properties */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Thuộc tính
                                </h2>
                                <button
                                    type="button"
                                    onClick={addProperty}
                                    className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-3 h-3 mr-1"/>
                                    Thêm
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.instanceProperties?.map(
                                    (property, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tên thuộc tính"
                                                    value={property.name}
                                                    onChange={(e) =>
                                                        updateProperty(
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeProperty(index)
                                                    }
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <XMarkIcon className="w-3 h-3"/>
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Giá trị"
                                                value={property.value}
                                                onChange={(e) =>
                                                    updateProperty(
                                                        index,
                                                        "value",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isSaving
                                        ? "Đang lưu..."
                                        : "Cập nhật sản phẩm"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/admin/products/${categoryId}/${id}`)
                                    }
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

export default EditProductPage;
