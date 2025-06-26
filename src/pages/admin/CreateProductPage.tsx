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
    Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
    const [categoryLoading, setCategoryLoading] = useState(false);

    // Feature state
    const [predefinedFeatures, setPredefinedFeatures] = useState<Feature[]>([]);
    const [showCreateFeatureModal, setShowCreateFeatureModal] = useState(false);
    const [newFeature, setNewFeature] = useState<{ name: string, description: string, file: File | null }>({
        name: '',
        description: '',
        file: null
    });
    const [featureLoading, setFeatureLoading] = useState(false);

    // Color state
    const [predefinedColors, setPredefinedColors] = useState<Color[]>([]);
    const [showCreateColorModal, setShowCreateColorModal] = useState(false);
    const [newColor, setNewColor] = useState<{ name: string, hexCode: string }>({
        name: '',
        hexCode: ''
    });
    const [colorLoading, setColorLoading] = useState(false);

    // Instance state
    const [predefinedInstances, setPredefinedInstances] = useState<Instance[]>([]);
    const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
    const [newInstance, setNewInstance] = useState<{ name: string, description: string }>({
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

        const data = new FormData();
        data.append('product', JSON.stringify({...formData, createdBy: 'hieuu8a@gmail.com'}));

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
            const response = await adminProductService.createProduct(data);
            //     = await fetch('http://localhost:8080/api/v1/admin/products', {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': 'Bearer eyJhbGciOiJIUzM4NCJ9.eyJmaXJzdE5hbWUiOiJEdW9uZyBRdW9jIiwibGFzdE5hbWUiOiJIaWV1Iiwicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfQURNSU4ifV0sImltYWdlVXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0xQeTZyYWgyRWRhX3J2a3lZSDdLc1VfY1J1YjlSdkFiYnM4ZDdJdTlFNFkyVnc2ST1zNTc2LWMtbm8iLCJzdWIiOiJoaWV1dThhQGdtYWlsLmNvbSIsImlhdCI6MTc1MDYxMTQzMCwiZXhwIjoxNzUwNjk3ODMwfQ.uwilgUCH45a29Qnm3Kn5b-DytpO7jxqUrnyPwCCLcKjVbVS4k6wxf7WyFSI5B1Fg'
            //     },
            //     body: data,
            // });

            if (response.success) {
                alert(response.message);
                navigate('/admin/products');
            } else {
                const errorData = await response.message;
                setErrors(errorData);
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
                setErrors([{field: 'categories', message: 'Không thể tải danh mục sản phẩm'}]);
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
                    {field: 'dataLoading', message: 'Không thể tải dữ liệu tính năng, màu sắc hoặc phiên bản'}
                ]);
            }
        };

        loadData();
    }, []);

    const validateStep = (step: number): boolean => {
        let errors: ErrorData[] = [];
        if (step === 0) {
            if (!formData.name.trim()) {
                errors.push({field: 'name', message: 'Tên sản phẩm không được để trống'});
            }
            if (!formData.category || !formData.category.id) {
                errors.push({field: 'category', message: 'Danh mục không được để trống'});
            }
            if (!formData.description.trim()) {
                errors.push({field: 'description', message: 'Mô tả sản phẩm không được để trống'});
            }
        } else if (step === 1) {
            formData.features.forEach((feature, index) => {
                if (!feature.name.trim()) {
                    errors.push({
                        field: `feature_name_${index}`,
                        message: `Tên tính năng #${index + 1} không được để trống`
                    });
                }
                if (!feature.description.trim()) {
                    errors.push({
                        field: `feature_description_${index}`,
                        message: `Mô tả tính năng #${index + 1} không được để trống`
                    });
                }
            });
        } else if (step === 2) {
            formData.stocks.forEach((stock, stockIndex) => {
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
                }
                if (!stock.quantity || stock.quantity <= 0) {
                    errors.push({
                        field: `stock_quantity_${stockIndex}`,
                        message: `Số lượng cho màu #${stockIndex + 1} phải lớn hơn 0`
                    });
                }
                if (!stock.price || stock.price <= 0) {
                    errors.push({
                        field: `stock_price_${stockIndex}`,
                        message: `Giá cho màu #${stockIndex + 1} phải lớn hơn 0`
                    });
                }
                stock.productPhotos.forEach((photo, photoIndex) => {
                    if (!photo.imageUrl) {
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
            });
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
        if (!newColor.name.trim() || !newColor.hexCode.trim()) {
            alert("Vui lòng nhập tên màu và mã hex.");
            return;
        }

        const createdColor: Color = {
            id: null,
            name: newColor.name,
            hexCode: newColor.hexCode,
        };

        setPredefinedColors(prev => [...prev, createdColor]);
        setShowCreateColorModal(false);
        setNewColor({name: '', hexCode: ''});
    };

    const handleCreateInstance = () => {
        if (!newInstance.name.trim()) {
            alert("Vui lòng nhập tên phiên bản.");
            return;
        }

        const createdInstance: Instance = {
            id: null,
            name: newInstance.name,
            description: newInstance.description,
        };

        setPredefinedInstances(prev => [...prev, createdInstance]);
        setShowCreateInstanceModal(false);
        setNewInstance({name: '', description: ''});
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
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid gap-8">
                    {/* Stepper */}
                    <div className="mb-8">
                        <div className="flex items-center gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center gap">
                                    <div className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {currentStep === index ? <Check className="w-5 h-5"/> : step.icon}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`h-0.5 flex-1 ${currentStep > index ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${currentStep === index ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        {/* Basic Information */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
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
                                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                            className={"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
                                            placeholder="iPhone 15 Pro"
                                        />
                                        {stepErrors[0]?.filter(error => error.field === 'name').map((error, idx) => (
                                            <p key={idx} className="text-red-600 text-xs mt-1">{error.message}</p>
                                        ))}
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
                                                            <option key={category.id}
                                                                    value={category.id !== null ? category.id : ''}>
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
                                                <Plus className="w-5 h-5"/>
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
                                                    Danh mục đã chọn: <span
                                                    className="font-semibold">{formData.category.name}</span>
                                                </span>
                                            </div>
                                        )}
                                        {stepErrors[0]?.filter(error => error.field === 'category').map((error, idx) => (
                                            <p key={idx} className="text-red-600 text-xs mt-1">{error.message}</p>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Mô tả chi tiết về sản phẩm..."
                                        />
                                        {stepErrors[0]?.filter(error => error.field === 'description').map((error, idx) => (
                                            <p key={idx} className="text-red-600 text-xs mt-1">{error.message}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <select
                                                onChange={(e) => {
                                                    const featureId = parseInt(e.target.value);
                                                    if (featureId === -1) {
                                                        // User wants to add a new feature
                                                        setShowCreateFeatureModal(true);
                                                        return;
                                                    }
                                                    if (featureId === -2) {
                                                        // User selected default option, do nothing
                                                        return;
                                                    }

                                                    // Find the selected feature from predefined features
                                                    const selectedFeature = predefinedFeatures.find(f => f.id === featureId);
                                                    if (selectedFeature) {
                                                        // Check if this feature is already added
                                                        const isFeatureAlreadyAdded = formData.features.some(f => f.id === featureId);
                                                        if (!isFeatureAlreadyAdded) {
                                                            // Add the selected feature to formData
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                features: [...prev.features, selectedFeature]
                                                            }));
                                                            // Add a placeholder for the file since we're using an existing feature
                                                            setFeatureFiles(prev => [...prev, new File([], '')]);
                                                        }
                                                    }
                                                    // Reset selection to default option
                                                    e.target.value = "-2";
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="-2">-- Chọn tính năng có sẵn --</option>
                                                {predefinedFeatures?.map((feature) => (
                                                    <option key={feature.id}
                                                            value={feature.id !== null ? feature.id : ''}>
                                                        {feature.name}
                                                    </option>
                                                ))}
                                                <option value="-1">Thêm tính năng mới</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <Plus className="w-4 h-4 mr-1"/>
                                                Thêm tính năng mới
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.features?.map((feature, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-medium text-gray-900">Tính năng
                                                        #{index + 1}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(index)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <X className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Tên tính năng"
                                                        value={feature.name}
                                                        onChange={(e) => updateFeature(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        disabled={feature.id !== null && feature.id !== undefined}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Mô tả"
                                                        value={feature.description}
                                                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        disabled={feature.id !== null && feature.id !== undefined}
                                                    />
                                                </div>
                                                {/* Feature field errors */}
                                                {stepErrors[1]?.filter(error => error.field === `feature_name_${index}`).map((error, idx) => (
                                                    <p key={idx}
                                                       className="text-red-600 text-xs mt-1">{error.message}</p>
                                                ))}
                                                {stepErrors[1]?.filter(error => error.field === `feature_description_${index}`).map((error, idx) => (
                                                    <p key={idx}
                                                       className="text-red-600 text-xs mt-1">{error.message}</p>
                                                ))}
                                                {/* File upload for feature image */}
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Ảnh tính năng *
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => e.target.files && handleFeatureFileChange(index, e.target.files[0])}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    {/* Error message for feature image */}
                                                    {stepErrors[1]?.filter(error => error.field === `feature_image_${index}`).map((error, idx) => (
                                                        <p key={idx}
                                                           className="text-red-600 text-xs mt-1">{error.message}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {formData.features.length === 0 && (
                                            <p className="text-gray-500 text-sm">Chưa có tính năng nào.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stocks */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kho hàng</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <select
                                                onChange={(e) => {
                                                    const colorId = parseInt(e.target.value);
                                                    if (colorId === -1) {
                                                        // User wants to add a new color
                                                        setShowCreateColorModal(true);
                                                        return;
                                                    }
                                                    if (colorId === -2) {
                                                        // User selected default option, do nothing
                                                        return;
                                                    }

                                                    // Find the selected color
                                                    const selectedColor = predefinedColors.find(c => c.id === colorId);
                                                    if (selectedColor) {
                                                        // Check if any stock already has this color
                                                        const isColorAlreadyUsed = formData.stocks.some(
                                                            stock => stock.color.name === selectedColor.name
                                                        );

                                                        if (!isColorAlreadyUsed) {
                                                            // Add a new stock with the selected color
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                stocks: [
                                                                    ...prev.stocks,
                                                                    {
                                                                        color: {
                                                                            id: selectedColor.id,
                                                                            name: selectedColor.name,
                                                                            hexCode: selectedColor.hexCode
                                                                        },
                                                                        quantity: 0,
                                                                        price: 0,
                                                                        productPhotos: [],
                                                                        instanceProperties: []
                                                                    }
                                                                ]
                                                            }));
                                                            setStockPhotoFiles(prev => [...prev, []]);
                                                        }
                                                    }
                                                    // Reset selection to default option
                                                    e.target.value = "-2";
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="-2">-- Chọn màu có sẵn --</option>
                                                {predefinedColors?.map((color) => (
                                                    <option key={color.id} value={color.id !== null ? color.id : ''}>
                                                        {color.name}
                                                    </option>
                                                ))}
                                                <option value="-1">Thêm màu mới</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addStock}
                                                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <Plus className="w-4 h-4 mr-1"/>
                                                Thêm màu mới
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.stocks?.map((stock, stockIndex) => (
                                            <div key={stockIndex} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-medium text-gray-900">Màu sắc
                                                        #{stockIndex + 1}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStock(stockIndex)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <X className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="text"
                                                            placeholder="Tên màu"
                                                            value={stock.color.name}
                                                            onChange={(e) => updateStock(stockIndex, 'color', {
                                                                ...stock.color,
                                                                name: e.target.value
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            disabled={stock.color.id !== null && stock.color.id !== undefined}
                                                        />
                                                        {stock.color.hexCode && (
                                                            <div
                                                                className="w-6 h-6 ml-2 rounded-full border border-gray-300"
                                                                style={{backgroundColor: stock.color.hexCode}}
                                                            ></div>
                                                        )}
                                                    </div>
                                                    {stepErrors[2]?.filter(error => error.field === `stock_color_name_${stockIndex}`).map((error, idx) => (
                                                        <p key={idx}
                                                           className="text-red-600 text-xs mt-1">{error.message}</p>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        placeholder="Mã hex"
                                                        value={stock.color.hexCode}
                                                        onChange={(e) => updateStock(stockIndex, 'color', {
                                                            ...stock.color,
                                                            hexCode: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        disabled={stock.color.id !== null && stock.color.id !== undefined}
                                                    />
                                                    {stepErrors[2]?.filter(error => error.field === `stock_color_hex_${stockIndex}`).map((error, idx) => (
                                                        <p key={idx}
                                                           className="text-red-600 text-xs mt-1">{error.message}</p>
                                                    ))}
                                                    <input
                                                        type="number"
                                                        placeholder="Số lượng"
                                                        value={stock.quantity}
                                                        onChange={(e) => updateStock(stockIndex, 'quantity', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                    {stepErrors[2]?.filter(error => error.field === `stock_quantity_${stockIndex}`).map((error, idx) => (
                                                        <p key={idx}
                                                           className="text-red-600 text-xs mt-1">{error.message}</p>
                                                    ))}
                                                    <input
                                                        type="number"
                                                        placeholder="Giá"
                                                        value={stock.price}
                                                        onChange={(e) => updateStock(stockIndex, 'price', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                    {stepErrors[2]?.filter(error => error.field === `stock_price_${stockIndex}`).map((error, idx) => (
                                                        <p key={idx}
                                                           className="text-red-600 text-xs mt-1">{error.message}</p>
                                                    ))}
                                                </div>
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh sản
                                                        phẩm</h4>
                                                    {stock.productPhotos?.map((photo, photoIndex) => (
                                                        <div key={photoIndex} className="flex items-center gap-2 mb-2">
                                                            <input type="file"
                                                                   onChange={(e) => e.target.files && handleStockPhotoChange(stockIndex, photoIndex, e.target.files[0])}
                                                                   className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                                            <input type="text" placeholder="Alt text" value={photo.alt}
                                                                   onChange={(e) => {
                                                                       const newPhotos = [...stock.productPhotos];
                                                                       newPhotos[photoIndex].alt = e.target.value;
                                                                       updateStock(stockIndex, 'productPhotos', newPhotos);
                                                                   }}
                                                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                                                            <button type="button"
                                                                    onClick={() => removeStockPhoto(stockIndex, photoIndex)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                                <X className="w-4 h-4"/></button>
                                                            {stepErrors[2]?.filter(error => error.field === `stock_photo_${stockIndex}_${photoIndex}`).map((error, idx) => (
                                                                <p key={idx}
                                                                   className="text-red-600 text-xs mt-1">{error.message}</p>
                                                            ))}
                                                            {stepErrors[2]?.filter(error => error.field === `stock_photo_alt_${stockIndex}_${photoIndex}`).map((error, idx) => (
                                                                <p key={idx}
                                                                   className="text-red-600 text-xs mt-1">{error.message}</p>
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addStockPhoto(stockIndex)}
                                                            className="text-sm text-blue-600 hover:underline">Thêm ảnh
                                                    </button>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">Thuộc
                                                            tính</h4>
                                                        <select
                                                            onChange={(e) => {
                                                                const instanceId = parseInt(e.target.value);
                                                                if (instanceId === -1) {
                                                                    // User wants to add a new instance
                                                                    setShowCreateInstanceModal(true);
                                                                    return;
                                                                }
                                                                if (instanceId === -2) {
                                                                    // User selected default option, do nothing
                                                                    return;
                                                                }

                                                                // Find the selected instance
                                                                const selectedInstance = predefinedInstances.find(i => i.id === instanceId);
                                                                if (selectedInstance) {
                                                                    // Check if this instance is already added to this stock
                                                                    const isInstanceAlreadyAdded = stock.instanceProperties.some(
                                                                        prop => prop.name === selectedInstance.name
                                                                    );

                                                                    if (!isInstanceAlreadyAdded) {
                                                                        // Add the instance to this stock's properties
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
                                                                }
                                                                // Reset selection
                                                                e.target.value = "-2";
                                                            }}
                                                            className="text-sm px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="-2">-- Chọn thuộc tính --</option>
                                                            {predefinedInstances?.map((instance) => (
                                                                <option key={instance.id}
                                                                        value={instance.id !== null ? instance.id : ''}>
                                                                    {instance.name}
                                                                </option>
                                                            ))}
                                                            <option value="-1">Thêm thuộc tính mới</option>
                                                        </select>
                                                    </div>
                                                    {stock.instanceProperties?.map((prop, propIndex) => (
                                                        <div key={propIndex} className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Tên thuộc tính"
                                                                value={prop.name}
                                                                onChange={(e) => updateInstanceProperty(stockIndex, propIndex, e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                disabled={prop.id !== null && prop.id !== undefined}
                                                            />
                                                            <button type="button"
                                                                    onClick={() => removeInstanceProperty(stockIndex, propIndex)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                                <X className="w-4 h-4"/></button>
                                                        </div>
                                                    ))}
                                                    <button type="button"
                                                            onClick={() => addInstanceProperty(stockIndex)}
                                                            className="text-sm text-blue-600 hover:underline">Thêm thuộc
                                                        tính mới
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.stocks.length === 0 && (
                                            <p className="text-gray-500 text-sm">Chưa có màu sắc nào.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview & Submit */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Xem trước & Hoàn tất</h2>

                                <div className="space-y-4">
                                    {/* Basic Info Preview */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Tên sản phẩm:</span>
                                                <p className="mt-1 text-gray-900">{formData.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Danh mục:</span>
                                                <p className="mt-1 text-gray-900">{formData.category.name}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-sm font-medium text-gray-700">Mô tả:</span>
                                                <p className="mt-1 text-gray-900">{formData.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Preview */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3">Tính năng</h3>
                                        <div className="space-y-2">
                                            {formData.features.length === 0 ? (
                                                <p className="text-gray-500 text-sm">Chưa có tính năng nào được
                                                    thêm.</p>
                                            ) : (
                                                formData.features.map((feature, index) => (
                                                    <div key={index} className="p-3 border border-gray-300 rounded-lg">
                                                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                                                        <p className="mt-1 text-gray-700">{feature.description}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Stocks Preview */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3">Kho hàng</h3>
                                        <div className="space-y-2">
                                            {formData.stocks.length === 0 ? (
                                                <p className="text-gray-500 text-sm">Chưa có màu sắc nào được thêm.</p>
                                            ) : (
                                                formData.stocks.map((stock, stockIndex) => (
                                                    <div key={stockIndex}
                                                         className="p-3 border border-gray-300 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-900">{stock.color.name}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeStock(stockIndex)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                                                                <p className="mt-1 text-gray-900">{stock.quantity}</p>
                                                            </div>
                                                            <div>
                                                                <span
                                                                    className="text-sm font-medium text-gray-700">Giá:</span>
                                                                <p className="mt-1 text-gray-900">{stock.price} đ</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <span className="text-sm font-medium text-gray-700">Ảnh sản phẩm:</span>
                                                            <div className="mt-1 grid grid-cols-3 gap-2">
                                                                {stock.productPhotos.map((photo, photoIndex) => (
                                                                    <div key={photoIndex}
                                                                         className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                                        <img
                                                                            src={photo.imageUrl}
                                                                            alt={photo.alt}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <span className="text-sm font-medium text-gray-700">Thuộc tính:</span>
                                                            <div className="mt-1">
                                                                {stock.instanceProperties.length === 0 ? (
                                                                    <p className="text-gray-500 text-sm">Chưa có thuộc
                                                                        tính nào.</p>
                                                                ) : (
                                                                    <ul className="list-disc list-inside">
                                                                        {stock.instanceProperties.map((prop, propIndex) => (
                                                                            <li key={propIndex}
                                                                                className="text-gray-900">{prop.name}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="space-y-3">
                                <div className={"flex gap-3"}>
                                    {currentStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(prev => prev - 1)}
                                            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft className="w-5 h-5"/>
                                            Quay lại
                                        </button>
                                    )}

                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (validateStep(currentStep)) {
                                                    setCurrentStep(prev => prev + 1);
                                                }
                                            }}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                                        >
                                            Tiếp theo
                                            <ChevronRight className="w-5 h-5"/>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmSubmission(true)}
                                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                                            >
                                                {isLoading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                                            </button>

                                            {/* Confirmation dialog for submission */}
                                            {showConfirmSubmission && (
                                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                                    <div className="absolute inset-0 bg-black opacity-30"></div>
                                                    <div
                                                        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác
                                                            nhận tạo sản phẩm</h3>
                                                        <p className="text-gray-700 text-sm mb-4">
                                                            Bạn có chắc chắn muốn tạo sản phẩm này không? Vui lòng kiểm
                                                            tra lại tất cả thông tin trước khi xác nhận.
                                                        </p>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setShowConfirmSubmission(false)}
                                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                onClick={handleSubmit}
                                                                disabled={isLoading}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isLoading ? 'Đang tạo...' : 'Xác nhận tạo sản phẩm'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

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
                    <div
                        className={"w-full bg-red-50 border border-red-300 text-red-700 p-6 mb-5 rounded relative" + (errors?.length > 0 ? " block" : " hidden")}>
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
                                    onChange={(e) => setNewFeature(prev => ({...prev, description: e.target.value}))}
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
                            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                {errors.find(error => error.field === 'newFeature')?.message}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setShowCreateFeatureModal(false)}
                                    className="px-4 py-2 rounded-lg border">Hủy
                            </button>
                            <button
                                onClick={handleCreateFeature}
                                disabled={featureLoading}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
                            >
                                {featureLoading ? 'Đang tạo...' : 'Tạo'}
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
    );
};

export default CreateProductPage;

