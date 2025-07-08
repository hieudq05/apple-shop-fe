import React, {useState, useEffect} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
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
import {Skeleton} from "@/components/ui/skeleton";
import adminProductService, {type AdminProduct} from '../../services/adminProductService';

// Extended product interface to match the actual API response
interface ExtendedProduct extends Omit<AdminProduct, 'stocks' | 'features'> {
    categoryId: number;
    categoryName: string;
    features: Array<{
        id: number;
        name: string;
        image: string;
    }>;
    createdBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    updatedBy?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    stocks: Array<{
        id: number;
        productId: number;
        colorId: number;
        colorName: string;
        colorHexCode: string;
        quantity: number;
        price: number;
        productPhotos: Array<{
            id: number;
            imageUrl: string;
            alt: string;
        }>;
        instanceProperties: Array<{
            id: number;
            name: string;
        }>;
    }>;
}

import type {MetadataResponse} from "@/types/api.ts";
import {DataTable} from "@/components/data-table.tsx";

const data = [
    {
        "id": 1,
        "header": "Cover page",
        "type": "Cover page",
        "status": "In Process",
        "target": "18",
        "limit": "5",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 2,
        "header": "Table of contents",
        "type": "Table of contents",
        "status": "Done",
        "target": "29",
        "limit": "24",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 3,
        "header": "Executive summary",
        "type": "Narrative",
        "status": "Done",
        "target": "10",
        "limit": "13",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 4,
        "header": "Technical approach",
        "type": "Narrative",
        "status": "Done",
        "target": "27",
        "limit": "23",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 5,
        "header": "Design",
        "type": "Narrative",
        "status": "In Process",
        "target": "2",
        "limit": "16",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 6,
        "header": "Capabilities",
        "type": "Narrative",
        "status": "In Process",
        "target": "20",
        "limit": "8",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 7,
        "header": "Integration with existing systems",
        "type": "Narrative",
        "status": "In Process",
        "target": "19",
        "limit": "21",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 8,
        "header": "Innovation and Advantages",
        "type": "Narrative",
        "status": "Done",
        "target": "25",
        "limit": "26",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 9,
        "header": "Overview of EMR's Innovative Solutions",
        "type": "Technical content",
        "status": "Done",
        "target": "7",
        "limit": "23",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 10,
        "header": "Advanced Algorithms and Machine Learning",
        "type": "Narrative",
        "status": "Done",
        "target": "30",
        "limit": "28",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 11,
        "header": "Adaptive Communication Protocols",
        "type": "Narrative",
        "status": "Done",
        "target": "9",
        "limit": "31",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 12,
        "header": "Advantages Over Current Technologies",
        "type": "Narrative",
        "status": "Done",
        "target": "12",
        "limit": "0",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 13,
        "header": "Past Performance",
        "type": "Narrative",
        "status": "Done",
        "target": "22",
        "limit": "33",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 14,
        "header": "Customer Feedback and Satisfaction Levels",
        "type": "Narrative",
        "status": "Done",
        "target": "15",
        "limit": "34",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 15,
        "header": "Implementation Challenges and Solutions",
        "type": "Narrative",
        "status": "Done",
        "target": "3",
        "limit": "35",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 16,
        "header": "Security Measures and Data Protection Policies",
        "type": "Narrative",
        "status": "In Process",
        "target": "6",
        "limit": "36",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 17,
        "header": "Scalability and Future Proofing",
        "type": "Narrative",
        "status": "Done",
        "target": "4",
        "limit": "37",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 18,
        "header": "Cost-Benefit Analysis",
        "type": "Plain language",
        "status": "Done",
        "target": "14",
        "limit": "38",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 19,
        "header": "User Training and Onboarding Experience",
        "type": "Narrative",
        "status": "Done",
        "target": "17",
        "limit": "39",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 20,
        "header": "Future Development Roadmap",
        "type": "Narrative",
        "status": "Done",
        "target": "11",
        "limit": "40",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 21,
        "header": "System Architecture Overview",
        "type": "Technical content",
        "status": "In Process",
        "target": "24",
        "limit": "18",
        "reviewer": "Maya Johnson"
    },
    {
        "id": 22,
        "header": "Risk Management Plan",
        "type": "Narrative",
        "status": "Done",
        "target": "15",
        "limit": "22",
        "reviewer": "Carlos Rodriguez"
    },
    {
        "id": 23,
        "header": "Compliance Documentation",
        "type": "Legal",
        "status": "In Process",
        "target": "31",
        "limit": "27",
        "reviewer": "Sarah Chen"
    },
    {
        "id": 24,
        "header": "API Documentation",
        "type": "Technical content",
        "status": "Done",
        "target": "8",
        "limit": "12",
        "reviewer": "Raj Patel"
    },
    {
        "id": 25,
        "header": "User Interface Mockups",
        "type": "Visual",
        "status": "In Process",
        "target": "19",
        "limit": "25",
        "reviewer": "Leila Ahmadi"
    },
    {
        "id": 26,
        "header": "Database Schema",
        "type": "Technical content",
        "status": "Done",
        "target": "22",
        "limit": "20",
        "reviewer": "Thomas Wilson"
    },
    {
        "id": 27,
        "header": "Testing Methodology",
        "type": "Technical content",
        "status": "In Process",
        "target": "17",
        "limit": "14",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 28,
        "header": "Deployment Strategy",
        "type": "Narrative",
        "status": "Done",
        "target": "26",
        "limit": "30",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 29,
        "header": "Budget Breakdown",
        "type": "Financial",
        "status": "In Process",
        "target": "13",
        "limit": "16",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 30,
        "header": "Market Analysis",
        "type": "Research",
        "status": "Done",
        "target": "29",
        "limit": "32",
        "reviewer": "Sophia Martinez"
    },
    {
        "id": 31,
        "header": "Competitor Comparison",
        "type": "Research",
        "status": "In Process",
        "target": "21",
        "limit": "19",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 32,
        "header": "Maintenance Plan",
        "type": "Technical content",
        "status": "Done",
        "target": "16",
        "limit": "23",
        "reviewer": "Alex Thompson"
    },
    {
        "id": 33,
        "header": "User Personas",
        "type": "Research",
        "status": "In Process",
        "target": "27",
        "limit": "24",
        "reviewer": "Nina Patel"
    },
    {
        "id": 34,
        "header": "Accessibility Compliance",
        "type": "Legal",
        "status": "Done",
        "target": "18",
        "limit": "21",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 35,
        "header": "Performance Metrics",
        "type": "Technical content",
        "status": "In Process",
        "target": "23",
        "limit": "26",
        "reviewer": "David Kim"
    },
    {
        "id": 36,
        "header": "Disaster Recovery Plan",
        "type": "Technical content",
        "status": "Done",
        "target": "14",
        "limit": "17",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 37,
        "header": "Third-party Integrations",
        "type": "Technical content",
        "status": "In Process",
        "target": "25",
        "limit": "28",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 38,
        "header": "User Feedback Summary",
        "type": "Research",
        "status": "Done",
        "target": "20",
        "limit": "15",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 39,
        "header": "Localization Strategy",
        "type": "Narrative",
        "status": "In Process",
        "target": "12",
        "limit": "19",
        "reviewer": "Maria Garcia"
    },
    {
        "id": 40,
        "header": "Mobile Compatibility",
        "type": "Technical content",
        "status": "Done",
        "target": "28",
        "limit": "31",
        "reviewer": "James Wilson"
    },
    {
        "id": 41,
        "header": "Data Migration Plan",
        "type": "Technical content",
        "status": "In Process",
        "target": "19",
        "limit": "22",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 42,
        "header": "Quality Assurance Protocols",
        "type": "Technical content",
        "status": "Done",
        "target": "30",
        "limit": "33",
        "reviewer": "Priya Singh"
    },
    {
        "id": 43,
        "header": "Stakeholder Analysis",
        "type": "Research",
        "status": "In Process",
        "target": "11",
        "limit": "14",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 44,
        "header": "Environmental Impact Assessment",
        "type": "Research",
        "status": "Done",
        "target": "24",
        "limit": "27",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 45,
        "header": "Intellectual Property Rights",
        "type": "Legal",
        "status": "In Process",
        "target": "17",
        "limit": "20",
        "reviewer": "Sarah Johnson"
    },
    {
        "id": 46,
        "header": "Customer Support Framework",
        "type": "Narrative",
        "status": "Done",
        "target": "22",
        "limit": "25",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 47,
        "header": "Version Control Strategy",
        "type": "Technical content",
        "status": "In Process",
        "target": "15",
        "limit": "18",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 48,
        "header": "Continuous Integration Pipeline",
        "type": "Technical content",
        "status": "Done",
        "target": "26",
        "limit": "29",
        "reviewer": "Michael Chen"
    },
    {
        "id": 49,
        "header": "Regulatory Compliance",
        "type": "Legal",
        "status": "In Process",
        "target": "13",
        "limit": "16",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 50,
        "header": "User Authentication System",
        "type": "Technical content",
        "status": "Done",
        "target": "28",
        "limit": "31",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 51,
        "header": "Data Analytics Framework",
        "type": "Technical content",
        "status": "In Process",
        "target": "21",
        "limit": "24",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 52,
        "header": "Cloud Infrastructure",
        "type": "Technical content",
        "status": "Done",
        "target": "16",
        "limit": "19",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 53,
        "header": "Network Security Measures",
        "type": "Technical content",
        "status": "In Process",
        "target": "29",
        "limit": "32",
        "reviewer": "Lisa Wong"
    },
    {
        "id": 54,
        "header": "Project Timeline",
        "type": "Planning",
        "status": "Done",
        "target": "14",
        "limit": "17",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 55,
        "header": "Resource Allocation",
        "type": "Planning",
        "status": "In Process",
        "target": "27",
        "limit": "30",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 56,
        "header": "Team Structure and Roles",
        "type": "Planning",
        "status": "Done",
        "target": "20",
        "limit": "23",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 57,
        "header": "Communication Protocols",
        "type": "Planning",
        "status": "In Process",
        "target": "15",
        "limit": "18",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 58,
        "header": "Success Metrics",
        "type": "Planning",
        "status": "Done",
        "target": "30",
        "limit": "33",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 59,
        "header": "Internationalization Support",
        "type": "Technical content",
        "status": "In Process",
        "target": "23",
        "limit": "26",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 60,
        "header": "Backup and Recovery Procedures",
        "type": "Technical content",
        "status": "Done",
        "target": "18",
        "limit": "21",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 61,
        "header": "Monitoring and Alerting System",
        "type": "Technical content",
        "status": "In Process",
        "target": "25",
        "limit": "28",
        "reviewer": "Daniel Park"
    },
    {
        "id": 62,
        "header": "Code Review Guidelines",
        "type": "Technical content",
        "status": "Done",
        "target": "12",
        "limit": "15",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 63,
        "header": "Documentation Standards",
        "type": "Technical content",
        "status": "In Process",
        "target": "27",
        "limit": "30",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 64,
        "header": "Release Management Process",
        "type": "Planning",
        "status": "Done",
        "target": "22",
        "limit": "25",
        "reviewer": "Assign reviewer"
    },
    {
        "id": 65,
        "header": "Feature Prioritization Matrix",
        "type": "Planning",
        "status": "In Process",
        "target": "19",
        "limit": "22",
        "reviewer": "Emma Davis"
    },
    {
        "id": 66,
        "header": "Technical Debt Assessment",
        "type": "Technical content",
        "status": "Done",
        "target": "24",
        "limit": "27",
        "reviewer": "Eddie Lake"
    },
    {
        "id": 67,
        "header": "Capacity Planning",
        "type": "Planning",
        "status": "In Process",
        "target": "21",
        "limit": "24",
        "reviewer": "Jamik Tashpulatov"
    },
    {
        "id": 68,
        "header": "Service Level Agreements",
        "type": "Legal",
        "status": "Done",
        "target": "26",
        "limit": "29",
        "reviewer": "Assign reviewer"
    }
]

const AdminProductsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [metadata, setMetadata] = useState<MetadataResponse>({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPage: 0
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        productId: number | null;
        productName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        productId: null,
        productName: '',
        isDeleting: false
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Temporary solution using useState instead of useQuery
    const [productsState, setProductsState] = useState({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsState(prev => ({...prev, loading: true, error: null}));
                console.log('Fetching with useState...');

                const params = {
                    page: metadata.currentPage,
                    size: metadata.pageSize,
                    search: debouncedSearchTerm || undefined,
                    categoryId: selectedCategory && selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
                };

                const response = await adminProductService.getAdminProducts(params);
                console.log('useState response:', response);

                if (response.success && response.data) {
                    const mappedProducts = response.data;

                    const result = {
                        products: mappedProducts,
                        meta: response.meta || {
                            currentPage: 0,
                            pageSize: mappedProducts.length,
                            totalElements: mappedProducts.length,
                            totalPage: 1,
                        },
                    };

                    console.log('useState result:', result);
                    setProductsState({data: result, loading: false, error: null});
                    setMetadata(response.meta || {});
                } else {
                    throw new Error(response.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('useState error:', error);
                setProductsState(prev => ({...prev, loading: false, error}));
            }
        };

        fetchProducts();
    }, [metadata.currentPage, debouncedSearchTerm, selectedCategory]);

    // Use useState data instead of useQuery
    const productsData = productsState.data;
    const isLoading = productsState.loading;
    const isErrorProducts = !!productsState.error;

    const openDeleteDialog = (productId: number, productName: string) => {
        setDeleteDialog({
            isOpen: true,
            productId,
            productName,
            isDeleting: false
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            productId: null,
            productName: '',
            isDeleting: false
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (productId: number) => adminProductService.deleteProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['adminProducts']});
            closeDeleteDialog();
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            setDeleteDialog(prev => ({...prev, isDeleting: false}));
        }
    });

    const handleDeleteProduct = () => {
        if (deleteDialog.productId) {
            deleteMutation.mutate(deleteDialog.productId);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getMinPrice = (stocks: ExtendedProduct['stocks']) => {
        if (!stocks || stocks.length === 0) return 0;
        return Math.min(...stocks.map(s => s.price));
    };

    const getTotalStock = (stocks: ExtendedProduct['stocks']) => {
        if (!stocks || stocks.length === 0) return 0;
        return stocks.reduce((total, stock) => total + stock.quantity, 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Quản lý sản phẩm</CardTitle>
                            <CardDescription>
                                Quản lý danh sách sản phẩm của cửa hàng
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link to="/admin/products/create">
                                <Plus className="w-4 h-4 mr-2"/>
                                Thêm sản phẩm
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Select value={selectedCategory || undefined}
                                    onValueChange={(value) => setSelectedCategory(value || '')}>
                                <SelectTrigger className="w-fit">
                                    <Filter className="w-4 h-4 mr-2"/>
                                    <SelectValue placeholder="Tất cả danh mục"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    <SelectItem value="1">iPhone</SelectItem>
                                    <SelectItem value="2">Mac</SelectItem>
                                    <SelectItem value="3">iPad</SelectItem>
                                    <SelectItem value="4">Apple Watch</SelectItem>
                                    <SelectItem value="5">AirPods</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-lg"/>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]"/>
                                        <Skeleton className="h-4 w-[200px]"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {isErrorProducts && (
                <Card>
                    <CardContent className="p-6 text-center text-destructive">
                        Đã có lỗi xảy ra khi tải danh sách sản phẩm.
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isErrorProducts && productsData?.products.length > 0 && (
                <DataTable data={data}/>
            )}

            {/* Products Table */}
            {!isLoading && !isErrorProducts && productsData?.products.length > 0 && (
                <Card className={"py-0"}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Tồn kho</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productsData.products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 rounded-lg">
                                                <AvatarImage
                                                    src={product.stocks[0]?.productPhotos[0]?.imageUrl}
                                                    alt={product.stocks[0]?.productPhotos[0]?.alt || product.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="rounded-lg">
                                                    {product.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    to={`${product.categoryId}/${product.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                    {product.description?.substring(0, 50)}
                                                    {product.description && product.description.length > 50 ? '...' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {product.categoryName || 'Không có danh mục'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {formatCurrency(getMinPrice(product.stocks))}
                                        </div>
                                        {product.stocks && product.stocks.length > 1 && (
                                            <p className="text-xs text-muted-foreground">
                                                {product.stocks.length} phiên bản
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                getTotalStock(product.stocks) > 20
                                                    ? 'default'
                                                    : getTotalStock(product.stocks) > 5
                                                        ? 'secondary'
                                                        : 'destructive'
                                            }
                                        >
                                            {getTotalStock(product.stocks)} sản phẩm
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(product.createdAt)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            bởi {product.createdBy || 'Unknown'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/admin/products/${product.categoryId}/${product.id}`}>
                                                        <Eye className="w-4 h-4 mr-2"/>
                                                        Xem chi tiết
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        to={`/admin/products/${product.categoryId}/${product.id}/edit`}>
                                                        <Pencil className="w-4 h-4 mr-2"/>
                                                        Chỉnh sửa
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(product.id, product.name)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2"/>
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Hiển thị{' '}
                            <span className="font-medium">
                                {metadata.totalElements === 0 ? 0 : metadata.currentPage * metadata.pageSize + 1}
                            </span>{' '}
                            -{' '}
                            <span className="font-medium">
                                {Math.min((metadata.currentPage + 1) * metadata.pageSize, metadata.totalElements)}
                            </span>{' '}
                            trong{' '}
                            <span className="font-medium">{metadata.totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                className={"cursor-pointer"}
                                variant="outline"
                                size="sm"
                                onClick={() => setMetadata(prev => ({
                                    ...prev,
                                    currentPage: Math.max(0, prev.currentPage - 1)
                                }))}
                                disabled={metadata.currentPage === 0}
                            >
                                <ChevronLeft className="w-4 h-4"/>
                                Trước
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(metadata.totalPage)].map((_, i) => (
                                    <Button
                                        className={"cursor-pointer " + (metadata.currentPage === i ? "underline" : "")}
                                        key={i}
                                        variant={"link"}
                                        size="sm"
                                        onClick={() => setMetadata(prev => ({...prev, currentPage: i}))}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                className={"cursor-pointer"}
                                variant="outline"
                                size="sm"
                                onClick={() => setMetadata(prev => ({
                                    ...prev,
                                    currentPage: Math.min(prev.currentPage + 1, metadata.totalPage - 1)
                                }))}
                                disabled={metadata.currentPage === metadata.totalPage - 1}
                            >
                                Sau
                                <ChevronRight className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !isErrorProducts && productsData?.products.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-muted rounded-full">
                            <Search className="w-12 h-12 text-muted-foreground"/>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm nào</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm || selectedCategory && selectedCategory !== 'all'
                                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                : 'Chưa có sản phẩm nào trong hệ thống'
                            }
                        </p>
                        {(!searchTerm && (!selectedCategory || selectedCategory === 'all')) && (
                            <Button asChild>
                                <Link to="/admin/products/create">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Thêm sản phẩm đầu tiên
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm "{deleteDialog.productName}"? Hành động này không thể
                            hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteDialog.isDeleting}
                        >
                            {deleteDialog.isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProductsPage;
