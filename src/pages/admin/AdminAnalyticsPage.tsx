import React, {useCallback, useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {
    BarChart3,
    Calendar as CalendarIcon,
    DollarSign,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import {RevenueChart} from "@/components/charts/RevenueChart";
import {OrderStatusPieChart} from "@/components/charts/OrderStatusPieChart";
import statisticsService from "@/services/statisticsService";
import type {ProductSelling} from "@/pages/admin/AdminDashboard";
import {Link} from "react-router-dom";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {vi} from "date-fns/locale";

export interface AnalyticsData {
    revenue: {
        current: number;
        previous: number;
        growth: number;
    };
    orders: {
        current: number;
        previous: number;
        growth: number;
    };
    customers: {
        current: number;
        previous: number;
        growth: number;
    };
    avgOrderValue: {
        current: number;
        previous: number;
        growth: number;
    };
    topProducts: ProductSelling[];
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
    ordersByStatus: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    todayOrders: {
        count: number;
        growth: number;
    };
    pendingOrders: number;
}

// Helper functions from AdminDashboard
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

const fetchProductSelling = async (
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: ProductSelling[] }> => {
    return statisticsService.getTopSellingProducts(fromDate, toDate);
};

const fetchOrdersByStatus = async (
    status: string,
    fromDate: string,
    toDate: string
): Promise<{ success: boolean; message: string; data: number }> => {
    return statisticsService.getOrdersByStatus(status, fromDate, toDate);
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

const getDateRange = (period: string) => {
    const now = new Date();
    let fromDate: Date, toDate: Date;

    switch (period) {
        case "7d":
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            toDate = now;
            break;
        case "30d":
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            toDate = now;
            break;
        case "90d":
            fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            toDate = now;
            break;
        case "1y":
            fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            toDate = now;
            break;
        default:
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            toDate = now;
    }

    return {
        fromDate: formatFirstDayOfMonth(fromDate),
        toDate: formatLastDayOfMonth(toDate),
        previousFromDate: formatFirstDayOfMonth(
            new Date(
                fromDate.getTime() - (toDate.getTime() - fromDate.getTime())
            )
        ),
        previousToDate: formatLastDayOfMonth(fromDate),
    };
};

const AdminAnalyticsPage: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("30d");
    const [customDateRange, setCustomDateRange] = useState({
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined
    });
    const [isCustomDate, setIsCustomDate] = useState(false);

    // Helper function to format date for API
    const formatDateForAPI = (date: Date | undefined, isEndDate = false): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");

        if (isEndDate) {
            return `${year}-${month}-${day}T23:59`;
        } else {
            return `${year}-${month}-${day}T00:00`;
        }
    };

    // Function to get custom date range
    const getCustomDateRange = (startDate: Date | undefined, endDate: Date | undefined) => {
        if (!startDate || !endDate) return null;

        const fromDate = formatDateForAPI(startDate);
        const toDate = formatDateForAPI(endDate, true);

        // Calculate previous period for comparison
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStart = new Date(startDate.getTime() - periodLength);
        const previousEnd = new Date(startDate.getTime());

        return {
            fromDate,
            toDate,
            previousFromDate: formatDateForAPI(previousStart),
            previousToDate: formatDateForAPI(previousEnd, true),
        };
    };

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setIsLoading(true);

            let fromDate, toDate, previousFromDate, previousToDate;

            if (isCustomDate) {
                ({fromDate, toDate, previousFromDate, previousToDate} = getCustomDateRange(
                    customDateRange.startDate,
                    customDateRange.endDate
                ));
            } else {
                ({fromDate, toDate, previousFromDate, previousToDate} = getDateRange(selectedPeriod));
            }

            // Fetch current period data
            const [currentRevenue, currentOrders, currentUsers, topProducts] =
                await Promise.all([
                    fetchTotalRevenue(fromDate, toDate),
                    fetchNumberOfOrders(fromDate, toDate),
                    fetchNumberOfNewUsers(fromDate, toDate),
                    fetchProductSelling(fromDate, toDate),
                ]);

            // Fetch previous period data for comparison
            const [previousRevenue, previousOrders, previousUsers] =
                await Promise.all([
                    fetchTotalRevenue(previousFromDate, previousToDate),
                    fetchNumberOfOrders(previousFromDate, previousToDate),
                    fetchNumberOfNewUsers(previousFromDate, previousToDate),
                ]);

            // Calculate growth percentages
            const revenueGrowth =
                previousRevenue.data > 0
                    ? parseFloat(
                        (
                            ((currentRevenue.data - previousRevenue.data) /
                                (previousRevenue.data || 1)) *
                            100
                        ).toFixed(2)
                    )
                    : 0;
            const ordersGrowth =
                previousOrders.data > 0
                    ? parseFloat(
                        (
                            ((currentOrders.data - previousOrders.data) /
                                (previousOrders.data || 1)) *
                            100
                        ).toFixed(2)
                    )
                    : 0;
            const usersGrowth =
                previousUsers.data > 0
                    ? parseFloat(
                        (
                            ((currentUsers.data - previousUsers.data) /
                                (previousUsers.data || 1)) *
                            100
                        ).toFixed(2)
                    )
                    : 0;
            const avgOrderValueCurrent =
                currentOrders.data > 0
                    ? currentRevenue.data / currentOrders.data
                    : 0;
            const avgOrderValuePrevious =
                previousOrders.data > 0
                    ? previousRevenue.data / previousOrders.data
                    : 0;
            const avgOrderValueGrowth =
                avgOrderValuePrevious > 0
                    ? parseFloat(
                        (
                            ((avgOrderValueCurrent - avgOrderValuePrevious) /
                                (avgOrderValuePrevious || 1)) *
                            100
                        ).toFixed(2)
                    )
                    : 0;

            // Generate revenue by month data for the last 6 months
            const revenueByMonth = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStart = formatFirstDayOfMonth(date);
                const monthEnd = formatLastDayOfMonth(date);

                try {
                    const monthRevenue = await fetchTotalRevenue(
                        monthStart,
                        monthEnd
                    );
                    const monthOrders = await fetchNumberOfOrders(
                        monthStart,
                        monthEnd
                    );

                    revenueByMonth.push({
                        month: `T${date.getMonth() + 1}`,
                        revenue: monthRevenue.data || 0,
                        orders: monthOrders.data || 0,
                    });
                } catch (error) {
                    console.error(`Error fetching data for month ${i}:`, error);
                    revenueByMonth.push({
                        month: `T${date.getMonth() + 1}`,
                        revenue: 0,
                        orders: 0,
                    });
                }
            }

            // Fetch orders by status data from API
            const orderStatuses = [
                {key: "DELIVERED", name: "Đã giao"},
                {key: "SHIPPED", name: "Đang giao"},
                {key: "PROCESSING", name: "Đã xác nhận, đang xử lý"},
                {key: "PENDING_PAYMENT", name: "Chờ thanh toán"},
                {key: "CANCELLED", name: "Đã hủy"},
            ];

            const ordersByStatusPromises = orderStatuses.map((status) =>
                fetchOrdersByStatus(status.key, fromDate, toDate)
                    .then((response) => ({
                        status: status.name,
                        count: response.data,
                    }))
                    .catch((error) => {
                        console.error(
                            `Error fetching ${status.key} orders:`,
                            error
                        );
                        return {status: status.name, count: 0};
                    })
            );

            const ordersByStatusResults = await Promise.all(
                ordersByStatusPromises
            );
            const totalOrdersForPercentage = ordersByStatusResults.reduce(
                (sum, item) => sum + item.count,
                0
            );

            const ordersByStatus = ordersByStatusResults.map((item) => ({
                status: item.status,
                count: item.count,
                percentage:
                    totalOrdersForPercentage > 0
                        ? parseFloat(
                            (
                                (item.count / totalOrdersForPercentage) *
                                100
                            ).toFixed(1)
                        )
                        : 0,
            }));

            // Fetch additional order metrics for the orders tab
            const today = new Date();
            const todayStart = `${today.getFullYear()}-${(today.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${today
                .getDate()
                .toString()
                .padStart(2, "0")}T00:00`;
            const todayEnd = `${today.getFullYear()}-${(today.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${today
                .getDate()
                .toString()
                .padStart(2, "0")}T23:59`;

            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const yesterdayStart = `${yesterday.getFullYear()}-${(
                yesterday.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${yesterday
                .getDate()
                .toString()
                .padStart(2, "0")}T00:00`;
            const yesterdayEnd = `${yesterday.getFullYear()}-${(
                yesterday.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${yesterday
                .getDate()
                .toString()
                .padStart(2, "0")}T23:59`;

            const [todayOrders, yesterdayOrders, pendingOrders] =
                await Promise.all([
                    fetchNumberOfOrders(todayStart, todayEnd).catch(() => ({
                        data: 0,
                    })),
                    fetchNumberOfOrders(yesterdayStart, yesterdayEnd).catch(
                        () => ({data: 0})
                    ),
                    fetchOrdersByStatus(
                        "PENDING_PAYMENT",
                        fromDate,
                        toDate
                    ).catch(() => ({data: 0})),
                ]);

            const todayOrdersGrowth =
                yesterdayOrders.data > 0
                    ? parseFloat(
                        (
                            ((todayOrders.data - yesterdayOrders.data) /
                                yesterdayOrders.data) *
                            100
                        ).toFixed(1)
                    )
                    : 0;

            const analyticsData: AnalyticsData = {
                revenue: {
                    current: currentRevenue.data,
                    previous: previousRevenue.data,
                    growth: revenueGrowth,
                },
                orders: {
                    current: currentOrders.data,
                    previous: previousOrders.data,
                    growth: ordersGrowth,
                },
                customers: {
                    current: currentUsers.data,
                    previous: previousUsers.data,
                    growth: usersGrowth,
                },
                avgOrderValue: {
                    current: avgOrderValueCurrent,
                    previous: avgOrderValuePrevious,
                    growth: avgOrderValueGrowth,
                },
                topProducts: topProducts.data,
                revenueByMonth,
                ordersByStatus,
                todayOrders: {
                    count: todayOrders.data,
                    growth: todayOrdersGrowth,
                },
                pendingOrders: pendingOrders.data,
            };

            setAnalyticsData(analyticsData);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod, customDateRange, isCustomDate]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    console.log(analyticsData)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    const MetricCard: React.FC<{
        title: string;
        current: number;
        previous: number;
        growth: number;
        icon: React.ReactNode;
        formatter?: (value: number) => string;
    }> = ({title, current, growth, icon, formatter = formatNumber}) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatter(current)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                    {growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1"/>
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1"/>
                    )}
                    <span
                        className={`${
                            growth >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {growth >= 0 ? "+" : ""}
                        {growth}%
                    </span>
                    <span className="ml-1">so với kỳ trước</span>
                </p>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Analytics
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-24 animate-pulse mb-2"></div>
                                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">
                            Không thể tải dữ liệu thống kê
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Doanh thu"
                        current={analyticsData.revenue.current}
                        previous={analyticsData.revenue.previous}
                        growth={analyticsData.revenue.growth}
                        icon={
                            <DollarSign className="h-4 w-4 text-muted-foreground"/>
                        }
                        formatter={formatCurrency}
                    />
                    <MetricCard
                        title="Đơn hàng"
                        current={analyticsData.orders.current}
                        previous={analyticsData.orders.previous}
                        growth={analyticsData.orders.growth}
                        icon={
                            <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                        }
                    />
                    <MetricCard
                        title="Khách hàng"
                        current={analyticsData.customers.current}
                        previous={analyticsData.customers.previous}
                        growth={analyticsData.customers.growth}
                        icon={<Users className="h-4 w-4 text-muted-foreground"/>}
                    />
                    <MetricCard
                        title="Giá trị đơn hàng TB"
                        current={analyticsData.avgOrderValue.current}
                        previous={analyticsData.avgOrderValue.previous}
                        growth={analyticsData.avgOrderValue.growth}
                        icon={
                            <BarChart3 className="h-4 w-4 text-muted-foreground"/>
                        }
                        formatter={formatCurrency}
                    />
                </div>

                {/* Date Selection Controls */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Chọn khoảng thời gian</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    id="preset"
                                    name="dateMode"
                                    checked={!isCustomDate}
                                    onChange={() => setIsCustomDate(false)}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="preset">Chọn nhanh</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    id="custom"
                                    name="dateMode"
                                    checked={isCustomDate}
                                    onChange={() => setIsCustomDate(true)}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="custom">Tùy chỉnh</Label>
                            </div>
                        </div>

                        {!isCustomDate ? (
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                                <Select
                                    value={selectedPeriod}
                                    onValueChange={setSelectedPeriod}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7d">7 ngày qua</SelectItem>
                                        <SelectItem value="30d">30 ngày qua</SelectItem>
                                        <SelectItem value="90d">90 ngày qua</SelectItem>
                                        <SelectItem value="1y">1 năm qua</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="flex flex-col xl:flex-row xl:items-end gap-4">
                                <div className="space-y-2">
                                    <Label>Ngày bắt đầu</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !customDateRange.startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {customDateRange.startDate ? (
                                                    format(customDateRange.startDate, "PPP", {locale: vi})
                                                ) : (
                                                    <span>Chọn ngày bắt đầu</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={customDateRange.startDate}
                                                onSelect={(date) => setCustomDateRange(prev => ({
                                                    ...prev,
                                                    startDate: date
                                                }))}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kết thúc</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !customDateRange.endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {customDateRange.endDate ? (
                                                    format(customDateRange.endDate, "PPP", {locale: vi})
                                                ) : (
                                                    <span>Chọn ngày kết thúc</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={customDateRange.endDate}
                                                onSelect={(date) => setCustomDateRange(prev => ({
                                                    ...prev,
                                                    endDate: date
                                                }))}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    date < new Date("1900-01-01") ||
                                                    (customDateRange.startDate && date < customDateRange.startDate)
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button
                                    onClick={() => {
                                        if (customDateRange.startDate && customDateRange.endDate) {
                                            fetchAnalyticsData();
                                        }
                                    }}
                                    disabled={!customDateRange.startDate || !customDateRange.endDate}
                                    className="w-full md:w-auto"
                                >
                                    <CalendarIcon className="w-4 h-4 mr-2"/>
                                    Áp dụng
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analytics */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                    <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                    <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Revenue Chart */}
                        <Card className={"col-span-4"}>
                            <CardHeader>
                                <CardTitle>Doanh thu theo tháng</CardTitle>
                                <CardDescription>
                                    Biểu đồ doanh thu 6 tháng gần đây
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart
                                    data={analyticsData.revenueByMonth.map(
                                        (item) => ({
                                            name: item.month,
                                            revenue: item.revenue,
                                            orders: item.orders,
                                            date: `2024-${item.month
                                                .substring(1)
                                                .padStart(2, "0")}-01`,
                                        })
                                    )}
                                    type="area"
                                    height={300}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết doanh thu</CardTitle>
                            <CardDescription>
                                Phân tích chi tiết về doanh thu và xu hướng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueChart
                                data={analyticsData.revenueByMonth.map(
                                    (item) => ({
                                        name: item.month,
                                        revenue: item.revenue,
                                        orders: item.orders,
                                        date: `2024-${item.month
                                            .substring(1)
                                            .padStart(2, "0")}-01`,
                                    })
                                )}
                                type="bar"
                                height={400}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm bán chạy</CardTitle>
                            <CardDescription>
                                Top sản phẩm có doanh thu cao nhất
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.topProducts.map(
                                    (product, index) => (
                                        <Link
                                            to={`/admin/products/${product.categoryId}/${product.productId}`}
                                            key={product.productId}
                                            className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarFallback
                                                        className={`font-medium ${
                                                            index === 0
                                                                ? "bg-blue-600 text-white"
                                                                : index === 1
                                                                    ? "bg-blue-400 text-white"
                                                                    : index === 2
                                                                        ? "bg-blue-200 text-blue-600"
                                                                        : "text-primary"
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {product.productName}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">
                                                        ID sản phẩm:{" "}
                                                        {product.productId}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="">
                                                    {formatNumber(
                                                        product.countSold
                                                    )}{" "}
                                                    đã bán
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Order Status Pie Chart */}
                        <OrderStatusPieChart
                            data={analyticsData.ordersByStatus}
                        />

                        {/* Order Statistics Summary */}
                        <div className="space-y-4 grid-cols-2 grid gap-4 h-fit">
                            <Card className={"h-full col-span-2 pb-0"}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Đơn hàng hôm nay
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatNumber(analyticsData.todayOrders.count)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <span
                                            className={`${
                                                analyticsData.todayOrders.growth >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {analyticsData.todayOrders.growth >= 0 ? "+" : ""}
                                            {analyticsData.todayOrders.growth}%
                                        </span>{" "}
                                        so với hôm qua
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className={"h-full pb-0"}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tỷ lệ giao hàng thành công
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.ordersByStatus[0].percentage}%
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={"h-full pb-0"}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tỷ lệ huỷ đơn
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.ordersByStatus[1].percentage}%
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className={"h-full pb-0"}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tỷ lệ đơn hàng đang chờ xử lý
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.ordersByStatus[2].percentage}%
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className={"h-full pb-0"}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tỷ lệ đơn hàng đã thanh toán
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.ordersByStatus[3].percentage}%
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminAnalyticsPage;
