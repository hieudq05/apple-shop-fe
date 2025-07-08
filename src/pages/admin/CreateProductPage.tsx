import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Plus,
    Palette,
    Tag,
    X,
    Upload,
    Trash2,
    Save,
    AlertCircle,
    ImageIcon
} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {cn} from "@/lib/utils";
import {type Category, fetchAdminCategories} from '@/services/categoryService.ts';
import {type Feature, fetchAdminFeatures} from '@/services/featureService.ts';
import {type Color, fetchAdminColors} from '@/services/colorService.ts';
import {fetchAdminInstances, type Instance} from '@/services/instanceService.ts';
import adminProductService from "@/services/adminProductService.ts";

interface ProductPhoto {
    imageUrl: string;
    alt: string;
}

interface InstanceProperty {
    id: number | null;
    name: string;
}

interface Stock {
    color: {
        id: number | null;
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
    const createdBy = JSON.parse(localStorage.getItem('userData') || '{}').email;

    // Step management for wizard
    const [currentStep, setCurrentStep] = useState<number>(0);
    const steps = [
        {title: 'Thông tin cơ bản', icon: <FileText className="w-5 h-5"/>},
        {title: 'Tính năng', icon: <Tag className="w-5 h-5"/>},
        {title: 'Màu sắc & Phiên bản', icon: <Palette className="w-5 h-5"/>},
        {title: 'Xem trước & Hoàn tất', icon: <Check className="w-5 h-5"/>}
    ];

    // Errors grouped by step
    const [stepErrors, setStepErrors] = useState<{ [key: number]: ErrorData[] }>({
        0: [],  // Basic info errors
        1: [],  // Feature errors
        2: [],  // Stock errors
        3: []   // Final overview errors
    });

    // Confirm submission state
    const [showConfirmSubmission, setShowConfirmSubmission] = useState<boolean>(false);

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState<{ name: string, file: File | null }>({
        name: '',
        file: null
    });

    // Feature state
    const [predefinedFeatures, setPredefinedFeatures] = useState<Feature[]>([]);
    const [showCreateFeatureModal, setShowCreateFeatureModal] = useState(false);
    const [newFeature, setNewFeature] = useState<{ name: string, description: string, file: File | null }>({
        name: '',
        description: '',
        file: null
    });

    // Color state
    const [predefinedColors, setPredefinedColors] = useState<Color[]>([]);
    const [showCreateColorModal, setShowCreateColorModal] = useState(false);
    const [newColor, setNewColor] = useState<{ name: string, hexCode: string }>({
        name: '',
        hexCode: ''
    });

    // Instance state
    const [predefinedInstances, setPredefinedInstances] = useState<Instance[]>([]);
    const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
    const [newInstance, setNewInstance] = useState<{ name: string, description: string }>({
        name: '',
        description: ''
    });

    // Loading states for creating new entities
    const [colorLoading, setColorLoading] = useState(false);
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
            features: [...prev.features, {id: null, name: '', description: '', image: ''}]
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
        newFeatures[index] = {...newFeatures[index], [field]: value};
        setFormData(prev => ({...prev, features: newFeatures}));
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
            stocks: [...prev.stocks, {
                color: {id: null, name: '', hexCode: ''},
                quantity: 0,
                price: 0,
                productPhotos: [],
                instanceProperties: []
            }]
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

    const updateStock = (stockIndex: number, field: keyof Stock, value: string | number | {
        name: string;
        hexCode: string;
    } | ProductPhoto[] | InstanceProperty[]) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex] = {...newStocks[stockIndex], [field]: value};
        setFormData(prev => ({...prev, stocks: newStocks}));
    };

    const handleStockPhotoChange = (stockIndex: number, photoIndex: number, file: File) => {
        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex][photoIndex] = file;
        setStockPhotoFiles(newStockPhotoFiles);

        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos[photoIndex].imageUrl = `placeholder_stock_${stockIndex}_${photoIndex}`;
        setFormData(prev => ({...prev, stocks: newStocks}));
    };

    const addStockPhoto = (stockIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos.push({imageUrl: '', alt: ''});
        setFormData(prev => ({...prev, stocks: newStocks}));

        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex].push(new File([], ''));
        setStockPhotoFiles(newStockPhotoFiles);
    };

    const removeStockPhoto = (stockIndex: number, photoIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].productPhotos = newStocks[stockIndex].productPhotos.filter((_, i) => i !== photoIndex);
        setFormData(prev => ({...prev, stocks: newStocks}));

        const newStockPhotoFiles = [...stockPhotoFiles];
        newStockPhotoFiles[stockIndex] = newStockPhotoFiles[stockIndex].filter((_, i) => i !== photoIndex);
        setStockPhotoFiles(newStockPhotoFiles);
    };

    const addInstanceProperty = (stockIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties.push({id: null, name: ''});
        setFormData(prev => ({...prev, stocks: newStocks}));
    };

    const removeInstanceProperty = (stockIndex: number, propIndex: number) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties = newStocks[stockIndex].instanceProperties.filter((_, i) => i !== propIndex);
        setFormData(prev => ({...prev, stocks: newStocks}));
    };

    const updateInstanceProperty = (stockIndex: number, propIndex: number, name: string) => {
        const newStocks = [...formData.stocks];
        newStocks[stockIndex].instanceProperties[propIndex].name = name;
        setFormData(prev => ({...prev, stocks: newStocks}));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic before submission
        const validationErrors: ErrorData[] = [];

        // Validate basic product information
        if (!formData.name.trim()) {
            validationErrors.push({field: 'name', message: 'Tên sản phẩm không được để trống'});
        }

        if (!formData.description.trim()) {
            validationErrors.push({field: 'description', message: 'Mô tả sản phẩm không được để trống'});
        }

        // Validate features
        formData.features.forEach((feature, index) => {
            if (!feature.name.trim()) {
                validationErrors.push({
                    field: `features[${index}].name`,
                    message: `Tên tính năng #${index + 1} không được để trống`
                });
            }

            if (!feature.description.trim()) {
                validationErrors.push({
                    field: `features[${index}].description`,
                    message: `Mô tả tính năng #${index + 1} không được để trống`
                });
            }

            // Check if feature image file exists
            if (feature.image.startsWith('placeholder_') && (!featureFiles[index] || featureFiles[index].size === 0)) {
                validationErrors.push({
                    field: `features[${index}].image`,
                    message: `Ảnh tính năng #${index + 1} chưa được chọn`
                });
            }
        });

        // Validate stocks
        if (formData.stocks.length === 0) {
            validationErrors.push({field: 'stocks', message: 'Sản phẩm cần có ít nhất một phiên bản màu sắc'});
        }

        formData.stocks.forEach((stock, stockIndex) => {
            if (!stock.color.name.trim()) {
                validationErrors.push({
                    field: `stocks[${stockIndex}].color.name`,
                    message: `Tên màu #${stockIndex + 1} không được để trống`
                });
            }

            if (!stock.color.hexCode.trim()) {
                validationErrors.push({
                    field: `stocks[${stockIndex}].color.hexCode`,
                    message: `Mã hex màu #${stockIndex + 1} không được để trống`
                });
            }

            if (stock.quantity <= 0) {
                validationErrors.push({
                    field: `stocks[${stockIndex}].quantity`,
                    message: `Số lượng cho màu #${stockIndex + 1} phải lớn hơn 0`
                });
            }

            if (stock.price <= 0) {
                validationErrors.push({
                    field: `stocks[${stockIndex}].price`,
                    message: `Giá cho màu #${stockIndex + 1} phải lớn hơn 0`
                });
            }

            // Validate product photos
            if (stock.productPhotos.length === 0) {
                validationErrors.push({
                    field: `stocks[${stockIndex}].productPhotos`,
                    message: `Màu #${stockIndex + 1} cần có ít nhất một ảnh sản phẩm`
                });
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
            document.querySelector('.bg-red-50')?.scrollIntoView({behavior: 'smooth'});
            return;
        }

        setIsLoading(true);

        // Create the product data object with proper structure
        const productData = {
            name: formData.name,
            description: formData.description,
            createdBy: createdBy,
            category: {
                id: formData.category.id,
                name: formData.category.name,
                image: formData.category.image
            },
            features: formData.features.map(feature => ({
                id: feature.id,
                name: feature.name,
                description: feature.description,
                image: feature.image
            })),
            stocks: formData.stocks.map(stock => ({
                color: {
                    id: stock.color.id,
                    name: stock.color.name,
                    hexCode: stock.color.hexCode,
                },
                quantity: stock.quantity,
                price: stock.price,
                productPhotos: stock.productPhotos.map(photo => ({
                    imageUrl: photo.imageUrl,
                    alt: photo.alt,
                })),
                instanceProperties: stock.instanceProperties.map(prop => ({
                    id: prop.id,
                    name: prop.name,
                })),
            })),
        };

        // Collect all image files with their placeholder keys
        const imageFiles: { [key: string]: File } = {};

        // Add feature images
        formData.features.forEach((feature, index) => {
            if (feature.image.startsWith('placeholder_') && featureFiles[index] && featureFiles[index].size > 0) {
                imageFiles[feature.image] = featureFiles[index];
            }
        });

        // Add product photos
        formData.stocks.forEach((stock, stockIndex) => {
            stock.productPhotos.forEach((photo, photoIndex) => {
                if (photo.imageUrl.startsWith('placeholder_') &&
                    stockPhotoFiles[stockIndex] && stockPhotoFiles[stockIndex][photoIndex]) {
                    imageFiles[photo.imageUrl] = stockPhotoFiles[stockIndex][photoIndex];
                }
            });
        });

        try {
            const response = await adminProductService.createProduct(productData, imageFiles);

            if (response.success) {
                alert(response.message);
                navigate('/admin/products');
            } else {
                setErrors([{field: 'general', message: response.message}]);
            }
        } catch (error: any) {
            console.error('Error creating product:', error);
            setErrors([{field: 'general', message: 'Có lỗi xảy ra khi tạo sản phẩm'}]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories on component mount
    // useEffect(() => {
    //     const params = {
    //         size: 1000,
    //     }
    //
    //     const loadCategories = async () => {
    //         try {
    //             const categoriesData = await fetchAdminCategories(
    //                     params
    //                 )
    //             ;
    //             setCategories(categoriesData);
    //
    //             // Nếu có categories, đặt category đầu tiên làm mặc định
    //             if (categoriesData && categoriesData.length > 0) {
    //                 setFormData(prev => ({
    //                     ...prev,
    //                     category: categoriesData[0]
    //                 }));
    //             }
    //         } catch (error) {
    //             console.error('Error fetching categories:', error);
    //             setErrors([{field: 'categories', message: 'Không thể tải danh mục sản phẩm'}]);
    //         }
    //     };
    //
    //     loadCategories();
    // }, []);

    // Fetch features, colors, and instances on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                //Load categories
                const categoriesData = await fetchAdminCategories();
                setCategories(categoriesData.data);

                // Nếu có categories, đặt category đầu tiên làm mặc định
                if (categoriesData.data && categoriesData.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        category: categoriesData.data[0]
                    }));
                }

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
                    {field: 'dataLoading', message: 'Không thể tải dữ liệu tính năng, màu sắc hoặc phiên bản'}
                ]);
            }
        };

        loadData();
    }, []);

    const validateStep = (step: number): boolean => {
        let errors: ErrorData[] = [];

        if (step === 0) {
            // Validate basic information
            if (!formData.name.trim()) {
                errors.push({field: 'name', message: 'Tên sản phẩm không được để trống'});
            } else if (formData.name.trim().length < 3) {
                errors.push({field: 'name', message: 'Tên sản phẩm phải có ít nhất 3 ký tự'});
            }

            if (!formData.category || !formData.category.id) {
                errors.push({field: 'category', message: 'Danh mục không được để trống'});
            }

            if (!formData.description.trim()) {
                errors.push({field: 'description', message: 'Mô tả sản phẩm không được để trống'});
            } else if (formData.description.trim().length < 10) {
                errors.push({field: 'description', message: 'Mô tả sản phẩm phải có ít nhất 10 ký tự'});
            }

        } else if (step === 1) {
            // Validate features
            if (formData.features.length === 0) {
                errors.push({field: 'features', message: 'Sản phẩm phải có ít nhất 1 tính năng'});
            }

            formData.features.forEach((feature, index) => {
                if (!feature.name.trim()) {
                    errors.push({
                        field: `feature_name_${index}`,
                        message: `Tên tính năng #${index + 1} không được để trống`
                    });
                } else if (feature.name.trim().length < 2) {
                    errors.push({
                        field: `feature_name_${index}`,
                        message: `Tên tính năng #${index + 1} phải có ít nhất 2 ký tự`
                    });
                }

                if (!feature.description.trim()) {
                    errors.push({
                        field: `feature_description_${index}`,
                        message: `Mô tả tính năng #${index + 1} không được để trống`
                    });
                } else if (feature.description.trim().length < 5) {
                    errors.push({
                        field: `feature_description_${index}`,
                        message: `Mô tả tính năng #${index + 1} phải có ít nhất 5 ký tự`
                    });
                }

                // Validate feature image
                if (!feature.image || feature.image.trim() === '') {
                    errors.push({
                        field: `feature_image_${index}`,
                        message: `Tính năng #${index + 1} phải có ảnh minh họa`
                    });
                }
            });

        } else if (step === 2) {
            // Validate stocks
            if (formData.stocks.length === 0) {
                errors.push({field: 'stocks', message: 'Sản phẩm phải có ít nhất 1 phiên bản màu sắc'});
            }

            formData.stocks.forEach((stock, stockIndex) => {
                // Validate color
                if (!stock.color.name.trim()) {
                    errors.push({
                        field: `stock_color_name_${stockIndex}`,
                        message: `Tên màu #${stockIndex + 1} không được để trống`
                    });
                }

                if (!stock.color.hexCode.trim()) {
                    errors.push({
                        field: `stock_color_hex_${stockIndex}`,
                        message: `Mã hex màu #${stockIndex + 1} không được để trống`
                    });
                } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(stock.color.hexCode)) {
                    errors.push({
                        field: `stock_color_hex_${stockIndex}`,
                        message: `Mã hex màu #${stockIndex + 1} không hợp lệ (ví dụ: #FF0000)`
                    });
                }

                // Validate quantity
                if (!stock.quantity || stock.quantity <= 0) {
                    errors.push({
                        field: `stock_quantity_${stockIndex}`,
                        message: `Số lượng cho màu #${stockIndex + 1} phải lớn hơn 0`
                    });
                } else if (!Number.isInteger(stock.quantity)) {
                    errors.push({
                        field: `stock_quantity_${stockIndex}`,
                        message: `Số lượng cho màu #${stockIndex + 1} phải là số nguyên`
                    });
                }

                // Validate price
                if (!stock.price || stock.price <= 0) {
                    errors.push({
                        field: `stock_price_${stockIndex}`,
                        message: `Giá cho màu #${stockIndex + 1} phải lớn hơn 0`
                    });
                } else if (stock.price < 1000) {
                    errors.push({
                        field: `stock_price_${stockIndex}`,
                        message: `Giá cho màu #${stockIndex + 1} phải ít nhất 1,000 VND`
                    });
                }

                // Validate product photos
                if (!stock.productPhotos || stock.productPhotos.length === 0) {
                    errors.push({
                        field: `stock_photos_${stockIndex}`,
                        message: `Màu #${stockIndex + 1} phải có ít nhất 1 ảnh sản phẩm`
                    });
                } else {
                    stock.productPhotos.forEach((photo, photoIndex) => {
                        if (!photo.imageUrl || photo.imageUrl.trim() === '') {
                            errors.push({
                                field: `stock_photo_${stockIndex}_${photoIndex}`,
                                message: `Ảnh #${photoIndex + 1} của màu #${stockIndex + 1} chưa được chọn`
                            });
                        }

                        if (!photo.alt.trim()) {
                            errors.push({
                                field: `stock_photo_alt_${stockIndex}_${photoIndex}`,
                                message: `Alt text cho ảnh #${photoIndex + 1} của màu #${stockIndex + 1} không được để trống`
                            });
                        }
                    });
                }

                // Validate instance properties
                if (!stock.instanceProperties || stock.instanceProperties.length === 0) {
                    errors.push({
                        field: `stock_instances_${stockIndex}`,
                        message: `Màu #${stockIndex + 1} phải có ít nhất 1 thuộc tính phiên bản`
                    });
                } else {
                    stock.instanceProperties.forEach((instance, instanceIndex) => {
                        if (!instance.name.trim()) {
                            errors.push({
                                field: `stock_instance_${stockIndex}_${instanceIndex}`,
                                message: `Tên thuộc tính #${instanceIndex + 1} của màu #${stockIndex + 1} không được để trống`
                            });
                        }
                    });
                }
            });

        } else if (step === 3) {
            // Final validation - don't run recursive validation to avoid infinite loop
            // Instead, manually check key requirements

            // Check basic info
            if (!formData.name.trim()) {
                errors.push({field: 'name', message: 'Tên sản phẩm không được để trống'});
            }
            if (!formData.category?.id) {
                errors.push({field: 'category', message: 'Chưa chọn danh mục sản phẩm'});
            }
            if (!formData.description.trim()) {
                errors.push({field: 'description', message: 'Mô tả sản phẩm không được để trống'});
            }

            // Check features
            if (formData.features.length === 0) {
                errors.push({field: 'features', message: 'Sản phẩm phải có ít nhất 1 tính năng'});
            }

            // Check stocks
            if (formData.stocks.length === 0) {
                errors.push({field: 'stocks', message: 'Sản phẩm phải có ít nhất 1 phiên bản màu sắc'});
            }

            // Check total stock quantity
            const totalStocks = formData.stocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
            if (totalStocks === 0) {
                errors.push({
                    field: 'totalStock',
                    message: 'Tổng số lượng sản phẩm phải lớn hơn 0'
                });
            }

            // Check if any stock has missing required data
            let hasStockErrors = false;
            formData.stocks.forEach((stock, stockIndex) => {
                if (!stock.color.name.trim() || !stock.color.hexCode.trim() ||
                    stock.quantity <= 0 || stock.price <= 0 ||
                    stock.productPhotos.length === 0 || stock.instanceProperties.length === 0) {
                    hasStockErrors = true;
                }
            });

            if (hasStockErrors) {
                errors.push({
                    field: 'stocksIncomplete',
                    message: 'Một số phiên bản màu sắc chưa hoàn tất thông tin'
                });
            }
        }

        setStepErrors(prev => ({...prev, [step]: errors}));
        return errors.length === 0;
    };

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
    const handleCreateCategory = () => {
        // Kiểm tra dữ liệu đầu vào
        if (!newCategory.name.trim() || !newCategory.file) {
            alert('Vui lòng nhập tên danh mục và chọn ảnh.');
            return;
        }

        const createdCategory: Category = {
            id: null,
            name: newCategory.name,
            image: URL.createObjectURL(newCategory.file),
        };

        // Thêm category mới vào danh sách và chọn nó
        setCategories(prev => [...prev, createdCategory]);
        setFormData(prev => ({
            ...prev,
            category: createdCategory
        }));

        // Đóng modal và reset form
        setShowCreateCategoryModal(false);
        setNewCategory({name: '', file: null});
    };

    const handleCreateFeature = () => {
        if (!newFeature.name.trim()) {
            alert("Vui lòng nhập tên tính năng.");
            return;
        }

        const createdFeature: Feature = {
            id: null,
            name: newFeature.name,
            description: newFeature.description,
            image: newFeature.file ? URL.createObjectURL(newFeature.file) : '',
        };

        setPredefinedFeatures(prev => [...prev, createdFeature]);
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, createdFeature],
        }));

        setShowCreateFeatureModal(false);
        setNewFeature({name: '', description: '', file: null});
    };

    const handleCreateColor = () => {
        // Validation cho màu mới
        const colorErrors: ErrorData[] = [];

        if (!newColor.name.trim()) {
            colorErrors.push({field: 'newColor', message: 'Vui lòng nhập tên màu'});
        }

        if (!newColor.hexCode.trim()) {
            colorErrors.push({field: 'newColor', message: 'Vui lòng nhập mã hex'});
        } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor.hexCode)) {
            colorErrors.push({field: 'newColor', message: 'Mã hex không hợp lệ (ví dụ: #FF0000)'});
        }

        // Kiểm tra trùng lặp
        if (predefinedColors.some(color => color.name.toLowerCase() === newColor.name.toLowerCase())) {
            colorErrors.push({field: 'newColor', message: 'Tên màu đã tồn tại'});
        }

        if (colorErrors.length > 0) {
            setErrors(colorErrors);
            return;
        }

        setColorLoading(true);

        try {
            const createdColor: Color = {
                id: Date.now(), // Temporary ID
                name: newColor.name,
                hexCode: newColor.hexCode,
            };

            setPredefinedColors(prev => [...prev, createdColor]);
            setShowCreateColorModal(false);
            setNewColor({name: '', hexCode: ''});
            setErrors([]); // Clear errors on success
        } catch (error) {
            setErrors([{field: 'newColor', message: 'Có lỗi xảy ra khi tạo màu mới'}]);
        } finally {
            setColorLoading(false);
        }
    };

    const handleCreateInstance = () => {
        // Validation cho thuộc tính mới
        const instanceErrors: ErrorData[] = [];

        if (!newInstance.name.trim()) {
            instanceErrors.push({field: 'newInstance', message: 'Vui lòng nhập tên thuộc tính'});
        }

        // Kiểm tra trùng lặp
        if (predefinedInstances.some(instance => instance.name.toLowerCase() === newInstance.name.toLowerCase())) {
            instanceErrors.push({field: 'newInstance', message: 'Tên thuộc tính đã tồn tại'});
        }

        if (instanceErrors.length > 0) {
            setErrors(instanceErrors);
            return;
        }

        setInstanceLoading(true);

        try {
            const createdInstance: Instance = {
                id: Date.now(), // Temporary ID
                name: newInstance.name,
                description: newInstance.description,
            };

            setPredefinedInstances(prev => [...prev, createdInstance]);
            setShowCreateInstanceModal(false);
            setNewInstance({name: '', description: ''});
            setErrors([]); // Clear errors on success
        } catch (error) {
            setErrors([{field: 'newInstance', message: 'Có lỗi xảy ra khi tạo thuộc tính mới'}]);
        } finally {
            setInstanceLoading(false);
        }
    };

    // Function to get user-friendly field labels for error display
    const getErrorFieldLabel = (field: string): string => {
        const fieldLabels: { [key: string]: string } = {
            // Basic info fields
            'name': 'Tên sản phẩm',
            'category': 'Danh mục sản phẩm',
            'description': 'Mô tả sản phẩm',

            // General fields
            'features': 'Danh sách tính năng',
            'stocks': 'Danh sách phiên bản màu sắc',
            'totalStock': 'Tổng số lượng sản phẩm',
            'finalValidation': 'Kiểm tra tổng thể',
        };

        // Handle feature fields
        if (field.startsWith('feature_name_')) {
            const index = field.split('_')[2];
            return `Tên tính năng #${parseInt(index) + 1}`;
        }
        if (field.startsWith('feature_description_')) {
            const index = field.split('_')[2];
            return `Mô tả tính năng #${parseInt(index) + 1}`;
        }
        if (field.startsWith('feature_image_')) {
            const index = field.split('_')[2];
            return `Ảnh tính năng #${parseInt(index) + 1}`;
        }

        // Handle stock color fields
        if (field.startsWith('stock_color_name_')) {
            const index = field.split('_')[3];
            return `Tên màu #${parseInt(index) + 1}`;
        }
        if (field.startsWith('stock_color_hex_')) {
            const index = field.split('_')[3];
            return `Mã hex màu #${parseInt(index) + 1}`;
        }

        // Handle stock quantity and price fields
        if (field.startsWith('stock_quantity_')) {
            const index = field.split('_')[2];
            return `Số lượng màu #${parseInt(index) + 1}`;
        }
        if (field.startsWith('stock_price_')) {
            const index = field.split('_')[2];
            return `Giá màu #${parseInt(index) + 1}`;
        }

        // Handle stock photos fields
        if (field.startsWith('stock_photos_')) {
            const index = field.split('_')[2];
            return `Ảnh sản phẩm màu #${parseInt(index) + 1}`;
        }
        if (field.startsWith('stock_photo_') && field.includes('_alt_')) {
            const parts = field.split('_');
            const stockIndex = parts[2];
            const photoIndex = parts[3];
            return `Alt text ảnh #${parseInt(photoIndex) + 1} màu #${parseInt(stockIndex) + 1}`;
        }
        if (field.startsWith('stock_photo_')) {
            const parts = field.split('_');
            const stockIndex = parts[2];
            const photoIndex = parts[3];
            return `Ảnh #${parseInt(photoIndex) + 1} màu #${parseInt(stockIndex) + 1}`;
        }

        // Handle stock instances fields
        if (field.startsWith('stock_instances_')) {
            const index = field.split('_')[2];
            return `Thuộc tính phiên bản màu #${parseInt(index) + 1}`;
        }
        if (field.startsWith('stock_instance_')) {
            const parts = field.split('_');
            const stockIndex = parts[2];
            const instanceIndex = parts[3];
            return `Thuộc tính #${parseInt(instanceIndex) + 1} màu #${parseInt(stockIndex) + 1}`;
        }

        // Return the field name from the map or the original field name if not found
        return fieldLabels[field] || field;
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/admin/products')}
                                    className="h-8 w-8 p-0"
                                >
                                    <ArrowLeft className="w-4 h-4"/>
                                </Button>
                                <div>
                                    <CardTitle className="text-2xl">Thêm sản phẩm mới</CardTitle>
                                    <CardDescription>
                                        Tạo sản phẩm mới cho cửa hàng với đầy đủ thông tin chi tiết
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                Bước {currentStep + 1} / {steps.length}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Progress Stepper */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between relative">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center relative z-10">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        currentStep === index
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : currentStep > index
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-background border-muted-foreground/20 text-muted-foreground",
                                        stepErrors[index]?.length > 0 && "border-red-500 bg-red-50"
                                    )}>
                                        {currentStep > index ? (
                                            <Check className="w-5 h-5"/>
                                        ) : stepErrors[index]?.length > 0 ? (
                                            <AlertCircle className="w-5 h-5 text-red-500"/>
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={cn(
                                            "text-sm font-medium transition-colors",
                                            currentStep === index ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            {step.title}
                                        </p>
                                        {stepErrors[index]?.length > 0 && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {stepErrors[index].length} lỗi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Progress line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{width: `${(currentStep / (steps.length - 1)) * 100}%`}}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    {/* Error Display Section */}
                    {stepErrors[currentStep]?.length > 0 && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-800 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5"/>
                                    Cần sửa {stepErrors[currentStep].length} lỗi trong bước này
                                </CardTitle>
                                <CardDescription className="text-red-600">
                                    Vui lòng sửa các lỗi dưới đây trước khi tiếp tục
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stepErrors[currentStep].map((error, index) => (
                                        <div key={index}
                                             className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"/>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-red-800">
                                                    {getErrorFieldLabel(error.field)}
                                                </p>
                                                <p className="text-sm text-red-600 mt-1">
                                                    {error.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step Content */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {steps[currentStep].icon}
                                {steps[currentStep].title}
                            </CardTitle>
                            <CardDescription>
                                {currentStep === 0 && "Nhập thông tin cơ bản về sản phẩm"}
                                {currentStep === 1 && "Thêm các tính năng nổi bật của sản phẩm"}
                                {currentStep === 2 && "Thiết lập các phiên bản màu sắc và kho hàng"}
                                {currentStep === 3 && "Xem lại thông tin và hoàn tất việc tạo sản phẩm"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Tên sản phẩm *</Label>
                                            <Input
                                                id="name"
                                                placeholder="iPhone 15 Pro Max"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    setFormData(prev => ({...prev, name: e.target.value}));
                                                    // Real-time validation
                                                    const errors = stepErrors[0].filter(err => err.field !== 'name');
                                                    if (!e.target.value.trim()) {
                                                        errors.push({
                                                            field: 'name',
                                                            message: 'Tên sản phẩm không được để trống'
                                                        });
                                                    }
                                                    setStepErrors(prev => ({...prev, 0: errors}));
                                                }}
                                                className={cn(
                                                    stepErrors[0]?.some(err => err.field === 'name') && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                            />
                                            {stepErrors[0]?.filter(error => error.field === 'name').map((error, idx) => (
                                                <p key={idx} className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {error.message}
                                                </p>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Danh mục *</Label>
                                            <div className="flex gap-2">
                                                <Select
                                                    value={formData.category?.id?.toString() || ""}
                                                    onValueChange={(value) => {
                                                        const selectedCategory = categories.find(cat => cat.id?.toString() === value);
                                                        if (selectedCategory) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                category: selectedCategory
                                                            }));
                                                            // Real-time validation
                                                            const errors = stepErrors[0].filter(err => err.field !== 'category');
                                                            setStepErrors(prev => ({...prev, 0: errors}));
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={cn(
                                                        stepErrors[0]?.some(err => err.field === 'category') && "border-red-500"
                                                    )}>
                                                        <SelectValue placeholder="Chọn danh mục"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories?.map((category) => (
                                                            <SelectItem key={category.id}
                                                                        value={category.id?.toString() || ""}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setShowCreateCategoryModal(true)}
                                                >
                                                    <Plus className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                            {stepErrors[0]?.filter(error => error.field === 'category').map((error, idx) => (
                                                <p key={idx} className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {error.message}
                                                </p>
                                            ))}
                                            {formData.category?.id && (
                                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                                    {formData.category.image && (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={formData.category.image}/>
                                                            <AvatarFallback>{formData.category.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm">{formData.category.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Mô tả sản phẩm *</Label>
                                        <textarea
                                            id="description"
                                            placeholder="Mô tả chi tiết về sản phẩm..."
                                            value={formData.description}
                                            onChange={(e) => {
                                                setFormData(prev => ({...prev, description: e.target.value}));
                                                // Real-time validation
                                                const errors = stepErrors[0].filter(err => err.field !== 'description');
                                                if (!e.target.value.trim()) {
                                                    errors.push({
                                                        field: 'description',
                                                        message: 'Mô tả sản phẩm không được để trống'
                                                    });
                                                }
                                                setStepErrors(prev => ({...prev, 0: errors}));
                                            }}
                                            rows={4}
                                            className={cn(
                                                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                stepErrors[0]?.some(err => err.field === 'description') && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                        />
                                        {stepErrors[0]?.filter(error => error.field === 'description').map((error, idx) => (
                                            <p key={idx} className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4"/>
                                                {error.message}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Features Step */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Select onValueChange={(value) => {
                                                if (value === "create-new") {
                                                    setShowCreateFeatureModal(true);
                                                    return;
                                                }
                                                const featureId = parseInt(value);
                                                const selectedFeature = predefinedFeatures.find(f => f.id === featureId);
                                                if (selectedFeature && !formData.features.some(f => f.id === featureId)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        features: [...prev.features, selectedFeature]
                                                    }));
                                                    setFeatureFiles(prev => [...prev, new File([], '')]);
                                                }
                                            }}>
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Chọn tính năng có sẵn"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {predefinedFeatures?.map((feature) => (
                                                        <SelectItem key={feature.id}
                                                                    value={feature.id?.toString() || ""}>
                                                            {feature.name}
                                                        </SelectItem>
                                                    ))}
                                                    <Separator/>
                                                    <SelectItem value="create-new">
                                                        <div className="flex items-center gap-2">
                                                            <Plus className="w-4 h-4"/>
                                                            Tạo tính năng mới
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addFeature}
                                            >
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Thêm tính năng
                                            </Button>
                                        </div>
                                    </div>

                                    {formData.features.length === 0 ? (
                                        <Card>
                                            <CardContent
                                                className="flex flex-col items-center justify-center py-16 text-center">
                                                <Tag className="w-12 h-12 text-muted-foreground mb-4"/>
                                                <h3 className="text-lg font-medium mb-2">Chưa có tính năng nào</h3>
                                                <p className="text-muted-foreground mb-4">
                                                    Thêm các tính năng nổi bật của sản phẩm để thu hút khách hàng
                                                </p>
                                                <Button variant="outline" onClick={addFeature}>
                                                    <Plus className="w-4 h-4 mr-2"/>
                                                    Thêm tính năng đầu tiên
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.features.map((feature, index) => (
                                                <Card key={index}>
                                                    <CardHeader>
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-lg">Tính năng
                                                                #{index + 1}</CardTitle>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFeature(index)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Tên tính năng *</Label>
                                                                <Input
                                                                    placeholder="Camera ProRAW"
                                                                    value={feature.name}
                                                                    onChange={(e) => {
                                                                        updateFeature(index, 'name', e.target.value);
                                                                        // Real-time validation
                                                                        const errors = stepErrors[1].filter(err => err.field !== `feature_name_${index}`);
                                                                        if (!e.target.value.trim()) {
                                                                            errors.push({
                                                                                field: `feature_name_${index}`,
                                                                                message: `Tên tính năng #${index + 1} không được để trống`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 1: errors}));
                                                                    }}
                                                                    disabled={feature.id !== null}
                                                                    className={cn(
                                                                        stepErrors[1]?.some(err => err.field === `feature_name_${index}`) && "border-red-500"
                                                                    )}
                                                                />
                                                                {stepErrors[1]?.filter(error => error.field === `feature_name_${index}`).map((error, idx) => (
                                                                    <p key={idx}
                                                                       className="text-sm text-red-500 flex items-center gap-1">
                                                                        <AlertCircle className="w-4 h-4"/>
                                                                        {error.message}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Mô tả *</Label>
                                                                <Input
                                                                    placeholder="Chụp ảnh chất lượng chuyên nghiệp"
                                                                    value={feature.description}
                                                                    onChange={(e) => {
                                                                        updateFeature(index, 'description', e.target.value);
                                                                        // Real-time validation
                                                                        const errors = stepErrors[1].filter(err => err.field !== `feature_description_${index}`);
                                                                        if (!e.target.value.trim()) {
                                                                            errors.push({
                                                                                field: `feature_description_${index}`,
                                                                                message: `Mô tả tính năng #${index + 1} không được để trống`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 1: errors}));
                                                                    }}
                                                                    disabled={feature.id !== null}
                                                                    className={cn(
                                                                        stepErrors[1]?.some(err => err.field === `feature_description_${index}`) && "border-red-500"
                                                                    )}
                                                                />
                                                                {stepErrors[1]?.filter(error => error.field === `feature_description_${index}`).map((error, idx) => (
                                                                    <p key={idx}
                                                                       className="text-sm text-red-500 flex items-center gap-1">
                                                                        <AlertCircle className="w-4 h-4"/>
                                                                        {error.message}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Hình ảnh tính năng *</Label>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1">
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => e.target.files?.[0] && handleFeatureFileChange(index, e.target.files[0])}
                                                                        className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md"
                                                                    />
                                                                </div>
                                                                {feature.image && (
                                                                    <div
                                                                        className="w-20 h-20 border rounded-lg overflow-hidden bg-muted">
                                                                        <img
                                                                            src={feature.image.startsWith('placeholder_') ? '/placeholder-image.jpg' : feature.image}
                                                                            alt="Preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stocks Step */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    {/* Similar enhanced UI for stocks step */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Select onValueChange={(value) => {
                                                if (value === "create-new") {
                                                    setShowCreateColorModal(true);
                                                    return;
                                                }
                                                const colorId = parseInt(value);
                                                const selectedColor = predefinedColors.find(c => c.id === colorId);
                                                if (selectedColor && !formData.stocks.some(s => s.color.name === selectedColor.name)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        stocks: [...prev.stocks, {
                                                            color: selectedColor,
                                                            quantity: 0,
                                                            price: 0,
                                                            productPhotos: [],
                                                            instanceProperties: []
                                                        }]
                                                    }));
                                                    setStockPhotoFiles(prev => [...prev, []]);
                                                }
                                            }}>
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Chọn màu có sẵn"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {predefinedColors?.map((color) => (
                                                        <SelectItem key={color.id} value={color.id?.toString() || ""}>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-4 h-4 rounded-full border"
                                                                    style={{backgroundColor: color.hexCode}}
                                                                />
                                                                {color.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    <Separator/>
                                                    <SelectItem value="create-new">
                                                        <div className="flex items-center gap-2">
                                                            <Plus className="w-4 h-4"/>
                                                            Tạo màu mới
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addStock}
                                            >
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Thêm màu
                                            </Button>
                                        </div>
                                    </div>

                                    {formData.stocks.length === 0 ? (
                                        <Card>
                                            <CardContent
                                                className="flex flex-col items-center justify-center py-16 text-center">
                                                <Palette className="w-12 h-12 text-muted-foreground mb-4"/>
                                                <h3 className="text-lg font-medium mb-2">Chưa có phiên bản màu nào</h3>
                                                <p className="text-muted-foreground mb-4">
                                                    Thêm các phiên bản màu sắc với giá và số lượng tương ứng
                                                </p>
                                                <Button variant="outline" onClick={addStock}>
                                                    <Plus className="w-4 h-4 mr-2"/>
                                                    Thêm màu đầu tiên
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.stocks.map((stock, stockIndex) => (
                                                <Card key={stockIndex}>
                                                    <CardHeader>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-6 h-6 rounded-full border-2 border-border"
                                                                    style={{backgroundColor: stock.color.hexCode || '#gray'}}
                                                                />
                                                                <CardTitle className="text-lg">
                                                                    {stock.color.name || `Màu sắc #${stockIndex + 1}`}
                                                                </CardTitle>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeStock(stockIndex)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        {/* Color and pricing info */}
                                                        <div
                                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Tên màu *</Label>
                                                                <Input
                                                                    placeholder="Space Black"
                                                                    value={stock.color.name}
                                                                    onChange={(e) => {
                                                                        updateStock(stockIndex, 'color', {
                                                                            ...stock.color,
                                                                            name: e.target.value
                                                                        });
                                                                        // Real-time validation
                                                                        const errors = stepErrors[2].filter(err => err.field !== `stock_color_name_${stockIndex}`);
                                                                        if (!e.target.value.trim()) {
                                                                            errors.push({
                                                                                field: `stock_color_name_${stockIndex}`,
                                                                                message: `Tên màu #${stockIndex + 1} không được để trống`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 2: errors}));
                                                                    }}
                                                                    disabled={stock.color.id !== null}
                                                                    className={cn(
                                                                        stepErrors[2]?.some(err => err.field === `stock_color_name_${stockIndex}`) && "border-red-500"
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Mã màu *</Label>
                                                                <Input
                                                                    placeholder="#000000"
                                                                    value={stock.color.hexCode}
                                                                    onChange={(e) => {
                                                                        updateStock(stockIndex, 'color', {
                                                                            ...stock.color,
                                                                            hexCode: e.target.value
                                                                        });
                                                                        // Real-time validation
                                                                        const errors = stepErrors[2].filter(err => err.field !== `stock_color_hex_${stockIndex}`);
                                                                        if (!e.target.value.trim()) {
                                                                            errors.push({
                                                                                field: `stock_color_hex_${stockIndex}`,
                                                                                message: `Mã hex màu #${stockIndex + 1} không được để trống`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 2: errors}));
                                                                    }}
                                                                    disabled={stock.color.id !== null}
                                                                    className={cn(
                                                                        stepErrors[2]?.some(err => err.field === `stock_color_hex_${stockIndex}`) && "border-red-500"
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Số lượng *</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="100"
                                                                    value={stock.quantity}
                                                                    onChange={(e) => {
                                                                        updateStock(stockIndex, 'quantity', parseInt(e.target.value) || 0);
                                                                        // Real-time validation
                                                                        const errors = stepErrors[2].filter(err => err.field !== `stock_quantity_${stockIndex}`);
                                                                        const value = parseInt(e.target.value) || 0;
                                                                        if (value <= 0) {
                                                                            errors.push({
                                                                                field: `stock_quantity_${stockIndex}`,
                                                                                message: `Số lượng cho màu #${stockIndex + 1} phải lớn hơn 0`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 2: errors}));
                                                                    }}
                                                                    className={cn(
                                                                        stepErrors[2]?.some(err => err.field === `stock_quantity_${stockIndex}`) && "border-red-500"
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Giá (VNĐ) *</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="29000000"
                                                                    value={stock.price}
                                                                    onChange={(e) => {
                                                                        updateStock(stockIndex, 'price', parseInt(e.target.value) || 0);
                                                                        // Real-time validation
                                                                        const errors = stepErrors[2].filter(err => err.field !== `stock_price_${stockIndex}`);
                                                                        const value = parseInt(e.target.value) || 0;
                                                                        if (value <= 0) {
                                                                            errors.push({
                                                                                field: `stock_price_${stockIndex}`,
                                                                                message: `Giá cho màu #${stockIndex + 1} phải lớn hơn 0`
                                                                            });
                                                                        }
                                                                        setStepErrors(prev => ({...prev, 2: errors}));
                                                                    }}
                                                                    className={cn(
                                                                        stepErrors[2]?.some(err => err.field === `stock_price_${stockIndex}`) && "border-red-500"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Product Photos */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label>Hình ảnh sản phẩm *</Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => addStockPhoto(stockIndex)}
                                                                >
                                                                    <Plus className="w-4 h-4 mr-2"/>
                                                                    Thêm ảnh
                                                                </Button>
                                                            </div>

                                                            {stock.productPhotos.length === 0 ? (
                                                                <div
                                                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                                                    <ImageIcon
                                                                        className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                                                                    <p className="text-muted-foreground mb-4">Chưa có
                                                                        hình ảnh nào</p>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => addStockPhoto(stockIndex)}
                                                                    >
                                                                        <Upload className="w-4 h-4 mr-2"/>
                                                                        Tải ảnh lên
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {stock.productPhotos.map((photo, photoIndex) => (
                                                                        <Card key={photoIndex}>
                                                                            <CardContent className="p-4 space-y-3">
                                                                                <div
                                                                                    className="flex items-center justify-between">
                                                                                    <span
                                                                                        className="text-sm font-medium">Ảnh #{photoIndex + 1}</span>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => removeStockPhoto(stockIndex, photoIndex)}
                                                                                        className="text-red-500 hover:text-red-700"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4"/>
                                                                                    </Button>
                                                                                </div>
                                                                                <Input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => e.target.files?.[0] && handleStockPhotoChange(stockIndex, photoIndex, e.target.files[0])}
                                                                                    className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md"
                                                                                />
                                                                                <Input
                                                                                    placeholder="Mô tả ảnh (Alt text)"
                                                                                    value={photo.alt}
                                                                                    onChange={(e) => {
                                                                                        const newPhotos = [...stock.productPhotos];
                                                                                        newPhotos[photoIndex].alt = e.target.value;
                                                                                        updateStock(stockIndex, 'productPhotos', newPhotos);
                                                                                    }}
                                                                                />
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Instance Properties */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label>Thuộc tính sản phẩm</Label>
                                                                <div className="flex gap-2">
                                                                    <Select onValueChange={(value) => {
                                                                        if (value === "create-new") {
                                                                            setShowCreateInstanceModal(true);
                                                                            return;
                                                                        }
                                                                        const instanceId = parseInt(value);
                                                                        const selectedInstance = predefinedInstances.find(i => i.id === instanceId);
                                                                        if (selectedInstance && !stock.instanceProperties.some(p => p.name === selectedInstance.name)) {
                                                                            const newStocks = [...formData.stocks];
                                                                            newStocks[stockIndex].instanceProperties.push({
                                                                                id: selectedInstance.id,
                                                                                name: selectedInstance.name
                                                                            });
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                stocks: newStocks
                                                                            }));
                                                                        }
                                                                    }}>
                                                                        <SelectTrigger className="w-[200px]">
                                                                            <SelectValue placeholder="Chọn thuộc tính"/>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {predefinedInstances?.map((instance) => (
                                                                                <SelectItem key={instance.id}
                                                                                            value={instance.id?.toString() || ""}>
                                                                                    {instance.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                            <Separator/>
                                                                            <SelectItem value="create-new">
                                                                                <div
                                                                                    className="flex items-center gap-2">
                                                                                    <Plus className="w-4 h-4"/>
                                                                                    Tạo thuộc tính mới
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addInstanceProperty(stockIndex)}
                                                                    >
                                                                        <Plus className="w-4 h-4 mr-2"/>
                                                                        Thêm thuộc tính
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                {stock.instanceProperties.map((prop, propIndex) => (
                                                                    <Badge key={propIndex} variant="secondary"
                                                                           className="flex items-center gap-2">
                                                                        {prop.name}
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeInstanceProperty(stockIndex, propIndex)}
                                                                            className="h-auto p-0 hover:bg-transparent"
                                                                        >
                                                                            <X className="w-3 h-3"/>
                                                                        </Button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Preview Step */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Product Info Preview */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5"/>
                                                    Thông tin sản phẩm
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Tên sản
                                                        phẩm</Label>
                                                    <p className="font-medium">{formData.name}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Danh
                                                        mục</Label>
                                                    <p className="font-medium">{formData.category?.name}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Mô
                                                        tả</Label>
                                                    <p className="text-sm">{formData.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Features Preview */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Tag className="w-5 h-5"/>
                                                    Tính năng ({formData.features.length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {formData.features.length === 0 ? (
                                                    <p className="text-muted-foreground text-sm">Chưa có tính năng
                                                        nào</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {formData.features.map((feature, index) => (
                                                            <div key={index}
                                                                 className="flex items-start gap-3 p-3 border rounded-lg">
                                                                <div
                                                                    className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                                    <Tag className="w-6 h-6 text-muted-foreground"/>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium">{feature.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Stocks Preview */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Palette className="w-5 h-5"/>
                                                Phiên bản màu sắc ({formData.stocks.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {formData.stocks.length === 0 ? (
                                                <p className="text-muted-foreground text-sm">Chưa có phiên bản màu
                                                    nào</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {formData.stocks.map((stock, index) => (
                                                        <div key={index}
                                                             className="flex items-center justify-between p-4 border rounded-lg">
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-8 h-8 rounded-full border-2"
                                                                    style={{backgroundColor: stock.color.hexCode}}
                                                                />
                                                                <div>
                                                                    <h4 className="font-medium">{stock.color.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {stock.quantity} sản phẩm
                                                                        • {stock.productPhotos.length} ảnh
                                                                        • {stock.instanceProperties.length} thuộc tính
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium">{stock.price.toLocaleString('vi-VN')} đ</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2"/>
                            Quay lại
                        </Button>

                        <div className="flex gap-2">
                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (validateStep(currentStep)) {
                                            setCurrentStep(prev => prev + 1);
                                        }
                                    }}
                                >
                                    Tiếp theo
                                    <ChevronRight className="w-4 h-4 ml-2"/>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => setShowConfirmSubmission(true)}
                                    disabled={isLoading}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    {isLoading ? (
                                        <>
                                            <div
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                            Đang tạo sản phẩm...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2"/>
                                            Tạo sản phẩm
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Confirmation Dialog */}
                <AlertDialog open={showConfirmSubmission} onOpenChange={setShowConfirmSubmission}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận tạo sản phẩm</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn tạo sản phẩm "{formData.name}" không?
                                Vui lòng kiểm tra lại tất cả thông tin trước khi xác nhận.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                {isLoading ? 'Đang tạo...' : 'Xác nhận tạo'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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
                                <div
                                    className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
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
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
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
                                        onChange={(e) => setNewFeature(prev => ({...prev, name: e.target.value}))}
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
                                        onChange={(e) => setNewFeature(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
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
                                        onChange={(e) => e.target.files && setNewFeature(prev => ({
                                            ...prev,
                                            file: e.target.files[0]
                                        }))}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Error message for new feature creation */}
                            {errors.some(error => error.field === 'newFeature') && (
                                <div
                                    className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                    {errors.find(error => error.field === 'newFeature')?.message}
                                </div>
                            )}

                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setShowCreateFeatureModal(false)}
                                        className="px-4 py-2 rounded-lg border">Hủy
                                </button>
                                <button
                                    onClick={handleCreateFeature}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
                                >
                                    {isLoading ? 'Đang tạo...' : 'Tạo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for creating a new color */}
                {showCreateColorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Tạo màu mới</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Tên màu (e.g., Space Black)"
                                    value={newColor.name}
                                    onChange={(e) => setNewColor(prev => ({...prev, name: e.target.value}))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Mã hex (e.g., #000000)"
                                    value={newColor.hexCode}
                                    onChange={(e) => setNewColor(prev => ({...prev, hexCode: e.target.value}))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowCreateColorModal(false)}
                                        className="px-4 py-2 rounded-lg border">Hủy
                                </button>
                                <button
                                    onClick={handleCreateColor}
                                    disabled={colorLoading}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
                                >
                                    {colorLoading ? 'Đang tạo...' : 'Tạo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for creating a new instance */}
                {showCreateInstanceModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Tạo thuộc tính mới</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Tên thuộc tính (e.g., 128GB)"
                                    value={newInstance.name}
                                    onChange={(e) => setNewInstance(prev => ({...prev, name: e.target.value}))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Mô tả (không bắt buộc)"
                                    value={newInstance.description}
                                    onChange={(e) => setNewInstance(prev => ({...prev, description: e.target.value}))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowCreateInstanceModal(false)}
                                        className="px-4 py-2 rounded-lg border">Hủy
                                </button>
                                <button
                                    onClick={handleCreateInstance}
                                    disabled={instanceLoading}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
                                >
                                    {instanceLoading ? 'Đang tạo...' : 'Tạo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateProductPage;

