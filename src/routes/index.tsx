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
import OrderDetailPage from "../pages/admin/OrderDetailPage";
import UserDetailPage from "../pages/admin/UserDetailPage";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import PromotionManagementPage from "../pages/admin/PromotionManagementPage";
import BlogManagementPage from "../pages/admin/BlogManagementPage";
import CreateBlogPage from "../pages/admin/CreateBlogPage";
import BlogDetailPage from "../pages/admin/BlogDetailPage";
import EditBlogPage from "../pages/admin/EditBlogPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import JWTTestComponent from "../components/debug/JWTTestComponent";
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
            {
                path: 'blog',
                element: <BlogPage/>
            },
            {
                path: 'blog/:slug',
                element: <BlogPostPage/>
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
    // Debug route for JWT testing (remove in production)
    {
        path: '/debug/jwt-test',
        element: <JWTTestComponent/>,
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
                path: 'products/:categoryId/:id',
                element: <ProductDetailPage/>,
            },
            {
                path: 'products/:categoryId/:id/edit',
                element: <EditProductPage/>,
            },
            {
                path: 'orders',
                element: <AdminOrdersPage/>,
            },
            {
                path: 'orders/:id',
                element: <OrderDetailPage/>,
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
                path: 'users/:id',
                element: (
                    <ProtectedRoute requireAdmin={true}>
                        <UserDetailPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'categories',
                element: <CategoryManagementPage/>,
            },
            {
                path: 'promotions',
                element: <PromotionManagementPage/>,
            },
            {
                path: 'blog',
                element: <BlogManagementPage/>,
            },
            {
                path: 'blog/create',
                element: <CreateBlogPage/>,
            },
            {
                path: 'blog/:id',
                element: <BlogDetailPage/>,
            },
            {
                path: 'blog/:id/edit',
                element: <EditBlogPage/>,
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
