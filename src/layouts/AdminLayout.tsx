import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Bars3Icon, 
    XMarkIcon,
    HomeIcon,
    ShoppingBagIcon,
    CubeIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
        { name: 'Sản phẩm', href: '/admin/products', icon: CubeIcon },
        { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBagIcon },
        { name: 'Người dùng', href: '/admin/users', icon: UserGroupIcon },
        { name: 'Thống kê', href: '/admin/analytics', icon: ChartBarIcon },
        { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    const isCurrentPath = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <svg height="32" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                    fill="#000000"/>
                            </svg>
                            <span className="ml-2 text-lg font-semibold">Admin</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    isCurrentPath(item.href)
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${
                                        isCurrentPath(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                    <div className="flex h-16 items-center px-4 border-b border-gray-200">
                        <svg height="32" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                fill="#000000"/>
                        </svg>
                        <span className="ml-2 text-lg font-semibold">Admin Panel</span>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    isCurrentPath(item.href)
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${
                                        isCurrentPath(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-600 lg:hidden"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        
                        <div className="flex items-center space-x-4">
                            {/* User menu */}
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user?.imageUrl ? (
                                        <img 
                                            src={user.imageUrl} 
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user?.fullName || 'Admin'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Quản trị viên
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Đăng xuất"
                                >
                                    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
