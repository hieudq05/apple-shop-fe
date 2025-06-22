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

export const routesConfig: RouteObject[] = [
    // User routes with MainLayout
    {
        path: '/',
        element: <MainLayout/>,
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
            <ProtectedRoute requireAdmin={true}>
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
                path: 'orders',
                element: <AdminOrdersPage/>,
            },
            // Add more admin routes here
        ],
    },
    // {
    //     path: '*',
    //     element: <NotFoundPage /> // A catch-all 404 page
    // }
];
