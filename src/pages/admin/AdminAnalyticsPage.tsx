import React, { useState, useEffect } from 'react';
import { 
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    EyeIcon
} from "@heroicons/react/24/outline";

interface AnalyticsData {
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
    topProducts: Array<{
        id: number;
        name: string;
        sales: number;
        revenue: number;
    }>;
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
}

const AdminAnalyticsPage: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedPeriod]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockData: AnalyticsData = {
                revenue: {
                    current: 125000000,
                    previous: 98000000,
                    growth: 27.6
                },
                orders: {
                    current: 1234,
                    previous: 987,
                    growth: 25.0
                },
                customers: {
                    current: 856,
                    previous: 743,
                    growth: 15.2
                },
                avgOrderValue: {
                    current: 101300,
                    previous: 99300,
                    growth: 2.0
                },
                topProducts: [
                    { id: 1, name: "iPhone 15 Pro", sales: 245, revenue: 71000000 },
                    { id: 2, name: "MacBook Pro 14", sales: 89, revenue: 47000000 },
                    { id: 3, name: "iPad Pro", sales: 156, revenue: 39000000 },
                    { id: 4, name: "Apple Watch Series 9", sales: 203, revenue: 20000000 },
                    { id: 5, name: "AirPods Pro", sales: 312, revenue: 18000000 }
                ],
                revenueByMonth: [
                    { month: "T1", revenue: 85000000, orders: 890 },
                    { month: "T2", revenue: 92000000, orders: 945 },
                    { month: "T3", revenue: 78000000, orders: 823 },
                    { month: "T4", revenue: 105000000, orders: 1089 },
                    { month: "T5", revenue: 98000000, orders: 987 },
                    { month: "T6", revenue: 125000000, orders: 1234 }
                ],
                ordersByStatus: [
                    { status: "Đã giao", count: 856, percentage: 69.4 },
                    { status: "Đang giao", count: 234, percentage: 19.0 },
                    { status: "Đã xác nhận", count: 89, percentage: 7.2 },
                    { status: "Chờ xử lý", count: 45, percentage: 3.6 },
                    { status: "Đã hủy", count: 10, percentage: 0.8 }
                ]
            };
            
            setAnalyticsData(mockData);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const MetricCard: React.FC<{
        title: string;
        current: number;
        previous: number;
        growth: number;
        icon: React.ReactNode;
        color: string;
        formatter?: (value: number) => string;
    }> = ({ title, current, previous, growth, icon, color, formatter = formatNumber }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatter(current)}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                {growth >= 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(growth)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">so với kỳ trước</span>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">Không thể tải dữ liệu thống kê</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua</option>
                            <option value="90d">90 ngày qua</option>
                            <option value="1y">1 năm qua</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Doanh thu"
                    current={analyticsData.revenue.current}
                    previous={analyticsData.revenue.previous}
                    growth={analyticsData.revenue.growth}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />}
                    color="bg-green-100"
                    formatter={formatCurrency}
                />
                <MetricCard
                    title="Đơn hàng"
                    current={analyticsData.orders.current}
                    previous={analyticsData.orders.previous}
                    growth={analyticsData.orders.growth}
                    icon={<ShoppingBagIcon className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-100"
                />
                <MetricCard
                    title="Khách hàng"
                    current={analyticsData.customers.current}
                    previous={analyticsData.customers.previous}
                    growth={analyticsData.customers.growth}
                    icon={<UserGroupIcon className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-100"
                />
                <MetricCard
                    title="Giá trị đơn hàng TB"
                    current={analyticsData.avgOrderValue.current}
                    previous={analyticsData.avgOrderValue.previous}
                    growth={analyticsData.avgOrderValue.growth}
                    icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />}
                    color="bg-orange-100"
                    formatter={formatCurrency}
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {analyticsData.revenueByMonth.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div 
                                    className="w-full bg-blue-500 rounded-t"
                                    style={{ 
                                        height: `${(item.revenue / Math.max(...analyticsData.revenueByMonth.map(d => d.revenue))) * 200}px` 
                                    }}
                                    title={`${item.month}: ${formatCurrency(item.revenue)}`}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                    <div className="space-y-3">
                        {analyticsData.ordersByStatus.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div 
                                        className={`w-3 h-3 rounded-full mr-3 ${
                                            index === 0 ? 'bg-green-500' :
                                            index === 1 ? 'bg-blue-500' :
                                            index === 2 ? 'bg-yellow-500' :
                                            index === 3 ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm text-gray-700">{item.status}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Sản phẩm</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Số lượng bán</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Doanh thu</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-500">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.topProducts.map((product, index) => (
                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <span className="ml-3 font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{formatNumber(product.sales)}</td>
                                    <td className="py-3 px-4 text-gray-700">{formatCurrency(product.revenue)}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-900 p-1">
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
