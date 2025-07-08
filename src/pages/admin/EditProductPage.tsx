import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeftIcon, Cog6ToothIcon, PhotoIcon, PlusIcon, XMarkIcon,} from "@heroicons/react/24/outline";
import type {ApiResponse} from "@/types/api.ts";
import {type Category, fetchAdminCategories,} from "@/services/categoryService";
import {type Color, fetchAdminColors} from "@/services/colorService";
import {type Feature, fetchAdminFeatures,} from "@/services/featureService";
import {fetchAdminInstances, type Instance,} from "@/services/instanceService";
import {type AdminProduct, AdminProductService,} from "@/services/adminProductService";
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";
import {Badge} from "../../components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "../../components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../../components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "../../components/ui/tabs";
import {Separator} from "../../components/ui/separator";

interface ProductForm {
    id: number;
    name: string;
    description: string;
    categoryId: string; // Can be actual ID (string) or temp ID (string)
    features: Array<{ name: string; value: string; }>; // value can be actual ID (string) or temp ID (string)
    stocks: Array<{
        colorId: number | string; // Can be actual ID (number) or temp ID (string)
        quantity: number;
        price: number;
        photos: string[]; // URLs
        instances: Array<{
            id: number | string | null; // Can be actual ID (number), temp ID (string), or null for new
            name: string;
        }>;
    }>;
}

