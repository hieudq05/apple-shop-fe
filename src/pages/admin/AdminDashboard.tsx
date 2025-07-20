import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Users,
    Package,
    BarChart3,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Activity,
    CreditCard,
    DollarSign,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "@/components/charts/RevenueChart";
import statisticsService from "@/services/statisticsService";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    ordersGrowth: string;
    usersGrowth: string;
    productsGrowth: string;
    revenueGrowth: string;
}

interface RevenueData {
    name: string;
    revenue: number;
    orders: number;
    date: string;
}

interface RecentActivity {
    id: string;
    type: "order" | "user" | "product";
    title: string;
    description: string;
    time: string;
    status: "success" | "warning" | "info";
}

export interface ProductSelling {
    countSold: number;
    productId: number;
    productName: string;
    categoryId: number;
}

const fetchTotalRevenue = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: number }> => {
    return statisticsService.getTotalRevenue(fromDate, toDate);
};

const fetchNumberOfOrders = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: number }> => {
    return statisticsService.getNumberOfOrders(fromDate, toDate);
};

const fetchNumberOfNewUsers = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: number }> => {
    return statisticsService.getNumberOfNewUsers(fromDate, toDate);
};

const fetchNumberOfProducts = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: number }> => {
    return statisticsService.getNumberOfProductsSold(fromDate, toDate);
};

const fetchProductSelling = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: ProductSelling[] }> => {
    return statisticsService.getTopSellingProducts(fromDate, toDate);
};

const formatFirstDayOfMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}-01T00:00`;
};

const formatLastDayOfMonth = (date: Date): string => {
    if (date.getMonth() !== new Date().getMonth()) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = new Date(year, date.getMonth() + 1, 0).getDate();
        return `${year}-${month}-${day}T23:59`;
    } else {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        ordersGrowth: "0",
        usersGrowth: "0",
        productsGrowth: "0",
        revenueGrowth: "0",
    });
    const [topSellingProducts, setTopSellingProducts] = useState<
        ProductSelling[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
        []
    );
    const [revenueChartData, setRevenueChartData] = useState<RevenueData[]>([]);
    const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");

    useEffect(() => {
        // Simulate API call to fetch dashboard stats
        const fetchStats = async () => {
            try {
                // Replace with actual API call
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const totalRevenueData = await fetchTotalRevenue(
                    formatFirstDayOfMonth(new Date()),
                    formatLastDayOfMonth(new Date())
                );

                const totalPrevRevenueData = await fetchTotalRevenue(
                    formatFirstDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    ),
                    formatLastDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    )
                );

                const totalOrdersData = await fetchNumberOfOrders(
                    formatFirstDayOfMonth(new Date()),
                    formatLastDayOfMonth(new Date())
                );

                const totalPrevOrdersData = await fetchNumberOfOrders(
                    formatFirstDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    ),
                    formatLastDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    )
                );

                const totalUsersData = await fetchNumberOfNewUsers(
                    formatFirstDayOfMonth(new Date()),
                    formatLastDayOfMonth(new Date())
                );

                const totalPrevUsersData = await fetchNumberOfNewUsers(
                    formatFirstDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    ),
                    formatLastDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    )
                );

                const totalProductsData = await fetchNumberOfProducts(
                    formatFirstDayOfMonth(new Date()),
                    formatLastDayOfMonth(new Date())
                );

                const totalPrevProductsData = await fetchNumberOfProducts(
                    formatFirstDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    ),
                    formatLastDayOfMonth(
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() - 1
                        )
                    )
                );

                const topSellingProductsData = await fetchProductSelling(
                    formatFirstDayOfMonth(new Date()),
                    formatLastDayOfMonth(new Date())
                );

                setTopSellingProducts(topSellingProductsData.data);

                // Generate chart data for the last 7 days
                const chartData: RevenueData[] = [];
                for (let i = 13; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dayStart = formatFirstDayOfMonth(date).replace(
                        "01T00:00",
                        date.getDate().toString().padStart(2, "0") + "T00:00"
                    );
                    const dayEnd = formatLastDayOfMonth(date).replace(
                        formatLastDayOfMonth(date).split("T")[0].split("-")[2],
                        date.getDate().toString().padStart(2, "0")
                    );

                    try {
                        const dayRevenue = await fetchTotalRevenue(
                            dayStart,
                            dayEnd
                        );
                        const dayOrders = await fetchNumberOfOrders(
                            dayStart,
                            dayEnd
                        );

                        chartData.push({
                            name: date.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "numeric",
                            }),
                            revenue: dayRevenue.data || 0,
                            orders: dayOrders.data || 0,
                            date: date.toISOString().split("T")[0],
                        });
                    } catch (error) {
                        console.error(
                            `Error fetching data for ${date}:`,
                            error
                        );
                        chartData.push({
                            name: date.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "numeric",
                            }),
                            revenue: 0,
                            orders: 0,
                            date: date.toISOString().split("T")[0],
                        });
                    }
                }

                setStats({
                    totalOrders: totalOrdersData.data,
                    totalUsers: totalUsersData.data,
                    totalProducts: totalProductsData.data,
                    // get total revenue from statisticsService in this month
                    totalRevenue: totalRevenueData.data,
                    ordersGrowth: (
                        ((totalOrdersData.data - totalPrevOrdersData.data) /
                            (totalPrevOrdersData.data || 1)) *
                        100
                    ).toFixed(2),
                    usersGrowth: (
                        ((totalUsersData.data - totalPrevUsersData.data) /
                            (totalPrevUsersData.data || 1)) *
                        100
                    ).toFixed(2),
                    productsGrowth: (
                        ((totalProductsData.data - totalPrevProductsData.data) /
                            (totalPrevProductsData.data || 1)) *
                        100
                    ).toFixed(2),
                    revenueGrowth: (
                        ((totalRevenueData.data - totalPrevRevenueData.data) /
                            (totalPrevRevenueData.data || 1)) *
                        100
                    ).toFixed(2),
                });

                setRevenueChartData(chartData);

                setRecentActivities([
                    {
                        id: "1",
                        type: "order",
                        title: "Đơn hàng mới #1234",
                        description:
                            "Nguyễn Văn A đã đặt đơn hàng iPhone 15 Pro",
                        time: "2 phút trước",
                        status: "success",
                    },
                    {
                        id: "2",
                        type: "user",
                        title: "Người dùng mới đăng ký",
                        description: "Trần Thị B đã tạo tài khoản mới",
                        time: "5 phút trước",
                        status: "info",
                    },
                    {
                        id: "3",
                        type: "product",
                        title: "Sản phẩm sắp hết hàng",
                        description: "iPhone 14 Pro Max chỉ còn 5 sản phẩm",
                        time: "10 phút trước",
                        status: "warning",
                    },
                ]);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    if (isLoading) {
        return (
            <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <h3 className="mt-4 text-lg font-semibold">
                        Đang tải dữ liệu...
                    </h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        Vui lòng chờ một chút
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        Xuất báo cáo
                    </Button>
                    <Button size="sm">
                        <Link
                            to="/admin/products/create"
                            className="flex items-center"
                        >
                            Tạo sản phẩm
                        </Link>
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                    <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tổng doanh thu
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.totalRevenue)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span
                                        className={`inline-flex items-center ${
                                            parseFloat(stats.revenueGrowth) >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {parseFloat(stats.revenueGrowth) >=
                                        0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        +
                                        {Math.abs(
                                            parseFloat(stats.revenueGrowth)
                                        )}
                                        %
                                    </span>{" "}
                                    so với tháng trước
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Đơn hàng
                                </CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatNumber(stats.totalOrders)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span
                                        className={`inline-flex items-center ${
                                            parseFloat(stats.ordersGrowth) >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {parseFloat(stats.ordersGrowth) >= 0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        +
                                        {Math.abs(
                                            parseFloat(stats.ordersGrowth)
                                        )}
                                        %
                                    </span>{" "}
                                    so với tháng trước
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Người dùng
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatNumber(stats.totalUsers)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span
                                        className={`inline-flex items-center ${
                                            parseFloat(stats.usersGrowth) >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {parseFloat(stats.usersGrowth) >= 0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        +
                                        {Math.abs(
                                            parseFloat(stats.usersGrowth)
                                        )}
                                        %
                                    </span>{" "}
                                    so với tháng trước
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Sản phẩm
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatNumber(stats.totalProducts)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span
                                        className={`inline-flex items-center ${
                                            parseFloat(stats.productsGrowth) >=
                                            0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {parseFloat(stats.productsGrowth) >=
                                        0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {parseFloat(stats.productsGrowth) >= 0
                                            ? "+"
                                            : ""}
                                        {stats.productsGrowth}%
                                    </span>{" "}
                                    so với tháng trước
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="col-span-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle>
                                        Biểu đồ doanh thu 7 ngày gần đây
                                    </CardTitle>
                                    <CardDescription>
                                        Doanh thu và số đơn hàng theo ngày
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={
                                            chartType === "area"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setChartType("area")}
                                    >
                                        Area
                                    </Button>
                                    <Button
                                        variant={
                                            chartType === "line"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setChartType("line")}
                                    >
                                        Line
                                    </Button>
                                    <Button
                                        variant={
                                            chartType === "bar"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setChartType("bar")}
                                    >
                                        Bar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-2">
                                {revenueChartData.length > 0 ? (
                                    <RevenueChart
                                        data={revenueChartData}
                                        type={chartType}
                                        height={300}
                                    />
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground">
                                                Đang tải dữ liệu biểu đồ...
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Hoạt động gần đây</CardTitle>
                                <CardDescription>
                                    Các hoạt động mới nhất trong hệ thống
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {recentActivities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src="/avatars/01.png"
                                                    alt="Avatar"
                                                />
                                                <AvatarFallback>
                                                    {activity.type === "order"
                                                        ? "O"
                                                        : activity.type ===
                                                          "user"
                                                        ? "U"
                                                        : "P"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                <Badge
                                                    variant={
                                                        activity.status ===
                                                        "success"
                                                            ? "default"
                                                            : activity.status ===
                                                              "warning"
                                                            ? "secondary"
                                                            : "outline"
                                                    }
                                                >
                                                    {activity.time}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card> */}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    Thao tác nhanh
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link to="/admin/products/create">
                                        <Package className="mr-2 h-4 w-4" />
                                        Thêm sản phẩm mới
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link to="/admin/orders">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Quản lý đơn hàng
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link to="/admin/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Quản lý người dùng
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    Sản phẩm bán chạy
                                </CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {topSellingProducts?.length > 0 ? (
                                        <div className="space-y-2">
                                            {topSellingProducts?.map(
                                                (product, index) => (
                                                    <Link
                                                        to={`/admin/products/${product.categoryId}/${product.productId}`}
                                                        key={product.productId}
                                                        className="flex text-sm font-medium items-center justify-between hover:underline"
                                                    >
                                                        <span>
                                                            <span className="mr-2">
                                                                {index + 1}.
                                                            </span>
                                                            {
                                                                product.productName
                                                            }
                                                        </span>
                                                        <Badge>
                                                            {formatNumber(
                                                                product.countSold
                                                            )}{" "}
                                                            sản phẩm
                                                        </Badge>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Không có sản phẩm bán chạy
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    Thông báo hệ thống
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Cập nhật bảo mật
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Vui lòng cập nhật mật khẩu
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Backup tự động
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Backup hôm nay đã hoàn thành
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân tích chi tiết</CardTitle>
                            <CardDescription>
                                Dữ liệu phân tích chi tiết về hiệu suất kinh
                                doanh
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Tính năng đang phát triển
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Phân tích chi tiết sẽ được triển khai
                                        trong phiên bản tiếp theo
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Báo cáo</CardTitle>
                            <CardDescription>
                                Tạo và quản lý các báo cáo kinh doanh
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                                <div className="text-center">
                                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Tính năng đang phát triển
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Hệ thống báo cáo sẽ được triển khai
                                        trong phiên bản tiếp theo
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
