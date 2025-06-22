import type {RouteObject} from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OtpVerificationPage from '../pages/OtpVerificationPage';
import ProductsPage from "../pages/ProductsPage.tsx";
import ProductPage from "../pages/ProductPage.tsx";
import CartPage from "../pages/CartPage.tsx";
import PaymentPage from "../pages/PaymentPage";
import ProfilePage from "../pages/ProfilePage.tsx";
import OrderHistoryPage from "../pages/OrderHistoryPage.tsx";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import CreateProductPage from "../pages/admin/CreateProductPage";
import ProductDetailPage from "../pages/admin/ProductDetailPage";
import EditProductPage from "../pages/admin/EditProductPage";
import NotFoundPage from "../pages/NotFoundPage";
import SearchPage from "../pages/SearchPage";
import SupportPage from "../pages/SupportPage";

export const routesConfig: RouteObject[] = [
    // User routes with MainLayout (only for ROLE_USER)
    {
        path: '/',
        element: (
            <ProtectedRoute requireUserOnly={true} requireAuth={false}>
                <MainLayout/>
            </ProtectedRoute>
        ),
        children: [
            {index: true, element: <HomePage/>},
            {
                path: 'products/:categoryId',
                element: <ProductsPage/>,
            },
            {
                path: 'product/:productId',
                element: <ProductPage/>,
            },
            {
                path: 'cart',
                element: <CartPage/>,
            },
            {
                path: 'payment',
                element: <PaymentPage/>,
            },
            {
                path: 'profile',
                element: <ProfilePage/>
            },
            {
                path: 'order-history',
                element: <OrderHistoryPage/>
            },
            {
                path: 'search',
                element: <SearchPage/>
            },
            {
                path: 'support',
                element: <SupportPage/>
            },
        ],
    },
    // Auth routes without layout
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        path: '/register',
        element: <RegisterPage/>,
    },
    {
        path: '/verify-otp',
        element: <OtpVerificationPage/>,
    },
    // Admin routes
    {
        path: '/admin/login',
        element: <AdminLoginPage/>,
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute requireAdminOrStaff={true}>
                <AdminLayout/>
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <AdminDashboard/>,
            },
            {
                path: 'products',
                element: <AdminProductsPage/>,
            },
            {
                path: 'products/create',
                element: <CreateProductPage/>,
            },
            {
                path: 'products/:id',
                element: <ProductDetailPage/>,
            },
            {
                path: 'products/:id/edit',
                element: <EditProductPage/>,
            },
            {
                path: 'orders',
                element: <AdminOrdersPage/>,
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute requireAdmin={true}>
                        <AdminUsersPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'analytics',
                element: <AdminAnalyticsPage/>,
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute requireAdmin={true}>
                        <AdminSettingsPage/>
                    </ProtectedRoute>
                ),
            },
        ],
    },
    // 404 catch-all route
    {
        path: '*',
        element: <NotFoundPage />
    }
];
