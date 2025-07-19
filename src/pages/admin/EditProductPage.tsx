import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    Cog6ToothIcon,
    PhotoIcon,
    PlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ApiResponse } from "@/types/api.ts";
import {
    type Category,
    fetchAdminCategories,
} from "@/services/categoryService";
import {
    type Color,
    fetchAdminColors,
    createColor,
    updateColor,
    deleteColor,
} from "@/services/colorService";
import {
    type Feature,
    fetchAdminFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
} from "@/services/featureService";
import {
    fetchAdminInstances,
    type Instance,
    createInstance,
    updateInstance,
    deleteInstance,
} from "@/services/instanceService";
import {
    type AdminProduct,
    AdminProductService,
} from "@/services/adminProductService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

interface ProductForm {
    id: number;
    name: string;
    description: string;
    categoryId: string; // Can be actual ID (string) or temp ID (string)
    features: Array<{ name: string; value: string }>; // value can be actual ID (string) or temp ID (string)
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
    const { id } = useParams<{ id: string }>();
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<ProductForm>({
        // Initialize with ProductForm structure
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
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        []
    );

    // Dialog states for creating new items
    const [showCreateColorModal, setShowCreateColorModal] = useState(false);
    const [newColor, setNewColor] = useState<{ name: string; hexCode: string }>(
        {
            name: "",
            hexCode: "#000000",
        }
    );
    const [currentStockIndex, setCurrentStockIndex] = useState<number | null>(
        null
    );
    const [showCreateFeatureModal, setShowCreateFeatureModal] = useState(false);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState<
        number | null
    >(null);
    const [newFeature, setNewFeature] = useState<{
        name: string;
        description: string;
    }>({
        name: "",
        description: "",
    });
    const [showCreateInstanceModal, setShowCreateInstanceModal] =
        useState(false);
    const [currentInstanceStockIndex, setCurrentInstanceStockIndex] = useState<
        number | null
    >(null);
    const [currentInstanceIndex, setCurrentInstanceIndex] = useState<
        number | null
    >(null);
    const [newInstance, setNewInstance] = useState<{
        name: string;
        description: string;
    }>({
        name: "",
        description: "",
    });

    // Dialog states for editing existing items
    const [showEditColorModal, setShowEditColorModal] = useState(false);
    const [editingColor, setEditingColor] = useState<Color | null>(null);
    const [editColor, setEditColor] = useState<{
        name: string;
        hexCode: string;
    }>({
        name: "",
        hexCode: "#000000",
    });
    const [showEditFeatureModal, setShowEditFeatureModal] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [editFeature, setEditFeature] = useState<{
        name: string;
        description: string;
    }>({
        name: "",
        description: "",
    });
    const [showEditInstanceModal, setShowEditInstanceModal] = useState(false);
    const [editingInstance, setEditingInstance] = useState<Instance | null>(
        null
    );
    const [editInstance, setEditInstance] = useState<{
        name: string;
        description: string;
    }>({
        name: "",
        description: "",
    });

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
    };

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
                await productService.getAdminProductById(
                    parseInt(categoryId),
                    parseInt(id)
                );

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
                          value: feat.id?.toString() || "", // Ensure value is string and handle null
                      }))
                    : [],
                stocks: Array.isArray(productData.stocks)
                    ? productData.stocks.map((stock) => ({
                          colorId: stock.color?.id?.toString() || "", // Ensure colorId is string
                          quantity: stock.quantity || 0,
                          price: stock.price || 0,
                          photos: Array.isArray(stock.photos)
                              ? stock.photos
                              : [],
                          instances: Array.isArray(stock.instanceProperties)
                              ? stock.instanceProperties.map((inst) => ({
                                    id: inst.id,
                                    name: inst.name,
                                }))
                              : [],
                      }))
                    : [],
            };

            setFormData(transformedData);

            return true; // Return success status
        } catch (error) {
            console.error("Error fetching product:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
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
            features: [...prev.features, { name: "", value: "" }],
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
                i === index ? { ...feature, [field]: value } : feature
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
                i === index ? { ...stock, [field]: value } : stock
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
                              { id: null, name: "" },
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
                              stock.instances?.map((prop, pi) =>
                                  pi === propertyIndex ? newProperty : prop
                              ) || [],
                      }
                    : stock
            ),
        }));
    };

    // Handle creating new color with proper validation
    const handleCreateColor = async () => {
        // Validation for new color
        const colorErrors: { field: string; message: string }[] = [];

        if (!newColor.name.trim()) {
            colorErrors.push({
                field: "newColor",
                message: "Vui lòng nhập tên màu",
            });
        }

        if (!newColor.hexCode.trim()) {
            colorErrors.push({
                field: "newColor",
                message: "Vui lòng nhập mã hex",
            });
        } else if (
            !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor.hexCode)
        ) {
            colorErrors.push({
                field: "newColor",
                message: "Mã hex không hợp lệ (ví dụ: #FF0000)",
            });
        }

        // Check for duplicates in existing colors
        if (
            colors.some(
                (color) =>
                    color.name.toLowerCase() === newColor.name.toLowerCase()
            )
        ) {
            colorErrors.push({
                field: "newColor",
                message: "Tên màu đã tồn tại trong danh sách màu hiện có",
            });
        }

        if (colorErrors.length > 0) {
            setErrors(colorErrors);
            return;
        }

        try {
            // Call API to create color
            const createdColor = await createColor({
                name: newColor.name,
                hexCode: newColor.hexCode,
                id: null,
            });

            // Update colors list
            setColors((prev) => [...prev, createdColor]);

            // If this was triggered from a stock color selection, assign it to that stock
            if (currentStockIndex !== null) {
                updateStock(
                    currentStockIndex,
                    "colorId",
                    createdColor.id?.toString() || ""
                );
                setCurrentStockIndex(null);
            }

            setShowCreateColorModal(false);
            setNewColor({ name: "", hexCode: "#000000" });
            setErrors([]); // Clear errors on success
        } catch (error) {
            console.error("Error creating color:", error);
            setErrors([
                { field: "newColor", message: "Có lỗi xảy ra khi tạo màu" },
            ]);
        }
    };

    // Handle creating new feature
    const handleCreateFeature = async () => {
        try {
            // Call API to create feature
            const createdFeature = await createFeature({
                name: newFeature.name,
                description: newFeature.description,
                id: null,
            });

            // Update features list
            setFeatures((prev) => [...prev, createdFeature]);

            // If this was triggered from a feature selection, assign it to that feature
            if (currentFeatureIndex !== null) {
                updateFeature(currentFeatureIndex, "name", newFeature.name);
                updateFeature(
                    currentFeatureIndex,
                    "value",
                    createdFeature.id?.toString() || ""
                );
                setCurrentFeatureIndex(null);
            }

            setShowCreateFeatureModal(false);
            setNewFeature({ name: "", description: "" });
            setErrors([]);
        } catch (error) {
            console.error("Error creating feature:", error);
            setErrors([
                {
                    field: "newFeature",
                    message: "Có lỗi xảy ra khi tạo tính năng",
                },
            ]);
        }
    };

    // Handle creating new instance
    const handleCreateInstance = async () => {
        try {
            // Call API to create instance
            const createdInstance = await createInstance({
                name: newInstance.name,
                description: newInstance.description,
                id: null,
            });

            // Add to instances list for future selection
            setInstances((prev) => [...prev, createdInstance]);

            // If this was triggered from a stock instance selection, assign it to that stock
            if (
                currentInstanceStockIndex !== null &&
                currentInstanceIndex !== null
            ) {
                updateStockProperty(
                    currentInstanceStockIndex,
                    currentInstanceIndex,
                    createdInstance
                );
                setCurrentInstanceStockIndex(null);
                setCurrentInstanceIndex(null);
            }

            setShowCreateInstanceModal(false);
            setNewInstance({ name: "", description: "" });
            setErrors([]);
        } catch (error) {
            console.error("Error creating instance:", error);
            setErrors([
                {
                    field: "newInstance",
                    message: "Có lỗi xảy ra khi tạo thuộc tính",
                },
            ]);
        }
    };

    // Handle editing existing color
    const handleEditColor = (color: Color) => {
        setEditingColor(color);
        setEditColor({
            name: color.name,
            hexCode: color.hexCode,
        });
        setShowEditColorModal(true);
    };

    const handleUpdateColor = async () => {
        if (!editingColor) return;

        // Validation for edited color
        const colorErrors: { field: string; message: string }[] = [];

        if (!editColor.name.trim()) {
            colorErrors.push({
                field: "editColor",
                message: "Vui lòng nhập tên màu",
            });
        }

        if (!editColor.hexCode.trim()) {
            colorErrors.push({
                field: "editColor",
                message: "Vui lòng nhập mã hex",
            });
        } else if (
            !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(editColor.hexCode)
        ) {
            colorErrors.push({
                field: "editColor",
                message: "Mã hex không hợp lệ (ví dụ: #FF0000)",
            });
        }

        // Check for duplicates (excluding the current color)
        if (
            colors.some(
                (color) =>
                    color.id !== editingColor.id &&
                    color.name.toLowerCase() === editColor.name.toLowerCase()
            )
        ) {
            colorErrors.push({
                field: "editColor",
                message: "Tên màu đã tồn tại",
            });
        }

        if (colorErrors.length > 0) {
            setErrors(colorErrors);
            return;
        }

        try {
            // Call API to update color
            const updatedColor = await updateColor({
                ...editingColor,
                name: editColor.name,
                hexCode: editColor.hexCode,
            });

            // Update the color in the colors list
            setColors((prev) =>
                prev.map((color) =>
                    color.id === editingColor.id ? updatedColor : color
                )
            );

            setShowEditColorModal(false);
            setEditingColor(null);
            setEditColor({ name: "", hexCode: "#000000" });
            setErrors([]);
        } catch (error) {
            console.error("Error updating color:", error);
            setErrors([
                {
                    field: "editColor",
                    message: "Có lỗi xảy ra khi cập nhật màu",
                },
            ]);
        }
    };

    // Handle editing existing feature
    const handleEditFeature = (feature: Feature) => {
        setEditingFeature(feature);
        setEditFeature({
            name: feature.name,
            description: feature.description || "",
        });
        setShowEditFeatureModal(true);
    };

    const handleUpdateFeature = async () => {
        if (!editingFeature) return;

        try {
            // Call API to update feature (without image for now)
            const updatedFeature = await updateFeature({
                ...editingFeature,
                name: editFeature.name,
                description: editFeature.description,
            });

            // Update the feature in the features list
            setFeatures((prev) =>
                prev.map((feature) =>
                    feature.id === editingFeature.id ? updatedFeature : feature
                )
            );

            setShowEditFeatureModal(false);
            setEditingFeature(null);
            setEditFeature({ name: "", description: "" });
            setErrors([]);
        } catch (error) {
            console.error("Error updating feature:", error);
            setErrors([
                {
                    field: "editFeature",
                    message: "Có lỗi xảy ra khi cập nhật tính năng",
                },
            ]);
        }
    };

    // Handle editing existing instance
    const handleEditInstance = (instance: Instance) => {
        setEditingInstance(instance);
        setEditInstance({
            name: instance.name,
            description: instance.description || "",
        });
        setShowEditInstanceModal(true);
    };

    const handleUpdateInstance = async () => {
        if (!editingInstance) return;

        try {
            // Call API to update instance
            const updatedInstance = await updateInstance({
                ...editingInstance,
                name: editInstance.name,
                description: editInstance.description,
            });

            // Update the instance in the instances list
            setInstances((prev) =>
                prev.map((instance) =>
                    instance.id === editingInstance.id
                        ? updatedInstance
                        : instance
                )
            );

            setShowEditInstanceModal(false);
            setEditingInstance(null);
            setEditInstance({ name: "", description: "" });
            setErrors([]);
        } catch (error) {
            console.error("Error updating instance:", error);
            setErrors([
                {
                    field: "editInstance",
                    message: "Có lỗi xảy ra khi cập nhật thuộc tính",
                },
            ]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Determine categoryId and optional category object for payload
            let categoryObjectPayload:
                | { id: number | null; name: string }
                | undefined;
            const isNewCategory = formData.categoryId.startsWith("new-");
            if (isNewCategory) {
                const newCategory = newCategoriesState.find(
                    (nc) => nc.tempId === formData.categoryId
                );
                if (!newCategory)
                    throw new Error(
                        `New category with tempId ${formData.categoryId} not found.`
                    );
                categoryObjectPayload = { id: null, name: newCategory.name };
            } else {
            }

            // Map features for the payload
            const mappedFeatures = formData.features.map((feature) => {
                const isNew = feature.value.startsWith("new-");
                const newFeature = newFeaturesState.find(
                    (nf) => nf.tempId === feature.value
                );
                return {
                    id: isNew ? null : parseInt(feature.value), // Send null for new features
                    name: isNew && newFeature ? newFeature.name : feature.name, // Use name from newFeaturesState for new ones
                };
            });

            // Map stocks for the payload with complete data structure
            const mappedStocks = formData.stocks.map((stock) => {
                let colorPayload: {
                    id: number | null;
                    name: string;
                    hexCode?: string;
                };
                const isNewColor =
                    typeof stock.colorId === "string" &&
                    stock.colorId.startsWith("new-");

                if (isNewColor) {
                    const newColor = newColorsState.find(
                        (nc) => nc.tempId === stock.colorId
                    );
                    if (!newColor)
                        throw new Error(
                            `New color with tempId ${stock.colorId} not found.`
                        );
                    colorPayload = {
                        id: null,
                        name: newColor.name,
                        hexCode: newColor.hexCode,
                    };
                } else {
                    // Find existing color by ID
                    const existingColor = colors.find(
                        (c) => c.id?.toString() === stock.colorId.toString()
                    );
                    if (!existingColor) {
                        throw new Error(
                            `Existing color with id ${stock.colorId} not found.`
                        );
                    }
                    colorPayload = {
                        id: existingColor.id || null,
                        name: existingColor.name,
                        hexCode: existingColor.hexCode,
                    };
                }

                const mappedInstances = stock.instances.map((instance) => {
                    const isNewInstance =
                        typeof instance.id === "string" &&
                        instance.id.startsWith("new-");
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
                    productPhotos: stock.photos.map((url) => ({
                        id: null, // New photos will get IDs from backend
                        imageUrl: url,
                        alt: "", // Default alt text
                    })),
                    instanceProperties: mappedInstances,
                };
            });

            // Prepare complete data structure for the API request
            const updateData = {
                name: formData.name,
                description: formData.description,
                ...(categoryObjectPayload && {
                    category: categoryObjectPayload,
                }),
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
                    response?.message || "Có lỗi xảy ra khi cập nhật sản phẩm!"
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
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
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

            {/* Quick Actions */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Cog6ToothIcon className="w-5 h-5 mr-2" />
                        Thao tác nhanh
                    </CardTitle>
                    <CardDescription>
                        Thêm màu sắc và thuộc tính mới để sử dụng trong sản phẩm
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setCurrentStockIndex(null);
                                setShowCreateColorModal(true);
                            }}
                            className="flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Thêm màu mới
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setCurrentInstanceStockIndex(null);
                                setCurrentInstanceIndex(null);
                                setShowCreateInstanceModal(true);
                            }}
                            className="flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Thêm thuộc tính mới
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setCurrentFeatureIndex(null);
                                setShowCreateFeatureModal(true);
                            }}
                            className="flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Thêm tính năng mới
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        categoryId: value,
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories?.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id?.toString() ||
                                                                    ""
                                                                }
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        )
                                                    )}
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
                                                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
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
                                                <PlusIcon className="w-4 h-4 mr-2" />
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
                                                                    <XMarkIcon className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Tính
                                                                        năng
                                                                    </Label>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Select
                                                                            value={
                                                                                feature.value
                                                                            }
                                                                            onValueChange={(
                                                                                value
                                                                            ) => {
                                                                                if (
                                                                                    value ===
                                                                                    "new-feature"
                                                                                ) {
                                                                                    setCurrentFeatureIndex(
                                                                                        index
                                                                                    );
                                                                                    setShowCreateFeatureModal(
                                                                                        true
                                                                                    );
                                                                                } else {
                                                                                    const selectedFeature =
                                                                                        features.find(
                                                                                            (
                                                                                                f
                                                                                            ) =>
                                                                                                f.id?.toString() ===
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
                                                                                            selectedFeature.id?.toString() ||
                                                                                                ""
                                                                                        );
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Chọn tính năng có sẵn" />
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
                                                                                            value={
                                                                                                feat.id?.toString() ||
                                                                                                ""
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                feat.name
                                                                                            }
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                                <Separator className="my-1" />
                                                                                <SelectItem value="new-feature">
                                                                                    <div className="flex items-center">
                                                                                        <PlusIcon className="w-3 h-3 mr-2" />
                                                                                        Tạo
                                                                                        tính
                                                                                        năng
                                                                                        mới
                                                                                    </div>
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {feature.value &&
                                                                            !feature.value.startsWith(
                                                                                "new-"
                                                                            ) &&
                                                                            feature.value !==
                                                                                "new-feature" && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        const selectedFeature =
                                                                                            features.find(
                                                                                                (
                                                                                                    f
                                                                                                ) =>
                                                                                                    f.id?.toString() ===
                                                                                                    feature.value
                                                                                            );
                                                                                        if (
                                                                                            selectedFeature
                                                                                        ) {
                                                                                            handleEditFeature(
                                                                                                selectedFeature
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    className="h-10 w-10"
                                                                                >
                                                                                    <Cog6ToothIcon className="w-4 h-4" />
                                                                                </Button>
                                                                            )}
                                                                    </div>
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
                                                <Cog6ToothIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                                                    <PhotoIcon className="w-5 h-5 mr-2" />
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
                                                <PlusIcon className="w-4 h-4 mr-2" />
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
                                                                            <div className="flex items-center space-x-2">
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
                                                                        <XMarkIcon className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>
                                                                            Màu
                                                                            sắc
                                                                        </Label>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Select
                                                                                value={stock.colorId.toString()}
                                                                                onValueChange={(
                                                                                    value
                                                                                ) => {
                                                                                    if (
                                                                                        value ===
                                                                                        "new-color"
                                                                                    ) {
                                                                                        setCurrentStockIndex(
                                                                                            index
                                                                                        );
                                                                                        setShowCreateColorModal(
                                                                                            true
                                                                                        );
                                                                                    } else {
                                                                                        updateStock(
                                                                                            index,
                                                                                            "colorId",
                                                                                            value
                                                                                        ); // Value can be string (tempId) or number (existing ID)
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Chọn màu" />
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
                                                                                                <div className="flex items-center space-x-2">
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
                                                                                    <Separator className="my-1" />
                                                                                    <SelectItem value="new-color">
                                                                                        <div className="flex items-center">
                                                                                            <PlusIcon className="w-3 h-3 mr-2" />
                                                                                            Tạo
                                                                                            màu
                                                                                            mới
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            {stock.colorId && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        const selectedColor =
                                                                                            colors.find(
                                                                                                (
                                                                                                    c
                                                                                                ) =>
                                                                                                    c.id?.toString() ===
                                                                                                    stock.colorId.toString()
                                                                                            );
                                                                                        if (
                                                                                            selectedColor
                                                                                        ) {
                                                                                            handleEditColor(
                                                                                                selectedColor
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    className="h-10 w-10"
                                                                                >
                                                                                    <Cog6ToothIcon className="w-4 h-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
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

                                                                <Separator className="my-4" />

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
                                                                            <PlusIcon className="w-3 h-3 mr-1" />
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
                                                                                                    setCurrentInstanceStockIndex(
                                                                                                        index
                                                                                                    );
                                                                                                    setCurrentInstanceIndex(
                                                                                                        instanceIndex
                                                                                                    );
                                                                                                    setShowCreateInstanceModal(
                                                                                                        true
                                                                                                    );
                                                                                                } else {
                                                                                                    const selectedInstance =
                                                                                                        instances.find(
                                                                                                            (
                                                                                                                i
                                                                                                            ) =>
                                                                                                                i.id?.toString() ===
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
                                                                                            <SelectTrigger className="flex-1">
                                                                                                <SelectValue placeholder="Chọn thuộc tính" />
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
                                                                                                            value={
                                                                                                                instance.id?.toString() ||
                                                                                                                ""
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                instance.name
                                                                                                            }
                                                                                                        </SelectItem>
                                                                                                    )
                                                                                                )}
                                                                                                <Separator className="my-1" />
                                                                                                <SelectItem value="new">
                                                                                                    <div className="flex items-center">
                                                                                                        <PlusIcon className="w-3 h-3 mr-2" />
                                                                                                        Tạo
                                                                                                        thuộc
                                                                                                        tính
                                                                                                        mới
                                                                                                    </div>
                                                                                                </SelectItem>
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                        {instance.id && (
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                onClick={() => {
                                                                                                    const selectedInstance =
                                                                                                        instances.find(
                                                                                                            (
                                                                                                                i
                                                                                                            ) =>
                                                                                                                i.id?.toString() ===
                                                                                                                instance.id?.toString()
                                                                                                        );
                                                                                                    if (
                                                                                                        selectedInstance
                                                                                                    ) {
                                                                                                        handleEditInstance(
                                                                                                            selectedInstance
                                                                                                        );
                                                                                                    }
                                                                                                }}
                                                                                                className="h-10 w-10"
                                                                                            >
                                                                                                <Cog6ToothIcon className="w-4 h-4" />
                                                                                            </Button>
                                                                                        )}
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
                                                                                            <XMarkIcon className="w-3 h-3 text-red-500" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-2 text-gray-500 text-sm">
                                                                            Chưa
                                                                            có
                                                                            thuộc
                                                                            tính
                                                                            riêng
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <Separator className="my-4" />

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
                                                <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                                                (total, stock) =>
                                                    total +
                                                    (stock.instances?.length ||
                                                        0),
                                                0
                                            ) || 0}
                                        </Badge>
                                    </div>
                                    <Separator className="my-2" />
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

                {/* Dialog for creating a new color */}
                <Dialog
                    open={showCreateColorModal}
                    onOpenChange={setShowCreateColorModal}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tạo màu mới</DialogTitle>
                            <DialogDescription>
                                Thêm màu sắc mới cho sản phẩm của bạn
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="color-name">Tên màu *</Label>
                                <Input
                                    id="color-name"
                                    placeholder="Space Black"
                                    value={newColor.name}
                                    onChange={(e) =>
                                        setNewColor((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color-hex">Mã hex *</Label>
                                <input
                                    type="color"
                                    id="color-hex"
                                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                                    value={newColor.hexCode}
                                    onChange={(e) =>
                                        setNewColor((prev) => ({
                                            ...prev,
                                            hexCode: e.target.value,
                                        }))
                                    }
                                />
                                {newColor.hexCode && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded border"
                                            style={{
                                                backgroundColor:
                                                    newColor.hexCode,
                                            }}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {newColor.hexCode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error message for new color creation */}
                        {errors.some((error) => error.field === "newColor") && (
                            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {
                                    errors.find(
                                        (error) => error.field === "newColor"
                                    )?.message
                                }
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateColorModal(false);
                                    setCurrentStockIndex(null);
                                    setNewColor({
                                        name: "",
                                        hexCode: "#000000",
                                    });
                                    setErrors([]);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleCreateColor}>Tạo màu</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog for creating a new feature */}
                <Dialog
                    open={showCreateFeatureModal}
                    onOpenChange={setShowCreateFeatureModal}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tạo tính năng mới</DialogTitle>
                            <DialogDescription>
                                Thêm tính năng mới cho sản phẩm của bạn
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="feature-name">
                                    Tên tính năng *
                                </Label>
                                <Input
                                    id="feature-name"
                                    placeholder="Camera"
                                    value={newFeature.name}
                                    onChange={(e) =>
                                        setNewFeature((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feature-description">
                                    Mô tả
                                </Label>
                                <Input
                                    id="feature-description"
                                    placeholder="Camera chính 48MP"
                                    value={newFeature.description}
                                    onChange={(e) =>
                                        setNewFeature((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateFeatureModal(false);
                                    setCurrentFeatureIndex(null);
                                    setNewFeature({
                                        name: "",
                                        description: "",
                                    });
                                    setErrors([]);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleCreateFeature}>
                                Tạo tính năng
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog for creating a new instance */}
                <Dialog
                    open={showCreateInstanceModal}
                    onOpenChange={setShowCreateInstanceModal}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tạo thuộc tính mới</DialogTitle>
                            <DialogDescription>
                                Thêm thuộc tính mới cho sản phẩm của bạn
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="instance-name">
                                    Tên thuộc tính *
                                </Label>
                                <Input
                                    id="instance-name"
                                    placeholder="128GB"
                                    value={newInstance.name}
                                    onChange={(e) =>
                                        setNewInstance((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instance-description">
                                    Mô tả
                                </Label>
                                <Input
                                    id="instance-description"
                                    placeholder="Dung lượng lưu trữ"
                                    value={newInstance.description}
                                    onChange={(e) =>
                                        setNewInstance((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateInstanceModal(false);
                                    setCurrentInstanceStockIndex(null);
                                    setCurrentInstanceIndex(null);
                                    setNewInstance({
                                        name: "",
                                        description: "",
                                    });
                                    setErrors([]);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleCreateInstance}>
                                Tạo thuộc tính
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Color Dialog */}
                <Dialog
                    open={showEditColorModal}
                    onOpenChange={setShowEditColorModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa màu sắc</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-color-name">Tên màu</Label>
                                <Input
                                    id="edit-color-name"
                                    value={editColor.name}
                                    onChange={(e) =>
                                        setEditColor((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập tên màu"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-color-hex">Mã hex</Label>
                                <Input
                                    id="edit-color-hex"
                                    value={editColor.hexCode}
                                    onChange={(e) =>
                                        setEditColor((prev) => ({
                                            ...prev,
                                            hexCode: e.target.value,
                                        }))
                                    }
                                    placeholder="#FF0000"
                                />
                            </div>
                            {errors.some(
                                (err) => err.field === "editColor"
                            ) && (
                                <div className="text-red-500 text-sm">
                                    {errors
                                        .filter(
                                            (err) => err.field === "editColor"
                                        )
                                        .map((err, idx) => (
                                            <div key={idx}>{err.message}</div>
                                        ))}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowEditColorModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateColor}>
                                Cập nhật
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Feature Dialog */}
                <Dialog
                    open={showEditFeatureModal}
                    onOpenChange={setShowEditFeatureModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa tính năng</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-feature-name">
                                    Tên tính năng
                                </Label>
                                <Input
                                    id="edit-feature-name"
                                    value={editFeature.name}
                                    onChange={(e) =>
                                        setEditFeature((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập tên tính năng"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-feature-description">
                                    Mô tả
                                </Label>
                                <Textarea
                                    id="edit-feature-description"
                                    value={editFeature.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        setEditFeature((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập mô tả tính năng"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowEditFeatureModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateFeature}>
                                Cập nhật
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Instance Dialog */}
                <Dialog
                    open={showEditInstanceModal}
                    onOpenChange={setShowEditInstanceModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa thuộc tính</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-instance-name">
                                    Tên thuộc tính
                                </Label>
                                <Input
                                    id="edit-instance-name"
                                    value={editInstance.name}
                                    onChange={(e) =>
                                        setEditInstance((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập tên thuộc tính"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-instance-description">
                                    Mô tả
                                </Label>
                                <Textarea
                                    id="edit-instance-description"
                                    value={editInstance.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        setEditInstance((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập mô tả thuộc tính"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowEditInstanceModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateInstance}>
                                Cập nhật
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </div>
    );
};

export default EditProductPage;