// New type for the payload sent to the backend, more flexible than UpdateProductRequest
const EditProductPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const {categoryId} = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<ProductForm>({ // Initialize with ProductForm structure
        id: 0,
        name: "",
        description: "",
        categoryId: "",
        features: [],
        stocks: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [instances, setInstances] = useState<Instance[]>([]);
    const [errors, setErrors] = useState<any[]>([]);

    // State for new categories, features, and colors
    const [newCategoriesState, setNewCategoriesState] = useState<Array<{ tempId: string; name: string }>>([]);
    const [newFeaturesState, setNewFeaturesState] = useState<Array<{ tempId: string; name: string }>>([]);
    const [newColorsState, setNewColorsState] = useState<Array<{ tempId: string; name: string; hexCode: string }>>([]);

    const productService = new AdminProductService();

    useEffect(() => {
        // Fetch product data first
        const loadData = async () => {
            fetchProductData();

            await fetchSupportingData();
        };

        loadData();
    }, [id]);

    const params = {
        size: 1000,
    }

    const fetchSupportingData = async () => {
        try {
            // Load categories
            const categoriesData = await fetchAdminCategories(params);
            setCategories(categoriesData.data);

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

            if (!id || !categoryId) {
                throw new Error("Missing product ID or category ID");
            }

            const productApiResponse: ApiResponse<AdminProduct> =
                await productService.getAdminProductById(parseInt(categoryId), parseInt(id));

            // Check if the response has the expected data structure
            if (!productApiResponse || !productApiResponse.data) {
                console.error(
                    "Invalid product data structure received:",
                    productApiResponse
                );
                throw new Error(
                    "Invalid product data structure received from API"
                );
            }

            const productData = productApiResponse.data;

            // Transform API data to match the form structure
            const transformedData = {
                id: productData.id,
                name: productData.name || "",
                description: productData.description || "",
                categoryId: productData.category?.id?.toString() || "",
                features: Array.isArray(productData.features)
                    ? productData.features.map((feat) => ({
                        name: feat.name,
                        value: feat.id?.toString() || '', // Ensure value is string and handle null
                    }))
                    : [],
                stocks: Array.isArray(productData.stocks)
                    ? productData.stocks.map((stock) => ({
                        colorId: stock.color?.id?.toString() || '', // Ensure colorId is string
                        quantity: stock.quantity || 0,
                        price: stock.price || 0,
                        photos: Array.isArray(stock.photos)
                            ? stock.photos
                            : [],
                        instances: Array.isArray(stock.instanceProperties)
                            ? stock.instanceProperties.map(inst => ({id: inst.id, name: inst.name}))
                            : [],
                    }))
                    : [],
            };

            setFormData(transformedData);

            return true; // Return success status
        } catch (error) {
            console.error("Error fetching product:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setErrors([
                {
                    field: "fetch",
                    message: `Không thể tải thông tin sản phẩm: ${errorMessage}`,
                },
            ]);
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
                {
                    colorId: 0,
                    quantity: 0,
                    price: 0,
                    photos: [],
                    instances: [],
                },
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

    const addStockProperty = (stockIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === stockIndex
                    ? {
                        ...stock,
                        instances: [
                            ...(stock.instances || []),
                            {id: null, name: ""},
                        ],
                    }
                    : stock
            ),
        }));
    };

    const removeStockProperty = (stockIndex: number, propertyIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === stockIndex
                    ? {
                        ...stock,
                        instances:
                            stock.instances?.filter(
                                (_, pi) => pi !== propertyIndex
                            ) || [],
                    }
                    : stock
            ),
        }));
    };

    const updateStockProperty = (
        stockIndex: number,
        propertyIndex: number,
        newProperty: { id: number | string | null; name: string }
    ) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === stockIndex
                    ? {
                        ...stock,
                        instances:
                            stock.instances?.map((instance, pi) =>
                                pi === propertyIndex ? newProperty : instance
                            ) || [],
                    }
                    : stock
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Determine categoryId and optional category object for payload
            let categoryObjectPayload: { id: number | null; name: string; } | undefined;
            const isNewCategory = formData.categoryId.startsWith('new-');
            if (isNewCategory) {
                const newCategory = newCategoriesState.find(nc => nc.tempId === formData.categoryId);
                if (!newCategory) throw new Error(`New category with tempId ${formData.categoryId} not found.`);
                categoryObjectPayload = {id: null, name: newCategory.name};
            } else {
            }

            // Map features for the payload
            const mappedFeatures = formData.features.map(feature => {
                const isNew = feature.value.startsWith('new-');
                const newFeature = newFeaturesState.find(nf => nf.tempId === feature.value);
                return {
                    id: isNew ? null : parseInt(feature.value), // Send null for new features
                    name: isNew && newFeature ? newFeature.name : feature.name, // Use name from newFeaturesState for new ones
                };
            });

            // Map stocks for the payload with complete data structure
            const mappedStocks = formData.stocks.map(stock => {
                let colorPayload: { id: number | null; name: string; hexCode?: string; };
                const isNewColor = typeof stock.colorId === 'string' && stock.colorId.startsWith('new-');

                if (isNewColor) {
                    const newColor = newColorsState.find(nc => nc.tempId === stock.colorId);
                    if (!newColor) throw new Error(`New color with tempId ${stock.colorId} not found.`);
                    colorPayload = {id: null, name: newColor.name, hexCode: newColor.hexCode};
                } else {
                    // Find existing color by ID
                    const existingColor = colors.find(c => c.id?.toString() === stock.colorId.toString());
                    if (!existingColor) {
                        throw new Error(`Existing color with id ${stock.colorId} not found.`);
                    }
                    colorPayload = {
                        id: existingColor.id || null,
                        name: existingColor.name,
                        hexCode: existingColor.hexCode
                    };
                }

                const mappedInstances = stock.instances.map(instance => {
                    const isNewInstance = typeof instance.id === 'string' && instance.id.startsWith('new-');
                    return {
                        id: isNewInstance ? null : (instance.id as number),
                        name: instance.name,
                    };
                });

                return {
                    id: null, // Will be handled by backend for existing stocks
                    color: colorPayload,
                    quantity: stock.quantity,
                    price: stock.price,
                    productPhotos: stock.photos.map(url => ({
                        id: null, // New photos will get IDs from backend
                        imageUrl: url,
                        alt: '' // Default alt text
                    })),
                    instanceProperties: mappedInstances,
                };
            });

            // Prepare complete data structure for the API request
            const updateData = {
                name: formData.name,
                description: formData.description,
                ...(categoryObjectPayload && {category: categoryObjectPayload}),
                features: mappedFeatures,
                stocks: mappedStocks,
            };

            // Prepare new image files and photo deletions for multipart/form-data
            const newImageFiles: Record<string, File> = {}; // Empty for now - will be populated when file upload is implemented
            const photoDeletionIds: number[] = []; // Empty for now - will be populated when photo deletion tracking is implemented

            // Call the robust service method with proper multipart/form-data handling
            const response = await productService.updateProduct(
                id,
                categoryId,
                updateData,
                newImageFiles,
                photoDeletionIds
            );

            if (response && response.success) {
                alert("Sản phẩm đã được cập nhật thành công!");
                navigate(`/admin/products/${id}`);
            } else {
                alert(
                    response?.message ||
                    "Có lỗi xảy ra khi cập nhật sản phẩm!"
                );
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Có lỗi xảy ra khi cập nhật sản phẩm!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-32 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-32 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate(`/admin/products/${categoryId}/${id}`)
                        }
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2"/>
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Chỉnh sửa sản phẩm
                        </h1>
                        <p className="text-gray-600">ID: {id}</p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
                <Card className="mb-6 border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            {errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600">
                                    {error.message}
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="basic" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">
                                    Thông tin cơ bản
                                </TabsTrigger>
                                <TabsTrigger value="features">
                                    Tính năng
                                </TabsTrigger>
                                <TabsTrigger value="inventory">
                                    Kho hàng
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Thông tin cơ bản</CardTitle>
                                        <CardDescription>
                                            Cập nhật thông tin cơ bản của sản
                                            phẩm
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Tên sản phẩm *
                                            </Label>
                                            <Input
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                placeholder="Nhập tên sản phẩm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">
                                                Danh mục *
                                            </Label>
                                            <Select value={formData.categoryId}
                                                    onValueChange={(value) => {
                                                        if (value === "new-category") {
                                                            const newCategoryName = prompt("Nhập tên danh mục mới:");
                                                            if (newCategoryName) {
                                                                const tempId = `new-${Date.now()}`;
                                                                setNewCategoriesState(prev => [...prev, {
                                                                    tempId,
                                                                    name: newCategoryName
                                                                }]);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    categoryId: tempId,
                                                                }));
                                                            }
                                                        } else if (value.startsWith('new-')) {
                                                            // If a previously created new category is selected
                                                            const selectedNewCategory = newCategoriesState.find(nc => nc.tempId === value);
                                                            if (selectedNewCategory) {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    categoryId: selectedNewCategory.tempId
                                                                }));
                                                            }
                                                        } else {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                categoryId: value,
                                                            }));
                                                        }
                                                    }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories?.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                    {newCategoriesState.map((nc) => (
                                                        <SelectItem key={nc.tempId} value={nc.tempId}>
                                                            {nc.name} (Mới)
                                                        </SelectItem>
                                                    ))}
                                                    <Separator className="my-1"/>
                                                    <SelectItem value="new-category">
                                                        <div className="flex items-center">
                                                            <PlusIcon className="w-3 h-3 mr-2"/>
                                                            Tạo danh mục mới
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">
                                                Mô tả
                                            </Label>
                                            <textarea
                                                id="description"
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        description:
                                                        e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input"
                                                placeholder="Nhập mô tả sản phẩm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Features Tab */}
                            <TabsContent value="features">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center">
                                                    <Cog6ToothIcon className="w-5 h-5 mr-2"/>
                                                    Tính năng sản phẩm
                                                </CardTitle>
                                                <CardDescription>
                                                    Quản lý các tính năng đặc
                                                    biệt của sản phẩm
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={addFeature}
                                                size="sm"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-2"/>
                                                Thêm tính năng
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {formData.features?.length > 0 ? (
                                            <div className="space-y-3">
                                                {formData.features.map(
                                                    (feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 border border-border rounded-lg"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <Badge variant="outline">
                                                                    Tính năng #
                                                                    {index + 1}
                                                                </Badge>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        removeFeature(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <XMarkIcon className="w-4 h-4 text-red-500"/>
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Tính
                                                                        năng
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            feature.value
                                                                        }
                                                                        onValueChange={(value) => {
                                                                            if (value === "new-feature") {
                                                                                // Handle creating new feature
                                                                                const newFeatureName =
                                                                                    prompt(
                                                                                        "Nhập tên tính năng mới:"
                                                                                    );
                                                                                if (
                                                                                    newFeatureName
                                                                                ) {
                                                                                    const tempId = `new-${Date.now()}`;
                                                                                    setNewFeaturesState(prev => [...prev, {
                                                                                        tempId,
                                                                                        name: newFeatureName
                                                                                    }]);
                                                                                    updateFeature(
                                                                                        index,
                                                                                        "name",
                                                                                        newFeatureName
                                                                                    );
                                                                                    updateFeature(
                                                                                        index,
                                                                                        "value",
                                                                                        tempId
                                                                                    ); // temporary ID
                                                                                }
                                                                            } else if (value.startsWith('new-')) {
                                                                                // If a previously created new feature is selected
                                                                                const selectedNewFeature = newFeaturesState.find(nf => nf.tempId === value);
                                                                                if (selectedNewFeature) {
                                                                                    updateFeature(index, "name", selectedNewFeature.name); // Update name from the new feature state
                                                                                    updateFeature(index, "value", selectedNewFeature.tempId);
                                                                                }
                                                                            } else {
                                                                                const selectedFeature =
                                                                                    features.find(
                                                                                        (
                                                                                            f
                                                                                        ) =>
                                                                                            f.id.toString() ===
                                                                                            value
                                                                                    );
                                                                                if (
                                                                                    selectedFeature
                                                                                ) {
                                                                                    updateFeature(
                                                                                        index,
                                                                                        "name",
                                                                                        selectedFeature.name
                                                                                    );
                                                                                    updateFeature(
                                                                                        index,
                                                                                        "value",
                                                                                        selectedFeature.id.toString()
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue
                                                                                placeholder="Chọn tính năng có sẵn"/>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {features?.map(
                                                                                (
                                                                                    feat
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            feat.id
                                                                                        }
                                                                                        value={feat.id.toString()}
                                                                                    >
                                                                                        {
                                                                                            feat.name
                                                                                        }
                                                                                    </SelectItem>
                                                                                )
                                                                            )}
                                                                            <Separator className="my-1"/>
                                                                            {newFeaturesState.map(nf => (
                                                                                <SelectItem key={nf.tempId}
                                                                                            value={nf.tempId}>
                                                                                    {nf.name} (Mới)
                                                                                </SelectItem>
                                                                            ))}
                                                                            <Separator className="my-1"/>
                                                                            <SelectItem value="new-feature">
                                                                                <div className="flex items-center">
                                                                                    <PlusIcon className="w-3 h-3 mr-2"/>
                                                                                    Tạo
                                                                                    tính
                                                                                    năng
                                                                                    mới
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Tên tính
                                                                        năng
                                                                    </Label>
                                                                    <Input
                                                                        value={
                                                                            feature.name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateFeature(
                                                                                index,
                                                                                "name",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        placeholder="Tên tính năng"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Cog6ToothIcon className="w-12 h-12 mx-auto mb-4 text-gray-300"/>
                                                <p>Chưa có tính năng nào</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addFeature}
                                                    className="mt-2"
                                                >
                                                    Thêm tính năng đầu tiên
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Inventory Tab */}
                            <TabsContent value="inventory">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center">
                                                    <PhotoIcon className="w-5 h-5 mr-2"/>
                                                    Quản lý kho hàng
                                                </CardTitle>
                                                <CardDescription>
                                                    Quản lý màu sắc, số lượng và
                                                    giá của sản phẩm
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={addStock}
                                                size="sm"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-2"/>
                                                Thêm màu sắc
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {formData.stocks?.length > 0 ? (
                                            <div className="space-y-4">
                                                {formData.stocks.map(
                                                    (stock, index) => (
                                                        <Card
                                                            key={index}
                                                            className="border-l-4 border-l-blue-500"
                                                        >
                                                            <CardContent className="pt-6">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Badge variant="secondary">
                                                                            Màu
                                                                            sắc
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </Badge>
                                                                        {colors.find(
                                                                            (
                                                                                c
                                                                            ) =>
                                                                                c.id ===
                                                                                stock.colorId
                                                                        ) && (
                                                                            <div
                                                                                className="flex items-center space-x-2">
                                                                                <div
                                                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                        colors.find(
                                                                                            (
                                                                                                c
                                                                                            ) =>
                                                                                                c.id ===
                                                                                                stock.colorId
                                                                                        )
                                                                                            ?.hexCode,
                                                                                    }}
                                                                                />
                                                                                <span className="text-sm text-gray-600">
                                                                                    {
                                                                                        colors.find(
                                                                                            (
                                                                                                c
                                                                                            ) =>
                                                                                                c.id ===
                                                                                                stock.colorId
                                                                                        )
                                                                                            ?.name
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            removeStock(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4 text-red-500"/>
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>
                                                                            Màu
                                                                            sắc
                                                                        </Label>
                                                                        <Select value={stock.colorId.toString()}
                                                                                onValueChange={(value) => {
                                                                                    if (value === "new-color") {
                                                                                        const newColorName = prompt("Nhập tên màu mới:");
                                                                                        const newHexCode = prompt("Nhập mã hex màu (ví dụ: #FF0000):");
                                                                                        if (newColorName && newHexCode) {
                                                                                            const tempId = `new-${Date.now()}`;
                                                                                            setNewColorsState(prev => [...prev, {
                                                                                                tempId,
                                                                                                name: newColorName,
                                                                                                hexCode: newHexCode
                                                                                            }]);
                                                                                            updateStock(index, "colorId", tempId);
                                                                                        }
                                                                                    } else {
                                                                                        updateStock(index, "colorId", value); // Value can be string (tempId) or number (existing ID)
                                                                                    }
                                                                                }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Chọn màu"/>
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {colors?.map(
                                                                                    (
                                                                                        color
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                color.id
                                                                                            }
                                                                                            value={color.id.toString()}
                                                                                        >
                                                                                            <div
                                                                                                className="flex items-center space-x-2">
                                                                                                <div
                                                                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                        color.hexCode,
                                                                                                    }}
                                                                                                />
                                                                                                <span>
                                                                                                    {
                                                                                                        color.name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                                <Separator className="my-1"/>
                                                                                {newColorsState.map(nc => (
                                                                                        <SelectItem key={nc.tempId}
                                                                                                    value={nc.tempId}>
                                                                                            <div
                                                                                                className="flex items-center space-x-2">
                                                                                                <div
                                                                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                                                                    style={{backgroundColor: nc.hexCode}}/>
                                                                                                <span>{nc.name} (Mới)</span>
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label>
                                                                            Số
                                                                            lượng
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                stock.quantity
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateStock(
                                                                                    index,
                                                                                    "quantity",
                                                                                    parseInt(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    ) ||
                                                                                    0
                                                                                )
                                                                            }
                                                                            placeholder="0"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label>
                                                                            Giá
                                                                            (VND)
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                stock.price
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateStock(
                                                                                    index,
                                                                                    "price",
                                                                                    parseInt(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    ) ||
                                                                                    0
                                                                                )
                                                                            }
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <Separator className="my-4"/>

                                                                {/* Instance Properties for this Stock */}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label>
                                                                            Thuộc
                                                                            tính
                                                                            riêng
                                                                        </Label>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                addStockProperty(
                                                                                    index
                                                                                )
                                                                            }
                                                                        >
                                                                            <PlusIcon className="w-3 h-3 mr-1"/>
                                                                            Thêm
                                                                            thuộc
                                                                            tính
                                                                        </Button>
                                                                    </div>

                                                                    {stock.instances &&
                                                                    stock
                                                                        .instances
                                                                        .length >
                                                                    0 ? (
                                                                        <div className="space-y-2">
                                                                            {stock.instances.map(
                                                                                (
                                                                                    instance,
                                                                                    instanceIndex
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            instanceIndex
                                                                                        }
                                                                                        className="flex gap-2 p-2 border border-gray-200 rounded"
                                                                                    >
                                                                                        <Select
                                                                                            value={
                                                                                                instance.id?.toString() ||
                                                                                                ""
                                                                                            }
                                                                                            onValueChange={(
                                                                                                value
                                                                                            ) => {
                                                                                                if (
                                                                                                    value ===
                                                                                                    "new"
                                                                                                ) {
                                                                                                    // Handle creating new instance
                                                                                                    const newInstanceName =
                                                                                                        prompt(
                                                                                                            "Nhập tên thuộc tính mới:"
                                                                                                        );
                                                                                                    if (
                                                                                                        newInstanceName
                                                                                                    ) {
                                                                                                        updateStockProperty(
                                                                                                            index,
                                                                                                            instanceIndex,
                                                                                                            {
                                                                                                                id: Date.now(), // temporary ID
                                                                                                                name: newInstanceName,
                                                                                                            }
                                                                                                        );
                                                                                                    }
                                                                                                } else {
                                                                                                    const selectedInstance =
                                                                                                        instances.find(
                                                                                                            (
                                                                                                                i
                                                                                                            ) =>
                                                                                                                i.id.toString() ===
                                                                                                                value
                                                                                                        );
                                                                                                    if (
                                                                                                        selectedInstance
                                                                                                    ) {
                                                                                                        updateStockProperty(
                                                                                                            index,
                                                                                                            instanceIndex,
                                                                                                            selectedInstance
                                                                                                        );
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <SelectTrigger
                                                                                                className="flex-1">
                                                                                                <SelectValue
                                                                                                    placeholder="Chọn thuộc tính"/>
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {instances?.map(
                                                                                                    (
                                                                                                        instance
                                                                                                    ) => (
                                                                                                        <SelectItem
                                                                                                            key={
                                                                                                                instance.id
                                                                                                            }
                                                                                                            value={instance.id.toString()}
                                                                                                        >
                                                                                                            {
                                                                                                                instance.name
                                                                                                            }
                                                                                                        </SelectItem>
                                                                                                    )
                                                                                                )}
                                                                                                <Separator
                                                                                                    className="my-1"/>
                                                                                                <SelectItem value="new">
                                                                                                    <div
                                                                                                        className="flex items-center">
                                                                                                        <PlusIcon
                                                                                                            className="w-3 h-3 mr-2"/>
                                                                                                        Tạo
                                                                                                        thuộc
                                                                                                        tính
                                                                                                        mới
                                                                                                    </div>
                                                                                                </SelectItem>
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                                removeStockProperty(
                                                                                                    index,
                                                                                                    instanceIndex
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <XMarkIcon
                                                                                                className="w-3 h-3 text-red-500"/>
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            className="text-center py-2 text-gray-500 text-sm">
                                                                            Chưa
                                                                            có
                                                                            thuộc
                                                                            tính
                                                                            riêng
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <Separator className="my-4"/>

                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Hình ảnh
                                                                        (URLs)
                                                                    </Label>
                                                                    <textarea
                                                                        rows={3}
                                                                        value={stock.photos.join(
                                                                            "\n"
                                                                        )}
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateStock(
                                                                                index,
                                                                                "photos",
                                                                                e.target.value
                                                                                    .split(
                                                                                        "\n"
                                                                                    )
                                                                                    .filter(
                                                                                        (
                                                                                            url
                                                                                        ) =>
                                                                                            url.trim()
                                                                                    )
                                                                            )
                                                                        }
                                                                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input"
                                                                        placeholder="Nhập URLs hình ảnh, mỗi URL một dòng"
                                                                    />
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            stock
                                                                                .photos
                                                                                .length
                                                                        }{" "}
                                                                        hình ảnh
                                                                    </p>
                                                                    {stock
                                                                            .photos
                                                                            .length >
                                                                        0 && (
                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                {stock.photos.map(
                                                                                    (
                                                                                        photoUrl,
                                                                                        photoIndex
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                photoIndex
                                                                                            }
                                                                                            className="relative"
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    photoUrl
                                                                                                }
                                                                                                alt={`Product image ${
                                                                                                    photoIndex +
                                                                                                    1
                                                                                                }`}
                                                                                                className="h-20 w-20 rounded-md border object-cover"
                                                                                                onError={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    (
                                                                                                        e.target as HTMLImageElement
                                                                                                    ).src =
                                                                                                        "https://via.placeholder.com/80";
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300"/>
                                                <p>Chưa có màu sắc nào</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addStock}
                                                    className="mt-2"
                                                >
                                                    Thêm màu sắc đầu tiên
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Hành động
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isSaving
                                        ? "Đang lưu..."
                                        : "Cập nhật sản phẩm"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        navigate(
                                            `/admin/products/${categoryId}/${id}`
                                        )
                                    }
                                    className="w-full"
                                    size="lg"
                                >
                                    Hủy
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Tóm tắt
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tính năng:
                                        </span>
                                        <Badge variant="secondary">
                                            {formData.features?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Màu sắc:
                                        </span>
                                        <Badge variant="secondary">
                                            {formData.stocks?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Thuộc tính:
                                        </span>
                                        <Badge variant="secondary">
                                            {formData.stocks?.reduce(
                                                (total, stock) => total + (stock.instances?.length || 0),
                                                0
                                            ) || 0}
                                        </Badge>
                                    </div>
                                    <Separator className="my-2"/>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tổng ảnh:
                                        </span>
                                        <Badge variant="outline">
                                            {formData.stocks?.reduce(
                                                (total, stock) =>
                                                    total + stock.photos.length,
                                                0
                                            ) || 0}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProductPage;
