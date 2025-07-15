import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    XMarkIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Card,
    CardContent,
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
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { AdminProductService } from "@/services/adminProductService";
import {
    fetchAdminCategories,
    type Category,
} from "@/services/categoryService";
import { fetchAdminColors, type Color } from "@/services/colorService";
import { fetchAdminFeatures, type Feature } from "@/services/featureService";
import { fetchAdminInstances, type Instance } from "@/services/instanceService";

interface ProductPhoto {
    id?: number;
    imageUrl: string;
    alt: string;
}

interface ProductStock {
    id?: number;
    color: {
        id: number;
        name: string;
        hexCode: string;
    };
    quantity: number;
    price: number;
    productPhotos: ProductPhoto[];
    instanceProperties: Array<{
        id: number;
        name: string;
    }>;
}

interface ProductFormData {
    id?: number;
    name: string;
    description: string;
    category: {
        id: number;
        name?: string | null;
        image?: string | null;
    };
    features: Array<{
        id: number;
        name?: string | null;
        description?: string | null;
        image?: string | null;
    }>;
    stocks: ProductStock[];
}

const productService = new AdminProductService();

const SimpleEditProductPage: React.FC = () => {
    const { categoryId, id } = useParams<{ id: string; categoryId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        category: { id: 0 },
        features: [],
        stocks: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [instances, setInstances] = useState<Instance[]>([]);

    // Track photos to delete
    const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);

    // Track file uploads
    const [fileUploads, setFileUploads] = useState<{ [key: string]: File }>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Load supporting data
                const [categoriesRes, colorsRes, featuresRes, instancesRes] =
                    await Promise.all([
                        fetchAdminCategories({ size: 1000 }),
                        fetchAdminColors(),
                        fetchAdminFeatures(),
                        fetchAdminInstances(),
                    ]);

                setCategories(
                    Array.isArray(categoriesRes)
                        ? categoriesRes
                        : Array.isArray(
                              (categoriesRes as { data?: Category[] })?.data
                          )
                        ? (categoriesRes as { data: Category[] }).data
                        : []
                );
                setColors(Array.isArray(colorsRes.data) ? colorsRes.data : []);
                setFeatures(
                    Array.isArray(featuresRes.data) ? featuresRes.data : []
                );
                setInstances(
                    Array.isArray(instancesRes.data) ? instancesRes.data : []
                );

                // Load product data
                if (id && categoryId) {
                    const productRes = await productService.getAdminProductById(
                        parseInt(categoryId),
                        parseInt(id)
                    );

                    if (productRes.data) {
                        const product = productRes.data;
                        setFormData({
                            id: product.id,
                            name: product.name,
                            description: product.description || "",
                            category: {
                                id: product.category?.id || 0,
                                name: product.category?.name || null,
                                image: null,
                            },
                            features:
                                product.features?.map((f) => ({
                                    id: f.id,
                                    name: null,
                                    description: null,
                                    image: null,
                                })) || [],
                            stocks:
                                product.stocks?.map((stock) => ({
                                    id: stock.id,
                                    color: {
                                        id: stock.color.id,
                                        name: stock.color.name,
                                        hexCode: stock.color.hex, // Convert hex to hexCode
                                    },
                                    quantity: stock.quantity,
                                    price: stock.price,
                                    productPhotos: (stock.photos || []).map(
                                        (photo, index) => ({
                                            id: undefined, // photos are strings, no ID
                                            imageUrl:
                                                typeof photo === "string"
                                                    ? photo
                                                    : "",
                                            alt: `Product image ${index + 1}`,
                                        })
                                    ),
                                    instanceProperties:
                                        stock.instanceProperties?.map(
                                            (prop) => ({
                                                id: prop.id,
                                                name: prop.name,
                                            })
                                        ) || [],
                                })) || [],
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);

            // Prepare form data for multipart request
            const formDataToSend = new FormData();

            // Add product JSON data
            const productData = {
                name: formData.name,
                description: formData.description,
                category: {
                    id: formData.category.id,
                    name: null,
                    image: null,
                },
                features: formData.features.map((f) => ({
                    id: f.id,
                    name: null,
                    description: null,
                    image: null,
                })),
                stocks: formData.stocks.map((stock) => ({
                    id: stock.id,
                    color: {
                        id: stock.color.id,
                        name: stock.color.name,
                        hexCode: stock.color.hexCode,
                    },
                    quantity: stock.quantity,
                    price: stock.price,
                    productPhotos: stock.productPhotos.map((photo) => ({
                        id: photo.id,
                        imageUrl: photo.imageUrl,
                        alt: photo.alt,
                    })),
                    instanceProperties: stock.instanceProperties.map(
                        (prop) => ({
                            id: prop.id,
                            name: prop.name,
                        })
                    ),
                })),
            };

            formDataToSend.append("product", JSON.stringify(productData));

            // Add file uploads
            Object.entries(fileUploads).forEach(([key, file]) => {
                formDataToSend.append(key, file);
            });

            // Add photo deletions
            formDataToSend.append(
                "productPhotoDeletions",
                JSON.stringify(photosToDelete)
            );

            // Send request
            const response = await fetch(
                `http://localhost:8080/api/v1/admin/products/${categoryId}/${id}`,
                {
                    method: "PUT",
                    body: formDataToSend,
                    headers: {
                        Authorization: `${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.ok) {
                navigate("/admin/products");
            } else {
                throw new Error("Failed to update product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setSaving(false);
        }
    };

    const addStock = () => {
        setFormData((prev) => ({
            ...prev,
            stocks: [
                ...prev.stocks,
                {
                    color: { id: 0, name: "", hexCode: "" },
                    quantity: 0,
                    price: 0,
                    productPhotos: [],
                    instanceProperties: [],
                },
            ],
        }));
    };

    const removeStock = (index: number) => {
        const stock = formData.stocks[index];
        // Add photos to deletion list
        if (stock.productPhotos) {
            const photoIds = stock.productPhotos
                .filter((photo) => photo.id)
                .map((photo) => photo.id!);
            setPhotosToDelete((prev) => [...prev, ...photoIds]);
        }

        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.filter((_, i) => i !== index),
        }));
    };

    const updateStock = (
        index: number,
        field: keyof ProductStock,
        value: ProductStock[keyof ProductStock]
    ) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === index ? { ...stock, [field]: value } : stock
            ),
        }));
    };

    const updateStockColor = (index: number, color: Color) => {
        if (color.id === null) return;

        const stockColor = {
            id: color.id,
            name: color.name,
            hexCode: color.hexCode,
        };

        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === index ? { ...stock, color: stockColor } : stock
            ),
        }));
    };

    const addInstancePropertyToStock = (
        stockIndex: number,
        instance: Instance
    ) => {
        if (instance.id === null) return;

        const newInstanceProperty = {
            id: instance.id,
            name: instance.name,
        };

        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === stockIndex
                    ? {
                          ...stock,
                          instanceProperties: [
                              ...stock.instanceProperties,
                              newInstanceProperty,
                          ],
                      }
                    : stock
            ),
        }));
    };

    const removeInstancePropertyFromStock = (
        stockIndex: number,
        instancePropertyIndex: number
    ) => {
        setFormData((prev) => ({
            ...prev,
            stocks: prev.stocks.map((stock, i) =>
                i === stockIndex
                    ? {
                          ...stock,
                          instanceProperties: stock.instanceProperties.filter(
                              (_, propIndex) =>
                                  propIndex !== instancePropertyIndex
                          ),
                      }
                    : stock
            ),
        }));
    };

    const addPhoto = (stockIndex: number) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const fileKey = `stock_${stockIndex}_photo_${Date.now()}`;
                setFileUploads((prev) => ({ ...prev, [fileKey]: file }));

                // Add placeholder to productPhotos
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    updateStock(stockIndex, "productPhotos", [
                        ...formData.stocks[stockIndex].productPhotos,
                        { imageUrl, alt: file.name },
                    ]);
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };

    const removePhoto = (stockIndex: number, photoIndex: number) => {
        const photo = formData.stocks[stockIndex].productPhotos[photoIndex];
        if (photo.id) {
            setPhotosToDelete((prev) => [...prev, photo.id!]);
        }

        const updatedPhotos = formData.stocks[stockIndex].productPhotos.filter(
            (_, i) => i !== photoIndex
        );
        updateStock(stockIndex, "productPhotos", updatedPhotos);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên sản phẩm *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Mô tả</Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-input rounded-md"
                            />
                        </div>

                        <div>
                            <Label>Danh mục *</Label>
                            <Select
                                value={formData.category.id.toString()}
                                onValueChange={(value) => {
                                    const category = Array.isArray(categories)
                                        ? categories.find(
                                              (c) =>
                                                  c.id &&
                                                  c.id.toString() === value
                                          )
                                        : null;
                                    if (category && category.id !== null) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            category: {
                                                id: category.id!,
                                                name: category.name,
                                                image: null,
                                            },
                                        }));
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(categories) &&
                                        categories
                                            .filter((c) => c.id !== null)
                                            .map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id!.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Tính năng</CardTitle>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        features: [
                                            ...prev.features,
                                            {
                                                id: 0,
                                                name: null,
                                                description: null,
                                                image: null,
                                            },
                                        ],
                                    }));
                                }}
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Thêm tính năng
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {formData.features.length > 0 ? (
                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                    >
                                        <Select
                                            value={feature.id.toString()}
                                            onValueChange={(value) => {
                                                const selectedFeature =
                                                    Array.isArray(features)
                                                        ? features.find(
                                                              (f) =>
                                                                  f.id &&
                                                                  f.id.toString() ===
                                                                      value
                                                          )
                                                        : null;
                                                if (
                                                    selectedFeature &&
                                                    selectedFeature.id !== null
                                                ) {
                                                    const updatedFeatures = [
                                                        ...formData.features,
                                                    ];
                                                    updatedFeatures[index] = {
                                                        id: selectedFeature.id,
                                                        name: null,
                                                        description: null,
                                                        image: null,
                                                    };
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        features:
                                                            updatedFeatures,
                                                    }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Chọn tính năng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(features) &&
                                                    features
                                                        .filter(
                                                            (f) => f.id !== null
                                                        )
                                                        .map((feat) => (
                                                            <SelectItem
                                                                key={feat.id}
                                                                value={feat.id!.toString()}
                                                            >
                                                                {feat.name}
                                                            </SelectItem>
                                                        ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    features:
                                                        prev.features.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        ),
                                                }));
                                            }}
                                        >
                                            <XMarkIcon className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Chưa có tính năng nào
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Stocks */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Kho hàng</CardTitle>
                            <Button type="button" size="sm" onClick={addStock}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Thêm màu sắc
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {formData.stocks.length > 0 ? (
                            <div className="space-y-4">
                                {formData.stocks.map((stock, index) => (
                                    <Card
                                        key={index}
                                        className="border-l-4 border-l-blue-500"
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="secondary">
                                                    Màu sắc #{index + 1}
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeStock(index)
                                                    }
                                                >
                                                    <TrashIcon className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <Label>Màu sắc</Label>
                                                    <Select
                                                        value={stock.color.id.toString()}
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            const color =
                                                                colors.find(
                                                                    (c) =>
                                                                        c.id &&
                                                                        c.id.toString() ===
                                                                            value
                                                                );
                                                            if (
                                                                color &&
                                                                color.id !==
                                                                    null
                                                            ) {
                                                                updateStockColor(
                                                                    index,
                                                                    color
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn màu" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {colors
                                                                .filter(
                                                                    (c) =>
                                                                        c.id !==
                                                                        null
                                                                )
                                                                .map(
                                                                    (color) => (
                                                                        <SelectItem
                                                                            key={
                                                                                color.id
                                                                            }
                                                                            value={color.id!.toString()}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <div
                                                                                    className="w-3 h-3 rounded-full border"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            color.hexCode,
                                                                                    }}
                                                                                />
                                                                                {
                                                                                    color.name
                                                                                }
                                                                            </div>
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Số lượng</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stock.quantity}
                                                        onChange={(e) =>
                                                            updateStock(
                                                                index,
                                                                "quantity",
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Giá (VND)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stock.price}
                                                        onChange={(e) =>
                                                            updateStock(
                                                                index,
                                                                "price",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label>
                                                        Thuộc tính sản phẩm
                                                    </Label>
                                                    <div className="space-y-2">
                                                        <Select
                                                            value=""
                                                            onValueChange={(
                                                                value
                                                            ) => {
                                                                const instance =
                                                                    Array.isArray(
                                                                        instances
                                                                    )
                                                                        ? instances.find(
                                                                              (
                                                                                  i
                                                                              ) =>
                                                                                  i.id &&
                                                                                  i.id.toString() ===
                                                                                      value
                                                                          )
                                                                        : null;
                                                                if (
                                                                    instance &&
                                                                    instance.id !==
                                                                        null
                                                                ) {
                                                                    // Check if this instance is already added
                                                                    const isAlreadyAdded =
                                                                        stock.instanceProperties.some(
                                                                            (
                                                                                prop
                                                                            ) =>
                                                                                prop.id ===
                                                                                instance.id
                                                                        );
                                                                    if (
                                                                        !isAlreadyAdded
                                                                    ) {
                                                                        addInstancePropertyToStock(
                                                                            index,
                                                                            instance
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Thêm thuộc tính" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.isArray(
                                                                    instances
                                                                ) &&
                                                                    instances
                                                                        .filter(
                                                                            (
                                                                                i
                                                                            ) =>
                                                                                i.id !==
                                                                                null
                                                                        )
                                                                        .filter(
                                                                            (
                                                                                i
                                                                            ) =>
                                                                                !stock.instanceProperties.some(
                                                                                    (
                                                                                        prop
                                                                                    ) =>
                                                                                        prop.id ===
                                                                                        i.id
                                                                                )
                                                                        )
                                                                        .map(
                                                                            (
                                                                                instance
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        instance.id
                                                                                    }
                                                                                    value={instance.id!.toString()}
                                                                                >
                                                                                    {
                                                                                        instance.name
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                            </SelectContent>
                                                        </Select>

                                                        {stock
                                                            .instanceProperties
                                                            .length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {stock.instanceProperties.map(
                                                                    (
                                                                        instanceProp,
                                                                        propIndex
                                                                    ) => (
                                                                        <Badge
                                                                            key={`${instanceProp.id}-${propIndex}`}
                                                                            variant="secondary"
                                                                            className="flex items-center gap-1 text-xs"
                                                                        >
                                                                            {
                                                                                instanceProp.name
                                                                            }
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-auto p-0 hover:bg-transparent"
                                                                                onClick={() =>
                                                                                    removeInstancePropertyFromStock(
                                                                                        index,
                                                                                        propIndex
                                                                                    )
                                                                                }
                                                                            >
                                                                                <XMarkIcon className="w-3 h-3 text-gray-500 hover:text-red-500" />
                                                                            </Button>
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Photos */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label>Hình ảnh</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            addPhoto(index)
                                                        }
                                                    >
                                                        <PlusIcon className="w-4 h-4 mr-1" />
                                                        Thêm ảnh
                                                    </Button>
                                                </div>

                                                {stock.productPhotos.length >
                                                0 ? (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {stock.productPhotos.map(
                                                            (
                                                                photo,
                                                                photoIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        photoIndex
                                                                    }
                                                                    className="relative group"
                                                                >
                                                                    <img
                                                                        src={
                                                                            photo.imageUrl
                                                                        }
                                                                        alt={
                                                                            photo.alt
                                                                        }
                                                                        className="w-full h-20 object-cover rounded border"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() =>
                                                                            removePhoto(
                                                                                index,
                                                                                photoIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        <XMarkIcon className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">
                                                        Chưa có hình ảnh
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Chưa có màu sắc nào
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SimpleEditProductPage;
