import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingBagIcon,
    UserGroupIcon,
    CubeIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

interface DashboardStats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    ordersGrowth: number;
    usersGrowth: number;
    productsGrowth: number;
    revenueGrowth: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        ordersGrowth: 0,
        usersGrowth: 0,
        productsGrowth: 0,
        revenueGrowth: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call to fetch dashboard stats
        const fetchStats = async () => {
            try {
                // Replace with actual API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setStats({
                    totalOrders: 1234,
                    totalUsers: 5678,
                    totalProducts: 89,
                    totalRevenue: 12345678,
                    ordersGrowth: 12.5,
                    usersGrowth: 8.3,
                    productsGrowth: -2.1,
                    revenueGrowth: 15.7
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const StatCard: React.FC<{
        title: string;
        value: string;
        growth: number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, growth, icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
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
                <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Tổng quan về hoạt động của cửa hàng</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Tổng đơn hàng"
                        value={formatNumber(stats.totalOrders)}
                        growth={stats.ordersGrowth}
                        icon={<ShoppingBagIcon className="w-6 h-6 text-blue-600" />}
                        color="bg-blue-100"
                    />
                    <StatCard
                        title="Tổng người dùng"
                        value={formatNumber(stats.totalUsers)}
                        growth={stats.usersGrowth}
                        icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
                        color="bg-green-100"
                    />
                    <StatCard
                        title="Tổng sản phẩm"
                        value={formatNumber(stats.totalProducts)}
                        growth={stats.productsGrowth}
                        icon={<CubeIcon className="w-6 h-6 text-purple-600" />}
                        color="bg-purple-100"
                    />
                    <StatCard
                        title="Doanh thu"
                        value={formatCurrency(stats.totalRevenue)}
                        growth={stats.revenueGrowth}
                        icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />}
                        color="bg-orange-100"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                        <div className="space-y-3">
                            <Link
                                to="/admin/products/create"
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <CubeIcon className="w-5 h-5 text-blue-600 mr-3" />
                                <span className="font-medium">Thêm sản phẩm mới</span>
                            </Link>
                            <Link
                                to="/admin/orders"
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <ShoppingBagIcon className="w-5 h-5 text-green-600 mr-3" />
                                <span className="font-medium">Quản lý đơn hàng</span>
                            </Link>
                            <Link
                                to="/admin/users"
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <UserGroupIcon className="w-5 h-5 text-purple-600 mr-3" />
                                <span className="font-medium">Quản lý người dùng</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 rounded-lg bg-gray-50">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Đơn hàng mới #1234</p>
                                    <p className="text-xs text-gray-500">2 phút trước</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-gray-50">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                                    <p className="text-xs text-gray-500">5 phút trước</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-gray-50">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Sản phẩm sắp hết hàng</p>
                                    <p className="text-xs text-gray-500">10 phút trước</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
                            <p className="text-sm text-gray-400">Tích hợp với thư viện chart.js hoặc recharts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
